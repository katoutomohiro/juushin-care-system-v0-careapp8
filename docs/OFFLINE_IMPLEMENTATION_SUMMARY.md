# オフライン対応実装完了報告

## 実装内容

### ✅ 完成した機能

#### 1. **IndexedDB ストレージ層** (`lib/offline/db.ts`)
- 3つのオブジェクトストア構築：
  - `case_record_drafts`: フォーム下書きの保存
  - `outbox_ops`: 未送信操作のキューイング
  - `meta`: 同期メタデータ

#### 2. **Draft 管理** (`lib/offline/drafts.ts`)
- `autosaveDraft()`: 入力変更で自動保存（debounce 500ms）
- `restoreDraft()`: マウント時に下書き復元
- `removeDraft()`: 保存完了後にクリア

#### 3. **Outbox キューイング** (`lib/offline/outbox.ts`)
- `enqueueUpsertCaseRecord()`: 操作登録（自動デデュプリケーション）
- `getPendingOps()`: 未送信操作一覧取得
- `updateOpStatus()`: 送信状態更新（成功/失敗）

#### 4. **同期ロジック** (`lib/offline/sync.ts`)
- `syncOutbox()`: メイン同期ループ
  - pending操作をAPI送信
  - 成功/失敗を個別追跡
  - エラー時の個別処理
- ネットワークエラー時も他の操作を継続

#### 5. **オンライン状態管理** (`lib/hooks/useOnlineStatus.ts`)
- `useOnlineStatus()` フック
- window イベント + IndexedDB で状態持続
- コンポーネントの再マウント後も状態保持

#### 6. **A・Tケース記録フォーム（オフライン対応版）**
(`components/at-case-record-form-offline.tsx`)

**自動機能:**
- ✅ マウント時に Draft を復元
- ✅ 入力変更で debounce 500ms 後に自動保存
- ✅ オンライン復帰時に自動同期開始（1秒待機）

**UI インジケーター:**
- ✅ ステータスバナー（オンライン/オフライン表示）
- ✅ 下書き復元済みバッジ
- ✅ 未送信件数表示
- ✅ 最終同期時刻表示
- ✅ 手動同期ボタン（オンライン時のみ有効）

**フォーム統合:**
- ✅ すべての入力フィールドで debounce 自動保存
- ✅ 保存時に Outbox 登録 + 即座同期試行
- ✅ Draft クリア + pending 件数更新

#### 7. **API エンドポイント**
(`app/api/case-records/offline-upsert/route.ts`)
- POST /api/case-records/offline-upsert
- オフラインキュー化されたレコードを受け取り
- 現在は stub（ログ出力 + 200 返却）
- 実装可能：Supabase upsert 等

---

## 使用方法

### フォームの利用

```typescript
// components/at-case-record-form-offline.tsx をインポート
import { ATCaseRecordForm } from "@/components/at-case-record-form-offline"

// 使用例
<ATCaseRecordForm
  date={currentDate}
  serviceId="life-care"
  userId="A-T"
  onSave={(record) => console.log("Saved:", record)}
  onCancel={() => router.back()}
/>
```

### 手動で Outbox を操作

```typescript
import { enqueueUpsertCaseRecord, getPendingOps, syncOutbox } from "@/lib/offline"

// 操作を登録
const opId = await enqueueUpsertCaseRecord({
  serviceId: "life-care",
  userId: "A-T",
  date: "2024-01-15",
  payload: record,
})

// 未送信操作を確認
const pending = await getPendingOps()
console.log(`${pending.length} 件が未送信`)

// 同期を開始
const result = await syncOutbox()
console.log(`${result.synced} 件送信, ${result.failed} 件失敗`)
```

---

## 設計特性

### MVP スコープ内

✅ **Outbox パターン**: 操作をローカルキューイング
✅ **LWW 競合解決**: 最後の書き込みが勝つ（デデュプリケーション key）
✅ **自動デデュプリケーション**: 同じキー(serviceId+userId+date)で重複無し
✅ **IndexedDB**: 永続ストレージ（ブラウザネイティブ）
✅ **Graceful Degradation**: オフラインで操作可能、オンライン時に追いつく

### 除外（将来の拡張）

❌ Service Worker Background Sync
❌ リビジョン/タイムスタンプ競合解決
❌ 部分同期（全 pending を毎回送信）
❌ Selective sync UI（ユーザーが件数単位で選択）

---

## IndexedDB スキーマ

```typescript
// case_record_drafts
{
  key: "draft_serviceId_userId_date",
  data: ATCaseRecord,
  updatedAt: number (timestamp),
}

// outbox_ops
{
  opId: string,           // UUID
  dedupeKey: string,      // "serviceId_userId_date"
  operationType: "upsert_case_record",
  payload: ATCaseRecord,
  status: "pending" | "done" | "failed",
  attempts: number,
  errors: string[],
  createdAt: number,
}

// meta
{
  key: "sync_meta",
  lastSyncAt: number,
  isOnline: boolean,
}
```

---

## テスト手順（Manual）

### オフライン Draft 保存
1. DevTools > Network > Offline を選択
2. A・T ケース記録フォームで入力
3. 500ms 待機
4. F12 > Storage > IndexedDB > case_record_drafts を確認
5. ✅ データが保存されていることを確認

### オンライン復帰同期
1. DevTools > Online に戻す
2. ページ reload せず待機（1秒）
3. Console に "Auto-syncing on online recovery..." を確認
4. ✅ Sync result が表示される

### 手動同期
1. Outbox に未送信がある状態
2. ステータスバナーの「手動同期」をクリック
3. ✅ alert で "同期完了: X件送信, Y件失敗" が表示

### Deduplication
1. 同じ date で 2 回保存
2. Outbox に 1 件のみ存在確認
3. ✅ 2 回目の保存が 1 回目を置き換える

---

## 現状

| Phase | 項目 | 状態 |
|-------|------|------|
| 1 | 500 エラー削減 | ✅ 完了 |
| 2 | UI 統一化 | ✅ 完了 |
| 3 | オフライン インフラ | ✅ 完了 |
| 3 | フォーム統合 | ✅ 完了（at-case-record-form-offline.tsx） |
| 4 | ページ統合 | 🔄 進行中 |
| 5 | Lint/Typecheck | ⏳ 次 |
| 6 | ドキュメント | ⏳ 次 |

---

## 次のステップ

### 統合確認
- [ ] ページ(services/.../page.tsx)でoffline版フォーム使用
- [ ] draft復元・自動保存・同期の動作確認
- [ ] ブラウザ DevTools でIndexedDB確認

### Lint/Typecheck
- [ ] `pnpm lint` 実行 → 0 errors確認
- [ ] `pnpm typecheck` 実行 → 0 errors確認

### ドキュメント
- [ ] docs/OFFLINE_OUTBOX.md 作成
  - 設計目標・制約事項
  - API仕様
  - テスト手順

---

## ファイル一覧

```
lib/
  offline/
    types.ts          - OutboxOp, CaseRecordDraft, SyncMeta インターフェース
    db.ts             - IndexedDB CRUD オペレーション
    drafts.ts         - Draft 管理ヘルパー
    outbox.ts         - Operation キューイング
    sync.ts           - 同期ロジック
  hooks/
    useOnlineStatus.ts - オンライン状態 Hook
app/
  api/case-records/
    offline-upsert/route.ts - Offline-queued 操作 API エンドポイント
components/
  at-case-record-form-offline.tsx - A・T ケース記録フォーム（オフライン対応）
  at-case-record-form.tsx - 既存フォーム（互換性維持）
```

---

## 実装時間

- インフラ構築: ~30分（types, db, drafts, outbox, sync）
- Hook実装: ~5分
- API stub: ~5分
- フォーム統合: ~25分
- **合計: ~65分**

---

実装完了。UI確認・ページ統合・ドキュメント作成を進めていきます。
