# オフライン Outbox パターン実装ガイド

## 概要

このドキュメントは、生活介護ケース記録アプリケーションに実装されたオフライン-first Outbox パターンの設計、使用方法、テスト手順を説明します。

**目標**: ネットワーク接続が不安定な環境でも、ユーザーがフォーム操作を失わないようにする。

---

## アーキテクチャ

### パターン: Outbox

操作をサーバに送信する代わり、まずローカル IndexedDB にキュー化します：

```
入力 → Draft保存 → 送信ボタン → Outbox登録 → 同期試行
  ↓                                            ↓
IndexedDB draft                            (成功)
  (debounce 500ms)                    サーバ永続化
                                             ↓
                                      Draft削除
```

**利点**:
- ✅ オフライン時に操作を失わない
- ✅ 送信失敗時の自動リトライ可能
- ✅ UI は即座に反応（楽観的更新）
- ✅ 重複送信を自動防止（デデュプリケーション）

---

## IndexedDB スキーマ

### Database: `juushin-care-offline` (v1)

#### Object Store 1: `case_record_drafts`

下書きフォーム状態を永続化。ユーザーが入力途中のデータを保存します。

```typescript
{
  key: "draft_serviceId_userId_date",     // キー（一意）
  data: ATCaseRecord,                      // フォーム全体
  updatedAt: 1705324800000,                // タイムスタンプ(ms)
}

// 例
{
  key: "draft_life-care_A-T_2024-01-15",
  data: {
    date: "2024-01-15",
    mainStaff: "太郎",
    subStaff: "花子",
    // ... その他フォームデータ
  },
  updatedAt: 1705324800000,
}
```

**Index**: `createdAt` (時系列取得用)

#### Object Store 2: `outbox_ops`

送信待ちの操作をキューイング。

```typescript
{
  opId: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  dedupeKey: "life-care_A-T_2024-01-15",         // 重複排除キー
  operationType: "upsert_case_record",            // 操作タイプ
  payload: ATCaseRecord,                          // 送信するデータ
  status: "pending" | "done" | "failed",          // 状態
  attempts: 0,                                    // リトライ回数
  lastError?: "Network timeout",                  // 最終エラー
  createdAt: 1705324800000,
  updatedAt: 1705324865000,
}
```

**Indices**:
- `status` (pending/done/failed で検索)
- `dedupeKey` (重複防止)
- `createdAt` (FIFO順序)

#### Object Store 3: `meta`

同期メタデータ。

```typescript
{
  key: "sync_meta",
  lastSyncAt: 1705325000000,
  isOnline: true,
}
```

---

## 操作フロー

### 1. Draft 自動保存

**トリガー**: フォーム入力変更

```typescript
// フォーム内
const debouncedSave = (newRecord: ATCaseRecord) => {
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current)
  }
  debounceTimerRef.current = setTimeout(() => {
    autosaveDraft(serviceId, userId, initialDate, newRecord)
  }, 500)  // 500ms デバウンス
}

// 入力フィールド
onChange={e => {
  const newRec = { ...record, mainStaff: e.target.value }
  setRecord(newRec)
  debouncedSave(newRec)
}}
```

**処理**:
1. `autosaveDraft()` が IndexedDB の `case_record_drafts` に書き込み
2. 既存 draft があれば上書き
3. 500ms のデバウンスで頻繁な保存を抑止

### 2. Draft 復元

**トリガー**: フォームマウント

```typescript
useEffect(() => {
  (async () => {
    const restored = await restoreDraft(serviceId, userId, initialDate)
    if (restored) {
      setRecord(restored)
      setDraftRestored(true)  // UI 表示
    }
  })()
}, [serviceId, userId, initialDate])
```

**処理**:
1. マウント時に IndexedDB から draft を検索
2. あれば フォーム state にロード
3. UI に「下書き復元済」バッジ表示

### 3. Outbox 登録 & 同期試行

**トリガー**: 保存ボタンクリック

```typescript
const handleSave = async () => {
  setIsSaving(true)
  try {
    // ① Outbox に登録
    const opId = await enqueueUpsertCaseRecord({
      serviceId,
      userId,
      date: initialDate,
      payload: record,
    })

    // ② オンラインなら即座同期試行
    if (isOnline) {
      const result = await syncOutbox()
      console.log(`${result.synced}件送信, ${result.failed}件失敗`)
    }

    // ③ Draft クリア
    await removeDraft(serviceId, userId, initialDate)

    // ④ UI 更新
    const pending = await getPendingOps()
    setPendingCount(pending.length)

    onSave?.(record)
  } catch (err) {
    alert("保存に失敗しました")
  } finally {
    setIsSaving(false)
  }
}
```

**処理**:
1. `enqueueUpsertCaseRecord()` で operation を作成
2. dedupeKey (`${serviceId}_${userId}_${date}`) で既存操作と比較
3. 同じキーなら上書き（重複なし）
4. オンラインなら `syncOutbox()` で即送信試行
5. 成功なら operation を "done" にマーク
6. 失敗なら "failed" に状態変更 + 手動同期待機

### 4. オンライン復帰時の自動同期

**トリガー**: オンラインイベント

```typescript
useEffect(() => {
  if (!isOnline || !isInitialized) return

  const performSync = async () => {
    try {
      const result = await syncOutbox()
      setLastSyncTime(new Date().toLocaleTimeString())
    } catch (err) {
      console.error("Auto-sync failed", err)
    }
  }

  // 1秒待機後同期（他処理と重複回避）
  const timer = setTimeout(performSync, 1000)
  return () => clearTimeout(timer)
}, [isOnline, isInitialized])
```

**処理**:
1. ネットワークがオフライン → オンライン に戻る
2. 1秒待機（他の復帰処理を避ける）
3. `syncOutbox()` で pending 操作をすべて送信
4. 成功/失敗を個別追跡
5. UI に「最終同期: HH:MM:SS」表示

### 5. 手動同期

**トリガー**: ユーザーが「手動同期」ボタンクリック

```typescript
const handleManualSync = async () => {
  if (!isOnline) {
    alert("オンラインになってから同期してください")
    return
  }

  setIsSaving(true)
  try {
    const result = await syncOutbox()
    alert(`同期完了: ${result.synced}件送信, ${result.failed}件失敗`)
    const pending = await getPendingOps()
    setPendingCount(pending.length)
  } finally {
    setIsSaving(false)
  }
}
```

---

## 重複排除（Deduplication）

### 仕組み

同じユーザー・日付での複数の保存操作を 1 つに統合します。

**Dedup Key**: `${serviceId}_${userId}_${date}`

---

## サーバー冪等性 (Idempotency)

- **op単位**: `opId` を必須化し、`offline_op_receipts` に `payload_hash` 付きで insert → 重複は `applied/processing/failed` を返却。
- **リクエスト単位**: HTTP `Idempotency-Key` (または body.syncRequestId) を `api_idempotency_keys` に保存。ペイロードが同一ならキャッシュレスポンスを返し、異なる場合は 409。
- **ハッシュ**: `sha256(stableStringify(payload))` を保存し、同じ `opId` で payload が違う場合は 409 (Idempotency-Key 標準挙動)。

### レスポンス挙動

| HTTP | 条件 |
| --- | --- |
| 200 | 新規適用 or `already_applied` (同一 `opId` を再送) |
| 202 | 既存 receipt が `processing` のため待機 |
| 409 | 同一 `opId` / `Idempotency-Key` で payload が不一致 |

### PowerShell 検証例

```powershell
$syncRequestId = [guid]::NewGuid().ToString()
$body = @{
  syncRequestId = $syncRequestId
  deviceId = "dev-lab-01"
  ops = @(
    @{
      opId = [guid]::NewGuid().ToString()
      dedupeKey = "life_A-T_2025-01-17"
      serviceId = "life"
      userId = "A・T"
      recordDate = "2025-01-17"
      operationType = "upsert_case_record"
      payload = @{
        date = "2025-01-17"
        bodyTemperatures = @(36.5)
        hydrations = @(@{ type = "お茶"; amount = 200 })
        excretions = @(@{ urinationCount = 1 })
        lunch = @{}
        snack = @{}
        restraint = @{}
      }
    }
  )
} | ConvertTo-Json -Depth 8

Invoke-WebRequest \
  -Uri "http://localhost:3000/api/case-records/offline-upsert" \
  -Method POST \
  -Headers @{"Content-Type" = "application/json"; "Idempotency-Key" = $syncRequestId} \
  -Body $body
```

```typescript
// 1 回目の保存（2024-01-15）
await enqueueUpsertCaseRecord({
  serviceId: "life-care",
  userId: "A-T",
  date: "2024-01-15",
  payload: record1,  // { mainStaff: "太郎", ... }
})
// → Outbox に op1 作成（dedupeKey: "life-care_A-T_2024-01-15"）

// 2 回目の保存（同じ日付）
await enqueueUpsertCaseRecord({
  serviceId: "life-care",
  userId: "A-T",
  date: "2024-01-15",
  payload: record2,  // { mainStaff: "花子", ... } ← 変更あり
})
// → dedupeKey が一致 → op1 のペイロードを record2 に上書き
// → Outbox に 1 件のみ（最新データで）
```

**メリット**:
- ✅ API 呼び出し数削減
- ✅ サーバ側の重複処理不要
- ✅ 複数回操作を自動統合

---

## API エンドポイント

### POST `/api/case-records/offline-upsert`

Outbox から送信された操作をサーバで処理。

**リクエスト**:

```json
{
  "record": {
    "date": "2024-01-15",
    "mainStaff": "太郎",
    "subStaff": "花子",
    // ... ATCaseRecord フィールド
  },
  "metadata": {
    "serviceId": "life-care",
    "userId": "A-T"
  }
}
```

**レスポンス（成功）**:

```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "date": "2024-01-15",
    // ... 永続化されたレコード
  }
}
```

**レスポンス（失敗）**:

```json
{
  "ok": false,
  "error": "Database connection failed",
  "message": "Cannot reach database"
}
```

**実装予定**:
- [ ] Supabase への upsert（date と userId をキー）
- [ ] 競合時の Last-Write-Wins
- [ ] audit log 記録

---

## 使用例

### シンプルな使用

```typescript
import { ATCaseRecordForm } from "@/components/at-case-record-form"

export default function Page() {
  return (
    <ATCaseRecordForm
      date="2024-01-15"
      serviceId="life-care"
      userId="A-T"
      onSave={(record) => console.log("Saved:", record)}
      onCancel={() => router.back()}
    />
  )
}
```

### 手動で操作

```typescript
import { enqueueUpsertCaseRecord, syncOutbox, getPendingOps } from "@/lib/offline"

// 1. 操作を登録
const opId = await enqueueUpsertCaseRecord({
  serviceId: "life-care",
  userId: "A-T",
  date: "2024-01-15",
  payload: myRecord,
})

// 2. pending 操作を確認
const pending = await getPendingOps()
console.log(`${pending.length} 件が未送信`)

// 3. 同期を実行
const result = await syncOutbox()
console.log(`${result.synced} 件送信, ${result.failed} 件失敗`)
```

---

## テスト手順（DevTools 使用）

### テスト 1: Draft 保存

1. **セットアップ**
   - ブラウザ F12 → DevTools 開く
   - Network タブで Offline に切り替え

2. **テスト実行**
   - A・T ケース記録フォームを開く
   - 「担当①」に「太郎」と入力
   - 500ms 待機

3. **確認**
   - F12 → Storage → IndexedDB
   - `juushin-care-offline` → `case_record_drafts` を開く
   - ✅ キーに `draft_life-care_A-T_<date>` があり、data に「太郎」が含まれている

### テスト 2: Draft 復元

1. **セットアップ**
   - テスト 1 を完了
   - ページをリロード（F5）

2. **テスト実行**
   - フォーム再表示
   - 「担当①」フィールドを確認

3. **確認**
   - ✅ 「太郎」が自動復元されている
   - ✅ ステータスバナーに「下書き復元済」バッジ表示

### テスト 3: Outbox キューイング

1. **セットアップ**
   - Network を Offline 継続
   - フォームに数値入力（体温など）

2. **テスト実行**
   - 保存ボタンをクリック
   - アラートは表示されず、フォーム保持

3. **確認**
   - Storage → `outbox_ops` を開く
   - ✅ opId をキーに、status が "pending" の操作が存在
   - ✅ payload にフォームデータが含まれている
   - ✅ ステータスバナーに「未送信: 1件」表示

### テスト 4: オンライン復帰同期

1. **セットアップ**
   - テスト 3 を完了（pending 操作が存在）

2. **テスト実行**
   - DevTools Network タブを Online に戻す
   - ページ reload なし、1-2 秒待機

3. **確認**
   - Console を確認
   - ✅ `[ATCaseRecordForm] Auto-syncing on online recovery...` ログ
   - ✅ Sync result: `{ synced: 1, failed: 0, ... }`
   - ✅ ステータスバナーの「未送信: 0件」に変更
   - ✅ Storage → `outbox_ops` で status が "done" に変更

### テスト 5: 手動同期

1. **セットアップ**
   - テスト 3 で pending 操作を複数作成（複数データ入力・保存）

2. **テスト実行**
   - Online 状態で「手動同期」ボタンをクリック

3. **確認**
   - ✅ alert で「同期完了: 3件送信, 0件失敗」表示
   - ✅ 未送信件数が 0 に

### テスト 6: Deduplication

1. **セットアップ**
   - Offline に切り替え

2. **テスト実行**
   - フォーム「担当①」に「太郎」入力 → 保存
   - フォーム「担当①」に「花子」に変更 → 保存
   - フォーム「担当①」に「次郎」に変更 → 保存

3. **確認**
   - Storage → `outbox_ops` を開く
   - ✅ opId が 1 つのみ（dedupeKey で統合）
   - ✅ payload の mainStaff は「次郎」（最新上書き）

---

## トラブルシューティング

### Q: Draft が保存されない

**原因**: IndexedDB が無効化されている、または quota 超過

**対処**:
```javascript
// Console で確認
await (await (await import("./lib/offline/db")).initDB()).close()
// エラーなら OK
```

### Q: 同期が自動で始まらない

**原因**: `useOnlineStatus` が初期化中、または `isInitialized` が false

**対処**:
```javascript
// Console で確認
const { isOnline, isInitialized } = await import("./lib/hooks/useOnlineStatus").then(m => m.useOnlineStatus())
console.log({ isOnline, isInitialized })
```

### Q: API エラー「404 Not Found」

**原因**: `/api/case-records/offline-upsert` エンドポイントが未実装

**対処**: エンドポイント実装を確認
```bash
ls -la app/api/case-records/offline-upsert/route.ts
```

---

## 将来の拡張（Out of Scope）

❌ **Service Worker Background Sync**
- デバイスオフライン状態が長く続く場合の再同期
- 今後の実装検討

❌ **リビジョン競合解決**
- 複数クライアントが同じレコードを編集した場合の検出
- 現在は Last-Write-Wins で単純に上書き

❌ **部分同期**
- ユーザーが個別操作をスキップして他を同期
- MVP では全 pending 一括同期

❌ **Offline-first UI**
- リアルタイムコラボレーション表示
- CRDTs (Conflict-free Replicated Data Types) 
- 今後の複雑化に応じて検討

---

## ファイル構成

```
lib/offline/
├── types.ts                 # OutboxOp, CaseRecordDraft, SyncMeta
├── db.ts                    # IndexedDB CRUD (300+ lines)
├── drafts.ts                # Draft 管理ヘルパー
├── outbox.ts                # Operation キューイング
└── sync.ts                  # 同期ロジック

lib/hooks/
└── useOnlineStatus.ts       # Online/offline state tracking

app/api/case-records/
└── offline-upsert/
    └── route.ts             # Offline operation 受け取り API

components/
├── at-case-record-form.tsx  # オフライン対応フォーム
└── at-case-record-form-offline.tsx  # 同じ（移行中）
```

---

## まとめ

Outbox パターンは、ネットワーク不安定な環境でのユーザー体験を大幅に改善します。

**実装の特徴**:
- ✅ **MVP スコープ**: 最小限の実装で最大効果
- ✅ **自動デデュプリケーション**: 重複送信なし
- ✅ **graceful degradation**: オフラインでも入力可能
- ✅ **自動同期**: オンライン復帰時に自動追いつき
- ✅ **UI フィードバック**: 送信状態を可視化

**次のステップ**:
1. /api/case-records/offline-upsert の本実装（Supabase upsert）
2. エラーハンドリングの強化
3. 大量データ（100+ pending）の性能テスト
4. offline-first UI の構築（CRDTs など）

---

*最終更新: 2024-01-17*
