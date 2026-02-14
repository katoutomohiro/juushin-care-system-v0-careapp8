# Supabase RLS 実裁E��マリー

## ✁E実裁E��亁E�E容

### 1. **マイグレーション: 20260117_implement_facility_rls.sql**

#### チE�Eブル設訁E```
facilities (マスタ)
  ├─ id (uuid pk)
  ├─ slug (unique): 'life-care', 'after-school'
  └─ name: 事業所吁E
staff_profiles (認証ユーザーの事業所割り当て)
  ├─ id = auth.users.id (外部キー, ON DELETE CASCADE)
  ├─ facility_id (FK ↁEfacilities)
  ├─ role: 'admin' | 'staff' | 'viewer'
  └─ display_name

care_receivers (利用老E��報) ☁Efacility_id 追加
  ├─ facility_id (NOT NULL, FK)
  └─ [既存フィールド]: code, name, age, gender, ...

case_records (ケース記録) ☁Efacility_id 追加
  ├─ facility_id (NOT NULL, FK)
  └─ [既存フィールド]: care_receiver_id, record_date, sections, ...
```

#### RLS ポリシー
| チE�Eブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| facilities | facility_id = 自刁E�E割り当て | ✁E| ✁E| ✁E|
| staff_profiles | 自刁E+ (admin ↁEfacility冁E�E員) | ✁E| admin ↁEfacility冁E| ✁E|
| care_receivers | facility_id = current | facility_id = current | facility_id = current | facility_id = current |
| case_records | facility_id = current | facility_id = current | facility_id = current | facility_id = current |

#### Helper Function
```sql
get_current_facility_id()
  ↁEauth.uid() の facility_id を返す
  ↁE全ポリシーで使用
```

### 2. **Seed Data 更新: seed.sql**
- `facility_id` を�E示皁E�� INSERT
- life-care: 14吁E after-school: 10吁E- UPSERT で既存データめEmigrated

### 3. **ドキュメンチE*

| ファイル | 冁E�� |
|--------|------|
| SUPABASE_RLS_GUIDE.md | アーキチE��チャ, セキュリチE��, トラブルシューチE��ング |
| SUPABASE_RLS_CHECKLIST.md | Phase-by-phase 実裁E��ェチE��リスチE|
| API_ROUTE_EXAMPLE_RLS.md | Next.js API route 参老E��裁E|

---

## 🔐 セキュリチE��要件達�E

### ✁E認証 (Authentication)
- Supabase Auth (email/password, OAuth)
- ログイン征E`auth.users(id)` が取得される

### ✁EチE��ント割り当て (Tenant Assignment)
- `staff_profiles` チE�Eブルで `facility_id` に紐づぁE- 一ユーザー = 一事業所

### ✁ERLS ポリシー (Row Level Security)
- 全チE�Eブルで RLS 有効匁E- `get_current_facility_id()` 関数で統一皁E��チェチE��
- INSERT 晁E`WITH CHECK` で `facility_id` 強制 (偽裁E��止)

### ✁EチE�Eタ刁E��
- **care_receivers / case_records**: 同一 `facility_id` のみ CRUD
- **staff_profiles**: 自刁E��えめE+ admin ぁEfacility 冁E�E員見えめE- **facilities**: 割り当て facility のみ見えめE
---

## 🚀 次のスチE��チE
### Phase 1: Supabase 環墁E��篁E(DBA/DevOps)
```bash
# マイグレーション実衁Esupabase db push
# また�E手動: Supabase ダチE��ュボ�EチESQL Editor で実衁E
# Seed チE�Eタ投�E
# Supabase ダチE��ュボ�EチESQL Editor で実衁E```

### Phase 2: RLS チE��チE```sql
-- チE��トアカウント作�E後、各ポリシーをテスチE-- (詳細: SUPABASE_RLS_CHECKLIST.md)
```

### Phase 3: Next.js 実裁E1. **認証**: Supabase Auth ログイン画面
2. **staff_profiles 取征E*: ユーザーの `facility_id` 取征E3. **API routes**: RLS 自動適用
4. **UI**: facility 別フィルタリング表示

### Phase 4: 本番環墁E��ェチE��
- RLS enable 確誁E- チE��トアカウント相互アクセスチE��チE- エラーハンドリング (401, 403)

---

## 📋 リスク低渁E
| リスク | 対筁E|
|-------|------|
| 他事業所チE�Eタ漏洩 | RLS + facility_id チェチE�� |
| ト�Eクン偽裁E| INSERT 晁Efacility_id 強制 |
| admin 権限悪用 | admin は同一 facility 冁E�Eみ |
| チE�Eタ混在 | migration で既存データ facility_id 割り当て |

---

## 💡 重要なポインチE
1. **RLS は本番忁E��E*
   - インターネット�E開なめERLS なし�E禁止
   - 医療データ漏洩 = 法的リスク

2. **facility_id 自動設宁E*
   - クライアント値は信頼しなぁE   - API で `auth.uid()` ↁE`staff_profiles` ↁE`facility_id` を取征E
3. **チE��トが生命緁E*
   - 褁E��チE��トアカウントで相互アクセスチE��チE   - 403 が返される = RLS が正常に機�E

4. **監査ログ**
   - 本番環墁E��は pgaudit 有効化を推奨
   - who, when, what を記録

---

## コミット情報

- **Commit**: `61eec26`
- **Files**:
  - `supabase/migrations/20260117_implement_facility_rls.sql`
  - `supabase/seed.sql` (updated)
  - `docs/SUPABASE_RLS_GUIDE.md` (new)
  - `docs/SUPABASE_RLS_CHECKLIST.md` (new)
  - `docs/API_ROUTE_EXAMPLE_RLS.md` (new)

