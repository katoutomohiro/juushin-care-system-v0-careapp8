# Supabase RLS 実裁E��イチE- 事業所刁E��型�EルチテナンチE
## 概要E
こ�Eプロジェクト�E **Supabase + RLS (Row Level Security)** を使用して、褁E��の事業所�E�Eacilities�E�が同一チE�Eタベ�Eスを�E有しながら、E*完�EにチE�Eタを�E離** します、E
## アーキチE��チャ

```
┌─────────────────────────────────────────━E━ESupabase / PostgreSQL                    ━E├─────────────────────────────────────────┤
━EAuth (auth.users)                       ━E━E  └─ email, phone, created_at           ━E├─────────────────────────────────────────┤
━Efacilities (多テナンチE                   ━E━E  ├─ id (uuid pk)                       ━E━E  ├─ slug ('life-care', 'after-school') ━E━E  └─ name (表示用)                       ━E├─────────────────────────────────────────┤
━Estaff_profiles (auth.users と1:1)        ━E━E  ├─ id = auth.users.id (FK)           ━E━E  ├─ facility_id ↁEチE��ント割り当て      ━E━E  ├─ role ('admin', 'staff', 'viewer') ━E━E  └─ display_name                       ━E├─────────────────────────────────────────┤
━Ecare_receivers (facility_id で刁E��)      ━E━E  ├─ id, code, name, age, ...          ━E━E  ├─ facility_id (FK)                  ━E━E  └─ RLS: facility_id = current user    ━E├─────────────────────────────────────────┤
━Ecase_records (facility_id で刁E��)       ━E━E  ├─ id, care_receiver_id, sections    ━E━E  ├─ facility_id (FK)                  ━E━E  └─ RLS: facility_id = current user    ━E└─────────────────────────────────────────━E```

## セキュリチE��要件

### 1. 認証 (Authentication)
- **Supabase Auth**: email/password また�E OAuth でログイン
- ログイン後、auth.users(id) ぁEJWT ト�Eクンに含まれる

### 2. チE��ント割り当て (Tenant Assignment)
- ログインユーザーは **staff_profiles** チE�Eブルで facility_id に紐づぁE- 一ユーザー = 一事業所�E�今後、褁E��事業所対応�E場合�E軽微な変更で対応可�E�E
### 3. RLS ポリシー (Row Level Security Policies)

#### **facilities チE�Eブル**
```sql
-- ユーザーは自刁E��属すめEfacility のみ SELECT 可能
SELECT ↁEfacility_id が�E刁E�E割り当て ID と一致
```

#### **staff_profiles チE�Eブル**
```sql
SELECT_SELF: 自刁E�E行�E常に見えめESELECT_ADMIN: admin ロール ↁE同一 facility 冁E�E全スタチE��見えめEUPDATE_ADMIN: admin ロール ↁE同一 facility 冁E�EスタチE��惁E��を更新可
```

#### **care_receivers チE�Eブル**
```sql
SELECT   ↁEfacility_id = get_current_facility_id()
INSERT   ↁEfacility_id = get_current_facility_id() (強制)
UPDATE   ↁEfacility_id = get_current_facility_id()
DELETE   ↁEfacility_id = get_current_facility_id()

⚠�E�E重要E INSERT/UPDATE で facility_id を上書き防止 (WITH CHECK)
```

#### **case_records チE�Eブル**
```sql
SELECT   ↁEfacility_id = get_current_facility_id()
INSERT   ↁEfacility_id = get_current_facility_id() (強制)
UPDATE   ↁEfacility_id = get_current_facility_id()
DELETE   ↁEfacility_id = get_current_facility_id()

⚠�E�E重要E 作�E老E�E facility_id 自動設定で偽裁E��止
```

## Helper Function

### `get_current_facility_id()` 
```sql
SELECT facility_id FROM staff_profiles
WHERE id = auth.uid()
```
- **全 RLS ポリシーで使用**
- ログインユーザーの facility_id を返す
- キャチE��ュ: STABLE で高速化

## マイグレーション頁E��E
1. **20260117_implement_facility_rls.sql** (最新)
   - facilities チE�Eブル作�E
   - staff_profiles チE�Eブル作�E
   - care_receivers / case_records に facility_id 追加
   - RLS 有効匁E+ ポリシー作�E
   - get_current_facility_id() 関数作�E

2. **seed.sql** (更新済み)
   - facility_id 明示皁E��挿入
   - 既存データ migrated

## Next.js 実裁EチェチE��リスチE
- [ ] Supabase クライアント�E期化 (createClient with auth.users)
- [ ] ログイン画面実裁E(signInWithPassword また�E signInWithOAuth)
- [ ] staff_profiles チE�Eブルから facility_id fetch
- [ ] ペ�Eジ/API で facility_id めEcontext に保持
- [ ] API routes で Supabase admin client 使用�E�また�E RLS が�E動！E- [ ] UI で「�E刁E�E事業所のチE�Eタのみ表示」確誁E
## セキュリチE��ベスト�EラクチE��ス

### ✁EめE��べぁE1. **RLS を本番環墁E��有効匁E*
   - 開発環墁E��チE��チEↁE本番環墁E�� enforcement
   
2. **Policy チE��チE*
   - 別ユーザーで他facility のチE�Eタアクセス試衁EↁE拒否確誁E   
3. **Audit ログ**
   - who (auth.uid), when (created_at), what (INSERT/UPDATE/DELETE)
   - pgaudit extension 推奨
   
4. **定期皁E��セキュリチE��レビュー**
   - Policy の論理確誁E   - UPDATE/DELETE ポリシーの WITH CHECK 確誁E
### ❁EめE��てはぁE��なぁE1. **RLS を無効化したまま本番投�E**
   - 全ユーザーが�EチE�Eタ見えめE= 個人惁E��漏洩
   
2. **クライアンチEside で facility_id を信頼する**
   - 忁E��サーバ�E/RLS で検証
   
3. **一つの admin account で全事業所管琁E*
   - 権限�E離原則: facility ごとに admin を�E置
   
4. **JWT payload に修正不可能な惁E��を�EれなぁE*
   - JWT は署名されるが、署名後�E修正不可
   - facility_id 変更は要Edatabase 側の更新

## 運用時トラブルシューチE��ング

### 痁E��: API ぁE403 Forbidden を返す
**原因**: RLS ポリシーが拒否  
**確誁E*:
```sql
-- 現在のユーザーと facility_id を確誁ESELECT * FROM staff_profiles WHERE id = current_user_id;

-- ポリシーが正しく evaluate されてぁE��か確誁ESELECT * FROM pg_policies WHERE tablename = 'care_receivers';
```

### 痁E��: INSERT ぁE0 rows affected を返す
**原因**: WITH CHECK ポリシーで facility_id が不正  
**対忁E*:
```sql
-- facility_id を�E示皁E��設定して INSERT
INSERT INTO care_receivers (code, name, facility_id, ...)
VALUES ('...', '...', get_current_facility_id(), ...)
```

### 痁E��: 仁Efacility のチE�Eタが見えめE**原因**: RLS が無効化されてぁE��可能性  
**確誁E*:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('care_receivers', 'case_records');
-- rowsecurity = true であることを確誁E```

## リリースチェチE��リスチE
- [ ] マイグレーション 20260117 を本番環墁E��実衁E- [ ] seed.sql で初期チE�Eタ投�E
- [ ] 吁E��ーブルで RLS が有効か確誁E- [ ] チE��トアカウンチE個作�E (facility A, B)
- [ ] 相互アクセスチE��チE(A のユーザーぁEB のチE�Eタ見えなぁE
- [ ] エラーハンドリング (403, 401 含む)
- [ ] ログ出劁E(どのポリシーで拒否されたか)

## 参老E��E��

- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/sql-createpolicy.html
- Supabase Security Best Practices: https://supabase.com/docs/guides/auth

