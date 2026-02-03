# Supabase RLS 実装サマリー

## ✅ 実装完了内容

### 1. **マイグレーション: 20260117_implement_facility_rls.sql**

#### テーブル設計
```
facilities (マスタ)
  ├─ id (uuid pk)
  ├─ slug (unique): 'life-care', 'after-school'
  └─ name: 事業所名

staff_profiles (認証ユーザーの事業所割り当て)
  ├─ id = auth.users.id (外部キー, ON DELETE CASCADE)
  ├─ facility_id (FK → facilities)
  ├─ role: 'admin' | 'staff' | 'viewer'
  └─ display_name

care_receivers (利用者情報) ★ facility_id 追加
  ├─ facility_id (NOT NULL, FK)
  └─ [既存フィールド]: code, name, age, gender, ...

case_records (ケース記録) ★ facility_id 追加
  ├─ facility_id (NOT NULL, FK)
  └─ [既存フィールド]: care_receiver_id, record_date, sections, ...
```

#### RLS ポリシー
| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| facilities | facility_id = 自分の割り当て | ✗ | ✗ | ✗ |
| staff_profiles | 自分 + (admin → facility内全員) | ✗ | admin → facility内 | ✗ |
| care_receivers | facility_id = current | facility_id = current | facility_id = current | facility_id = current |
| case_records | facility_id = current | facility_id = current | facility_id = current | facility_id = current |

#### Helper Function
```sql
get_current_facility_id()
  → auth.uid() の facility_id を返す
  → 全ポリシーで使用
```

### 2. **Seed Data 更新: seed.sql**
- `facility_id` を明示的に INSERT
- life-care: 14名, after-school: 10名
- UPSERT で既存データも migrated

### 3. **ドキュメント**

| ファイル | 内容 |
|--------|------|
| SUPABASE_RLS_GUIDE.md | アーキテクチャ, セキュリティ, トラブルシューティング |
| SUPABASE_RLS_CHECKLIST.md | Phase-by-phase 実装チェックリスト |
| API_ROUTE_EXAMPLE_RLS.md | Next.js API route 参考実装 |

---

## 🔐 セキュリティ要件達成

### ✅ 認証 (Authentication)
- Supabase Auth (email/password, OAuth)
- ログイン後 `auth.users(id)` が取得される

### ✅ テナント割り当て (Tenant Assignment)
- `staff_profiles` テーブルで `facility_id` に紐づけ
- 一ユーザー = 一事業所

### ✅ RLS ポリシー (Row Level Security)
- 全テーブルで RLS 有効化
- `get_current_facility_id()` 関数で統一的にチェック
- INSERT 時 `WITH CHECK` で `facility_id` 強制 (偽装防止)

### ✅ データ分離
- **care_receivers / case_records**: 同一 `facility_id` のみ CRUD
- **staff_profiles**: 自分見える + admin が facility 内全員見える
- **facilities**: 割り当て facility のみ見える

---

## 🚀 次のステップ

### Phase 1: Supabase 環境構築 (DBA/DevOps)
```bash
# マイグレーション実行
supabase db push
# または手動: Supabase ダッシュボード SQL Editor で実行

# Seed データ投入
# Supabase ダッシュボード SQL Editor で実行
```

### Phase 2: RLS テスト
```sql
-- テストアカウント作成後、各ポリシーをテスト
-- (詳細: SUPABASE_RLS_CHECKLIST.md)
```

### Phase 3: Next.js 実装
1. **認証**: Supabase Auth ログイン画面
2. **staff_profiles 取得**: ユーザーの `facility_id` 取得
3. **API routes**: RLS 自動適用
4. **UI**: facility 別フィルタリング表示

### Phase 4: 本番環境チェック
- RLS enable 確認
- テストアカウント相互アクセステスト
- エラーハンドリング (401, 403)

---

## 📋 リスク低減

| リスク | 対策 |
|-------|------|
| 他事業所データ漏洩 | RLS + facility_id チェック |
| トークン偽装 | INSERT 時 facility_id 強制 |
| admin 権限悪用 | admin は同一 facility 内のみ |
| データ混在 | migration で既存データ facility_id 割り当て |

---

## 💡 重要なポイント

1. **RLS は本番必須**
   - インターネット公開なら RLS なしは禁止
   - 医療データ漏洩 = 法的リスク

2. **facility_id 自動設定**
   - クライアント値は信頼しない
   - API で `auth.uid()` → `staff_profiles` → `facility_id` を取得

3. **テストが生命線**
   - 複数テストアカウントで相互アクセステスト
   - 403 が返される = RLS が正常に機能

4. **監査ログ**
   - 本番環境では pgaudit 有効化を推奨
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
