# Supabase RLS 実装ガイド - 事業所分離型マルチテナント

## 概要

このプロジェクトは **Supabase + RLS (Row Level Security)** を使用して、複数の事業所（facilities）が同一データベースを共有しながら、**完全にデータを分離** します。

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│ Supabase / PostgreSQL                    │
├─────────────────────────────────────────┤
│ Auth (auth.users)                       │
│   └─ email, phone, created_at           │
├─────────────────────────────────────────┤
│ facilities (多テナント)                   │
│   ├─ id (uuid pk)                       │
│   ├─ slug ('life-care', 'after-school') │
│   └─ name (表示用)                       │
├─────────────────────────────────────────┤
│ staff_profiles (auth.users と1:1)        │
│   ├─ id = auth.users.id (FK)           │
│   ├─ facility_id → テナント割り当て      │
│   ├─ role ('admin', 'staff', 'viewer') │
│   └─ display_name                       │
├─────────────────────────────────────────┤
│ care_receivers (facility_id で分離)      │
│   ├─ id, code, name, age, ...          │
│   ├─ facility_id (FK)                  │
│   └─ RLS: facility_id = current user    │
├─────────────────────────────────────────┤
│ case_records (facility_id で分離)       │
│   ├─ id, care_receiver_id, sections    │
│   ├─ facility_id (FK)                  │
│   └─ RLS: facility_id = current user    │
└─────────────────────────────────────────┘
```

## セキュリティ要件

### 1. 認証 (Authentication)
- **Supabase Auth**: email/password または OAuth でログイン
- ログイン後、auth.users(id) が JWT トークンに含まれる

### 2. テナント割り当て (Tenant Assignment)
- ログインユーザーは **staff_profiles** テーブルで facility_id に紐づく
- 一ユーザー = 一事業所（今後、複数事業所対応の場合は軽微な変更で対応可）

### 3. RLS ポリシー (Row Level Security Policies)

#### **facilities テーブル**
```sql
-- ユーザーは自分が属する facility のみ SELECT 可能
SELECT → facility_id が自分の割り当て ID と一致
```

#### **staff_profiles テーブル**
```sql
SELECT_SELF: 自分の行は常に見える
SELECT_ADMIN: admin ロール → 同一 facility 内の全スタッフ見える
UPDATE_ADMIN: admin ロール → 同一 facility 内のスタッフ情報を更新可
```

#### **care_receivers テーブル**
```sql
SELECT   → facility_id = get_current_facility_id()
INSERT   → facility_id = get_current_facility_id() (強制)
UPDATE   → facility_id = get_current_facility_id()
DELETE   → facility_id = get_current_facility_id()

⚠️ 重要: INSERT/UPDATE で facility_id を上書き防止 (WITH CHECK)
```

#### **case_records テーブル**
```sql
SELECT   → facility_id = get_current_facility_id()
INSERT   → facility_id = get_current_facility_id() (強制)
UPDATE   → facility_id = get_current_facility_id()
DELETE   → facility_id = get_current_facility_id()

⚠️ 重要: 作成者の facility_id 自動設定で偽装防止
```

## Helper Function

### `get_current_facility_id()` 
```sql
SELECT facility_id FROM staff_profiles
WHERE id = auth.uid()
```
- **全 RLS ポリシーで使用**
- ログインユーザーの facility_id を返す
- キャッシュ: STABLE で高速化

## マイグレーション順序

1. **20260117_implement_facility_rls.sql** (最新)
   - facilities テーブル作成
   - staff_profiles テーブル作成
   - care_receivers / case_records に facility_id 追加
   - RLS 有効化 + ポリシー作成
   - get_current_facility_id() 関数作成

2. **seed.sql** (更新済み)
   - facility_id 明示的に挿入
   - 既存データ migrated

## Next.js 実装 チェックリスト

- [ ] Supabase クライアント初期化 (createClient with auth.users)
- [ ] ログイン画面実装 (signInWithPassword または signInWithOAuth)
- [ ] staff_profiles テーブルから facility_id fetch
- [ ] ページ/API で facility_id を context に保持
- [ ] API routes で Supabase admin client 使用（または RLS が自動）
- [ ] UI で「自分の事業所のデータのみ表示」確認

## セキュリティベストプラクティス

### ✅ やるべき
1. **RLS を本番環境で有効化**
   - 開発環境でテスト → 本番環境で enforcement
   
2. **Policy テスト**
   - 別ユーザーで他facility のデータアクセス試行 → 拒否確認
   
3. **Audit ログ**
   - who (auth.uid), when (created_at), what (INSERT/UPDATE/DELETE)
   - pgaudit extension 推奨
   
4. **定期的なセキュリティレビュー**
   - Policy の論理確認
   - UPDATE/DELETE ポリシーの WITH CHECK 確認

### ❌ やってはいけない
1. **RLS を無効化したまま本番投入**
   - 全ユーザーが全データ見える = 個人情報漏洩
   
2. **クライアント side で facility_id を信頼する**
   - 必ずサーバー/RLS で検証
   
3. **一つの admin account で全事業所管理**
   - 権限分離原則: facility ごとに admin を配置
   
4. **JWT payload に修正不可能な情報を入れない**
   - JWT は署名されるが、署名後は修正不可
   - facility_id 変更は要 database 側の更新

## 運用時トラブルシューティング

### 症状: API が 403 Forbidden を返す
**原因**: RLS ポリシーが拒否  
**確認**:
```sql
-- 現在のユーザーと facility_id を確認
SELECT * FROM staff_profiles WHERE id = current_user_id;

-- ポリシーが正しく evaluate されているか確認
SELECT * FROM pg_policies WHERE tablename = 'care_receivers';
```

### 症状: INSERT が 0 rows affected を返す
**原因**: WITH CHECK ポリシーで facility_id が不正  
**対応**:
```sql
-- facility_id を明示的に設定して INSERT
INSERT INTO care_receivers (code, name, facility_id, ...)
VALUES ('...', '...', get_current_facility_id(), ...)
```

### 症状: 他 facility のデータが見える
**原因**: RLS が無効化されている可能性  
**確認**:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('care_receivers', 'case_records');
-- rowsecurity = true であることを確認
```

## リリースチェックリスト

- [ ] マイグレーション 20260117 を本番環境で実行
- [ ] seed.sql で初期データ投入
- [ ] 各テーブルで RLS が有効か確認
- [ ] テストアカウント2個作成 (facility A, B)
- [ ] 相互アクセステスト (A のユーザーが B のデータ見えない)
- [ ] エラーハンドリング (403, 401 含む)
- [ ] ログ出力 (どのポリシーで拒否されたか)

## 参考資料

- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/sql-createpolicy.html
- Supabase Security Best Practices: https://supabase.com/docs/guides/auth
