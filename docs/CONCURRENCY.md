# 同時編集制御ガイド

**対象**: 重心ケア支援アプリ v0  
**更新日**: 2026年1月28日  
**方式**: 楽観的ロック（Optimistic Locking）

---

## 🎯 目的

複数の端末（スマホ・タブレット・PC）やスタッフが同時にケース記録を編集する際、**データの破壊や上書きを防止**する。

### 想定シナリオ

```
時刻 10:00 - スタッフA（スマホ）がケース記録を開く
時刻 10:01 - スタッフB（PC）が同じケース記録を開く
時刻 10:02 - スタッフAが「バイタル: 体温36.5℃」を保存
時刻 10:03 - スタッフBが「備考: 食事量良好」を保存
  ↓
🔴 問題: スタッフAの変更が消える（Last Write Wins）
```

**対策**: 楽観的ロックで競合を検知し、ユーザーに通知する

---

## 🔐 楽観的ロック方式

### 基本原理

1. **レコード読み取り時**: `version` または `updated_at` を取得
2. **保存時**: 「version が変わっていない」ことを確認して更新
3. **競合発生時**: 更新が 0 件 → 409 Conflict エラーを返す
4. **ユーザー対応**: 「他の端末で更新されました」ダイアログ → 再読み込み

### 採用方式

**Version カラム方式**（推奨）

```sql
-- case_records テーブルに version カラムを追加
ALTER TABLE case_records ADD COLUMN version INT DEFAULT 1 NOT NULL;

-- 更新時のクエリ
UPDATE case_records
SET 
  record_data = $1,
  version = version + 1,
  updated_at = NOW()
WHERE id = $2 AND version = $3
RETURNING *;
```

**利点**:
- ✅ 明示的なバージョン管理
- ✅ `updated_at` の精度に依存しない
- ✅ 競合検知が確実

**欠点**:
- ❌ カラム追加が必要（マイグレーション）

---

## 📐 実装アーキテクチャ

### データフロー

```
[フロント] ケース記録ページを開く
  ↓ GET /api/case-records/list
[API] record_data + version を返す
  ↓
[フロント] フォーム編集
  ↓
[フロント] 保存ボタンクリック
  ↓ POST /api/case-records/save { version: 3 }
[API] WHERE id = ? AND version = 3
  ↓
[DB] 更新成功（1件） → version = 4
  ↓ 200 OK
[フロント] 「保存しました」トースト

--- 競合発生時 ---

[フロント] 保存ボタンクリック
  ↓ POST /api/case-records/save { version: 3 }
[API] WHERE id = ? AND version = 3
  ↓
[DB] 更新失敗（0件）← 他の端末が version = 4 に更新済
  ↓ 409 Conflict
[フロント] 「他の端末で更新されました。再読み込みしてください」ダイアログ
```

---

## 🔧 実装詳細

### 1. データベーススキーマ

**マイグレーション**: `supabase/migrations/YYYYMMDD_add_version_to_case_records.sql`

```sql
-- case_records に version カラムを追加
ALTER TABLE case_records 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL;

-- 既存レコードの version を 1 に初期化
UPDATE case_records SET version = 1 WHERE version IS NULL;

-- updated_at トリガー（version 自動インクリメント用、オプション）
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_records_version_trigger
BEFORE UPDATE ON case_records
FOR EACH ROW
EXECUTE FUNCTION increment_version();
```

### 2. API 実装（`app/api/case-records/save/route.ts`）

**更新クエリ**:

```typescript
// POST /api/case-records/save
export async function POST(req: NextRequest) {
  const { userId, serviceId, careReceiverName, date, record_data, recordTime, version } = await req.json()
  
  // version が無い場合は新規作成
  if (version === undefined) {
    // INSERT 処理（新規）
    const { data, error } = await supabase
      .from('case_records')
      .insert({ 
        user_id: userId, 
        service_id: serviceId, 
        date, 
        record_data, 
        record_time: recordTime,
        version: 1  // 初期バージョン
      })
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  }
  
  // 既存レコードの更新（楽観的ロック）
  const { data, error, count } = await supabase
    .from('case_records')
    .update({ 
      record_data, 
      record_time: recordTime,
      updated_at: new Date().toISOString()
      // version は トリガーで自動インクリメント
    })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('version', version)  // 🔐 楽観的ロックのキー
    .select()
    .single()
  
  // 競合検知
  if (count === 0 || !data) {
    return NextResponse.json(
      { 
        error: 'conflict', 
        message: '他の端末で更新されています。再読み込みしてください。' 
      }, 
      { status: 409 }  // 409 Conflict
    )
  }
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ ok: true, data })
}
```

### 3. フロントエンド実装（`src/components/case-records/CaseRecordFormClient.tsx`）

**状態管理**:

```typescript
const [currentVersion, setCurrentVersion] = useState<number>(1)
const [conflictDialogOpen, setConflictDialogOpen] = useState(false)

// レコード読み込み時
useEffect(() => {
  async function loadRecord() {
    const res = await fetch(`/api/case-records/list?userId=${userId}&date=${date}`)
    const data = await res.json()
    if (data.records?.[0]) {
      setCurrentVersion(data.records[0].version)  // version を保存
      // ... フォームに展開
    }
  }
  loadRecord()
}, [userId, date])

// 保存処理
const handleSave = async () => {
  const res = await fetch('/api/case-records/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      date,
      record_data: formData,
      version: currentVersion  // 🔐 現在の version を送信
    })
  })
  
  if (res.status === 409) {
    // 競合発生 → ダイアログ表示
    setConflictDialogOpen(true)
    return
  }
  
  const result = await res.json()
  if (result.ok) {
    setCurrentVersion(result.data.version)  // 新しい version に更新
    toast({ title: '✅ 保存しました' })
  }
}
```

**競合ダイアログ**:

```tsx
<AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>⚠️ 他の端末で更新されています</AlertDialogTitle>
      <AlertDialogDescription>
        このケース記録は、別の端末またはスタッフによって更新されました。
        最新の内容を確認してから、再度編集してください。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction onClick={() => window.location.reload()}>
        再読み込み
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 🧪 テストシナリオ

### シナリオ 1: 同時編集（競合発生）

1. **スマホ**: ケース記録（AT, 2026-01-28）を開く → version = 1
2. **PC**: 同じケース記録を開く → version = 1
3. **スマホ**: 「体温: 36.5℃」を保存 → version = 2
4. **PC**: 「備考: 良好」を保存 → **409 Conflict**
5. **PC**: ダイアログ表示 → 再読み込み → version = 2 で再編集

**期待結果**:
- ✅ スマホの変更が保存される
- ✅ PC で競合ダイアログが表示される
- ✅ 再読み込み後、スマホの変更が反映されている

### シナリオ 2: 順次編集（競合なし）

1. **スマホ**: ケース記録を開く → version = 1
2. **スマホ**: 保存 → version = 2
3. **PC**: ケース記録を開く → version = 2
4. **PC**: 保存 → version = 3

**期待結果**:
- ✅ すべての保存が成功
- ✅ 競合ダイアログは表示されない

---

## 📋 実装チェックリスト

- [ ] `case_records` に `version` カラム追加（マイグレーション）
- [ ] API で `WHERE version = ?` による更新実装
- [ ] 0件更新時に 409 Conflict を返す
- [ ] フロントで `version` を state 管理
- [ ] 保存時に `version` を送信
- [ ] 409 エラーで競合ダイアログ表示
- [ ] 再読み込み機能実装
- [ ] テストシナリオ 1, 2 を手動テスト

---

## 🔄 代替案: updated_at による競合検知

**Version カラムを追加したくない場合**:

```typescript
// 読み込み時
const originalUpdatedAt = record.updated_at

// 保存時
const { data, count } = await supabase
  .from('case_records')
  .update({ record_data, updated_at: new Date().toISOString() })
  .eq('id', recordId)
  .eq('updated_at', originalUpdatedAt)  // 🔐 タイムスタンプで競合検知
  .select()

if (count === 0) {
  // 競合発生
}
```

**注意点**:
- ⚠️ `updated_at` の精度に依存（PostgreSQL は microsecond 精度）
- ⚠️ トリガーで自動更新される場合、競合検知が難しい
- ✅ Version カラム方式を推奨

---

## 📚 参考資料

- **Optimistic Locking**: https://en.wikipedia.org/wiki/Optimistic_concurrency_control
- **Supabase Real-time**: https://supabase.com/docs/guides/realtime（将来的な拡張案）
- **PostgreSQL Row Versioning**: https://www.postgresql.org/docs/current/mvcc-intro.html

---

**End of Document**  
*次回更新: 楽観的ロック実装完了時*
