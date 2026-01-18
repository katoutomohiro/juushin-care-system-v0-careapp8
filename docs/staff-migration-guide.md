# 職員マスタDB化マイグレーションガイド

## 概要
MOCK_STAFF_OPTIONSからSupabase staffテーブルへの移行手順

## 実行順序

### 1. マイグレーション実行
```bash
# Supabase CLIでマイグレーションを適用
supabase db push

# または、Supabase Dashboardで直接SQLを実行
# Migration: supabase/migrations/20260114_create_staff_table.sql
```

### 2. 作成されるもの

#### staffテーブル
- `id` (uuid PK) - 職員ID
- `service_id` (uuid) - サービスID（外部キー: services.id）
- `name` (text) - 職員名
- `sort_order` (int) - 表示順
- `is_active` (boolean) - 有効フラグ（退職・異動管理用）
- `created_at` / `updated_at` (timestamptz)

#### case_recordsテーブルに追加される列
- `main_staff_id` (uuid) - 主担当職員ID（外部キー: staff.id）
- `sub_staff_id` (uuid) - 副担当職員ID（外部キー: staff.id）

#### シードデータ
13人の職員データが自動登録されます：
1. 山田 太郎
2. 佐藤 花子
3. 鈴木 一郎
4. 田中 美咲
5. 伊藤 健太
6. 渡辺 由美
7. 高橋 大輔
8. 中村 真理
9. 小林 孝夫
10. 加藤 麻衣
11. 吉田 和也
12. 山本 奈々
13. 佐々木 翔

### 3. データ移行（既存レコードがある場合）

既存のcase_recordsにmain_staff_idが空のレコードがある場合は、手動で設定：

```sql
-- 例: 全レコードにデフォルト職員を設定
UPDATE case_records 
SET main_staff_id = (SELECT id FROM staff ORDER BY sort_order LIMIT 1)
WHERE main_staff_id IS NULL;
```

### 4. NOT NULL制約の追加（移行完了後）

全レコードにmain_staff_idが設定されたことを確認後：

```sql
-- main_staff_id を必須化
ALTER TABLE case_records ALTER COLUMN main_staff_id SET NOT NULL;
```

### 5. 確認クエリ

```sql
-- 職員データ確認
SELECT COUNT(*) FROM staff;

-- ケース記録の職員設定状況
SELECT 
  COUNT(*) as total,
  COUNT(main_staff_id) as with_main_staff,
  COUNT(sub_staff_id) as with_sub_staff
FROM case_records;

-- 職員別ケース記録件数
SELECT 
  s.name,
  COUNT(cr.id) as record_count
FROM staff s
LEFT JOIN case_records cr ON cr.main_staff_id = s.id
GROUP BY s.id, s.name
ORDER BY s.sort_order;
```

## フロントエンド変更

### API追加
- **GET /api/staff** - 職員一覧取得（serviceId必須）

### コンポーネント変更
- **CaseRecordFormClient** - `useEffect`でDB から職員データ取得
- **API保存時** - `mainStaffId` (UUID), `subStaffId` (UUID) を送信

### 削除されたコード
- `MOCK_STAFF_OPTIONS` 定数

## ロールバック手順（必要時）

```sql
-- 外部キー制約削除
ALTER TABLE case_records DROP CONSTRAINT IF EXISTS fk_case_records_main_staff;
ALTER TABLE case_records DROP CONSTRAINT IF EXISTS fk_case_records_sub_staff;

-- 列削除
ALTER TABLE case_records DROP COLUMN IF EXISTS main_staff_id;
ALTER TABLE case_records DROP COLUMN IF EXISTS sub_staff_id;

-- staffテーブル削除
DROP TABLE IF EXISTS staff CASCADE;
```

## 注意事項

1. **service_id設定**: シードデータは最初のサービスに紐付けられます。複数サービスがある場合は手動で調整してください。

2. **職員名の変更**: staffテーブルのnameを更新すれば、過去のケース記録にも反映されます（UUIDで紐付けているため）。

3. **退職・異動**: `is_active = false`に設定すれば、新規記録の選択肢から除外できます（既存記録は表示可能）。

4. **副担当**: 現在は1人のみ対応（`sub_staff_id`）。複数副担当が必要な場合は、中間テーブル`case_record_staff`の追加を検討してください。
