# Supabase RLS 実装チェックリスト

## Phase 1: マイグレーション実行（DBA/DevOps）

- [ ] `20260117_implement_facility_rls.sql` を Supabase ダッシュボード SQL Editor で実行
  - または: `supabase db push` コマンド実行
  
- [ ] 実行後の確認:
  ```sql
  -- facilities テーブル存在確認
  SELECT * FROM facilities;
  -- 結果: life-care, after-school
  
  -- staff_profiles テーブル存在確認
  SELECT tablename FROM pg_tables WHERE tablename = 'staff_profiles';
  
  -- RLS 有効確認
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE tablename IN ('facilities', 'staff_profiles', 'care_receivers', 'case_records');
  -- 全て rowsecurity = true であること
  ```

## Phase 2: Seed データ投入（初回のみ）

- [ ] `supabase/seed.sql` を Supabase ダッシュボード SQL Editor で実行
  ```sql
  -- care_receivers が facilities に正しくマップされたか確認
  SELECT cr.id, cr.code, cr.name, f.name as facility_name
  FROM care_receivers cr
  JOIN facilities f ON cr.facility_id = f.id
  ORDER BY f.name, cr.code;
  ```

## Phase 3: 認証設定（Next.js 実装）

- [ ] Supabase Auth を Next.js で初期化
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  ```

- [ ] ログイン画面実装
  ```typescript
  await supabase.auth.signInWithPassword({
    email,
    password,
  })
  ```

- [ ] 認証後、staff_profiles から facility_id 取得
  ```typescript
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('facility_id, role')
    .eq('id', userId)
    .single()
  ```

## Phase 4: RLS ポリシーテスト（テストアカウント）

### テストアカウント作成

- [ ] **Account A**: facility='life-care'
  ```sql
  INSERT INTO staff_profiles 
    (id, facility_id, role, display_name)
  VALUES 
    ('00000000-0000-0000-0000-000000000001', 
     (SELECT id FROM facilities WHERE slug = 'life-care'),
     'admin',
     'Life Care Admin')
  ```

- [ ] **Account B**: facility='after-school'
  ```sql
  INSERT INTO staff_profiles 
    (id, facility_id, role, display_name)
  VALUES 
    ('00000000-0000-0000-0000-000000000002',
     (SELECT id FROM facilities WHERE slug = 'after-school'),
     'staff',
     'After School Staff')
  ```

### RLS テスト

- [ ] **care_receivers SELECT テスト**
  ```sql
  -- Account A でログイン → life-care のデータのみ見える
  SET ROLE authenticated;
  SET auth.uid = '00000000-0000-0000-0000-000000000001';
  SELECT * FROM care_receivers;
  -- 結果: code が 'AT_*', 'IK_*' 等（life-care のみ）
  
  -- Account B でログイン → after-school のデータのみ見える
  SET auth.uid = '00000000-0000-0000-0000-000000000002';
  SELECT * FROM care_receivers;
  -- 結果: code が 'AK_*', 'BM_*' 等（after-school のみ）
  ```

- [ ] **care_receivers INSERT テスト（facility_id 強制）**
  ```sql
  SET auth.uid = '00000000-0000-0000-0000-000000000001';
  
  -- 正規: 同じ facility_id で INSERT
  INSERT INTO care_receivers (code, name, facility_id)
  VALUES ('TEST_01', 'Test User', (SELECT id FROM facilities WHERE slug = 'life-care'))
  -- 結果: OK
  
  -- 偽装試行: 異なる facility_id で INSERT
  INSERT INTO care_receivers (code, name, facility_id)
  VALUES ('TEST_02', 'Hacked', (SELECT id FROM facilities WHERE slug = 'after-school'))
  -- 結果: WITH CHECK policy violation (拒否)
  ```

- [ ] **care_receivers DELETE テスト（権限検証）**
  ```sql
  SET auth.uid = '00000000-0000-0000-0000-000000000002';
  
  -- Account B は life-care のデータ削除できない
  DELETE FROM care_receivers WHERE code = 'AT_36M';
  -- 結果: 0 rows affected (RLS で拒否)
  ```

- [ ] **staff_profiles SELECT テスト（admin 権限）**
  ```sql
  -- Account A（admin）
  SET auth.uid = '00000000-0000-0000-0000-000000000001';
  SELECT * FROM staff_profiles;
  -- 結果: 自分 + 同一 facility 内のスタッフ
  
  -- Account B（staff）
  SET auth.uid = '00000000-0000-0000-0000-000000000002';
  SELECT * FROM staff_profiles;
  -- 結果: 自分の行のみ
  ```

## Phase 5: Next.js API Routes 実装

- [ ] API route で認証ユーザー確認
  ```typescript
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
  
  export async function GET(req: NextRequest) {
    const supabase = createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // RLS が自動適用される
    const { data } = await supabase
      .from('care_receivers')
      .select('*')
    
    return NextResponse.json(data)
  }
  ```

- [ ] API route で facility_id を明示的に設定
  ```typescript
  // INSERT の際は facility_id を自動設定
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('facility_id')
    .eq('id', user.id)
    .single()
  
  const { data } = await supabase
    .from('care_receivers')
    .insert({
      code: req.body.code,
      name: req.body.name,
      facility_id: profile.facility_id, // 強制
      service_code: req.body.service_code,
    })
  ```

## Phase 6: UI テスト（ブラウザ）

- [ ] ログイン画面テスト
  - [ ] Account A (life-care) でログイン
  - [ ] Account B (after-school) でログイン

- [ ] /services/life-care/users ページテスト
  - [ ] Account A: life-care 利用者が表示される
  - [ ] Account B: after-school 利用者のみ表示（life-care は見えない）

- [ ] /services/after-school/users ページテスト
  - [ ] Account A: life-care 利用者のみ表示（after-school は見えない）
  - [ ] Account B: after-school 利用者が表示される

- [ ] API エンドポイントテスト
  ```bash
  # Account A のトークンで request
  curl -H "Authorization: Bearer TOKEN_A" \
    http://localhost:3000/api/care-receivers/list?serviceCode=life-care
  # 結果: life-care のみ
  
  # Account B のトークンで request
  curl -H "Authorization: Bearer TOKEN_B" \
    http://localhost:3000/api/care-receivers/list?serviceCode=life-care
  # 結果: 403 Forbidden または empty
  ```

## Phase 7: 本番環境チェック

- [ ] Supabase 本番環境で RLS enable 確認
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE tablename IN ('care_receivers', 'case_records', 'staff_profiles');
  ```

- [ ] 本番 API key (anon, service_role) 確認
  - anon key: クライアント側使用 (RLS 自動適用)
  - service_role key: 管理者ツール/バッチ処理（RLS bypass）

- [ ] ログ記録設定
  ```sql
  -- pgaudit 有効化（オプション）
  CREATE EXTENSION IF NOT EXISTS pgaudit;
  ALTER SYSTEM SET pgaudit.log = 'INSERT,UPDATE,DELETE';
  ```

## リリース前最終確認

- [ ] マイグレーション実行済み
- [ ] RLS ポリシーテスト完了 ✅
- [ ] UI/API テスト完了 ✅
- [ ] エラーハンドリング実装済み (401, 403)
- [ ] ドキュメント読了：[SUPABASE_RLS_GUIDE.md](./SUPABASE_RLS_GUIDE.md)

---

**重要**: RLS なしで本番公開は **絶対に避ける**。
医療/介護データの漏洩は法的リスク + 信用失墜に繋がります。
