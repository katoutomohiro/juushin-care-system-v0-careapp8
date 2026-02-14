# Supabase RLS 実裁E��ェチE��リスチE
## Phase 1: マイグレーション実行！EBA/DevOps�E�E
- [ ] `20260117_implement_facility_rls.sql` めESupabase ダチE��ュボ�EチESQL Editor で実衁E  - また�E: `supabase db push` コマンド実衁E  
- [ ] 実行後�E確誁E
  ```sql
  -- facilities チE�Eブル存在確誁E  SELECT * FROM facilities;
  -- 結果: life-care, after-school
  
  -- staff_profiles チE�Eブル存在確誁E  SELECT tablename FROM pg_tables WHERE tablename = 'staff_profiles';
  
  -- RLS 有効確誁E  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE tablename IN ('facilities', 'staff_profiles', 'care_receivers', 'case_records');
  -- 全て rowsecurity = true であること
  ```

## Phase 2: Seed チE�Eタ投�E�E��E回�Eみ�E�E
- [ ] `supabase/seed.sql` めESupabase ダチE��ュボ�EチESQL Editor で実衁E  ```sql
  -- care_receivers ぁEfacilities に正しくマップされたか確誁E  SELECT cr.id, cr.code, cr.name, f.name as facility_name
  FROM care_receivers cr
  JOIN facilities f ON cr.facility_id = f.id
  ORDER BY f.name, cr.code;
  ```

## Phase 3: 認証設定！Eext.js 実裁E��E
- [ ] Supabase Auth めENext.js で初期匁E  ```typescript
  import { createClient } from '@supabase/supabase-js'
  
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  ```

- [ ] ログイン画面実裁E  ```typescript
  await supabase.auth.signInWithPassword({
    email,
    password,
  })
  ```

- [ ] 認証後、staff_profiles から facility_id 取征E  ```typescript
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('facility_id, role')
    .eq('id', userId)
    .single()
  ```

## Phase 4: RLS ポリシーチE��ト（テストアカウント！E
### チE��トアカウント作�E

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

### RLS チE��チE
- [ ] **care_receivers SELECT チE��チE*
  ```sql
  -- Account A でログイン ↁElife-care のチE�Eタのみ見えめE  SET ROLE authenticated;
  SET auth.uid = '00000000-0000-0000-0000-000000000001';
  SELECT * FROM care_receivers;
  -- 結果: code ぁE'AT_*', 'IK_*' 等！Eife-care のみ�E�E  
  -- Account B でログイン ↁEafter-school のチE�Eタのみ見えめE  SET auth.uid = '00000000-0000-0000-0000-000000000002';
  SELECT * FROM care_receivers;
  -- 結果: code ぁE'AK_*', 'BM_*' 等！Efter-school のみ�E�E  ```

- [ ] **care_receivers INSERT チE��ト！Eacility_id 強制�E�E*
  ```sql
  SET auth.uid = '00000000-0000-0000-0000-000000000001';
  
  -- 正要E 同じ facility_id で INSERT
  INSERT INTO care_receivers (code, name, facility_id)
  VALUES ('TEST_01', 'Test User', (SELECT id FROM facilities WHERE slug = 'life-care'))
  -- 結果: OK
  
  -- 偽裁E��衁E 異なめEfacility_id で INSERT
  INSERT INTO care_receivers (code, name, facility_id)
  VALUES ('TEST_02', 'Hacked', (SELECT id FROM facilities WHERE slug = 'after-school'))
  -- 結果: WITH CHECK policy violation (拒否)
  ```

- [ ] **care_receivers DELETE チE��ト（権限検証�E�E*
  ```sql
  SET auth.uid = '00000000-0000-0000-0000-000000000002';
  
  -- Account B は life-care のチE�Eタ削除できなぁE  DELETE FROM care_receivers WHERE code = 'AT_36M';
  -- 結果: 0 rows affected (RLS で拒否)
  ```

- [ ] **staff_profiles SELECT チE��ト！Edmin 権限！E*
  ```sql
  -- Account A�E�Edmin�E�E  SET auth.uid = '00000000-0000-0000-0000-000000000001';
  SELECT * FROM staff_profiles;
  -- 結果: 自刁E+ 同一 facility 冁E�EスタチE��
  
  -- Account B�E�Etaff�E�E  SET auth.uid = '00000000-0000-0000-0000-000000000002';
  SELECT * FROM staff_profiles;
  -- 結果: 自刁E�E行�Eみ
  ```

## Phase 5: Next.js API Routes 実裁E
- [ ] API route で認証ユーザー確誁E  ```typescript
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
  
  export async function GET(req: NextRequest) {
    const supabase = createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // RLS が�E動適用されめE    const { data } = await supabase
      .from('care_receivers')
      .select('*')
    
    return NextResponse.json(data)
  }
  ```

- [ ] API route で facility_id を�E示皁E��設宁E  ```typescript
  // INSERT の際�E facility_id を�E動設宁E  const { data: profile } = await supabase
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

## Phase 6: UI チE��ト（ブラウザ�E�E
- [ ] ログイン画面チE��チE  - [ ] Account A (life-care) でログイン
  - [ ] Account B (after-school) でログイン

- [ ] /services/life-care/users ペ�EジチE��チE  - [ ] Account A: life-care 利用老E��表示されめE  - [ ] Account B: after-school 利用老E�Eみ表示�E�Eife-care は見えなぁE��E
- [ ] /services/after-school/users ペ�EジチE��チE  - [ ] Account A: life-care 利用老E�Eみ表示�E�Efter-school は見えなぁE��E  - [ ] Account B: after-school 利用老E��表示されめE
- [ ] API エンド�EイントテスチE  ```bash
  # Account A のト�Eクンで request
  curl -H "Authorization: Bearer TOKEN_A" \
    http://dev-app.local:3000/api/care-receivers/list?serviceCode=life-care
  # 結果: life-care のみ
  
  # Account B のト�Eクンで request
  curl -H "Authorization: Bearer TOKEN_B" \
    http://dev-app.local:3000/api/care-receivers/list?serviceCode=life-care
  # 結果: 403 Forbidden また�E empty
  ```

## Phase 7: 本番環墁E��ェチE��

- [ ] Supabase 本番環墁E�� RLS enable 確誁E  ```sql
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE tablename IN ('care_receivers', 'case_records', 'staff_profiles');
  ```

- [ ] 本番 API key (anon, service_role) 確誁E  - anon key: クライアント�E使用 (RLS 自動適用)
  - service_role key: 管琁E��E��ール/バッチ�E琁E��ELS bypass�E�E
- [ ] ログ記録設宁E  ```sql
  -- pgaudit 有効化（オプション�E�E  CREATE EXTENSION IF NOT EXISTS pgaudit;
  ALTER SYSTEM SET pgaudit.log = 'INSERT,UPDATE,DELETE';
  ```

## リリース前最終確誁E
- [ ] マイグレーション実行済み
- [ ] RLS ポリシーチE��ト完亁E✁E- [ ] UI/API チE��ト完亁E✁E- [ ] エラーハンドリング実裁E��み (401, 403)
- [ ] ドキュメント読亁E��[SUPABASE_RLS_GUIDE.md](./SUPABASE_RLS_GUIDE.md)

---

**重要E*: RLS なしで本番公開�E **絶対に避ける**、E医癁E介護チE�Eタの漏洩は法的リスク + 信用失墜に繋がります、E
