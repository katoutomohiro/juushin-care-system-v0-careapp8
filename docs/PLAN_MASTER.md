# 重忁E��アアプリ�E��Eスタープラン�E�絶対ルール�E�E
> **📌 すべてのAIエージェント�E開発老E��の忁E��指示**  
> - 本ファイルは設計ドキュメント�E **エントリーポインチE* でぁE 
> - 作業開始前に忁E��本ファイルを読み、参照頁E��に従ってください  
> - **推測禁止**: 不�E点は "不�E" と明記し、オーナ�Eに質問すること  
> - シークレチE���E�EPI キー等）�Eコミット禁止。Vercel 環墁E��数で管琁E
---

## 📖 ドキュメント参照頁E��（忁E��！E
### 1�E�⃣ 最初に読むドキュメンチE```
docs/PLAN_MASTER.md ↁE今ここ（絶対ルール�E�E  ↁEdocs/ai-collaboration-handbook.md�E�EI協調開発の役割刁E��・開発サイクル�E�E  ↁETECHNICAL_ARCHITECTURE.md�E�技術スタチE��・チE�EタモチE���E�E```

### 2�E�⃣ 機�E開発時に読むドキュメンチE```
docs/PLAN_CASE_RECORD.md�E�ケース記録仕様：ATさん完�E形を参照�E�E  ↁEdocs/FEATURES.md�E��E機�E一覧・ルート棚卸し結果�E�E  ↁEdocs/CONCURRENCY.md�E�同時編雁E��御�E�楽観ロチE��設計！E```

### 3�E�⃣ チE�Eロイ・運用時に読むドキュメンチE```
docs/PLAN_DEPLOY.md�E�Eercel + Supabase 本番運用手頁E��E  ↁEdocs/DEPLOYMENT.md�E�詳細チE�Eロイ手頁E�E環墁E��数�E�E```

### 4�E�⃣ 経緯確認�EトラブルシューチE��ング
```
docs/PLAN_HISTORY.md�E�開発経緯ログ�E�E04問題�EルーチE��ング整琁E��ど�E�E  ↁEdocs/ROUTING_ANALYSIS.md�E�ケース記録ルーチE��ング調査�E�E```

---

## 🎯 プロジェクト概要E
| 頁E�� | 冁E�� |
|------|------|
| **アプリ吁E* | 重忁E��ア支援アプリ�E�暫定名�E�E|
| **目皁E* | 医療�E介護現場での重症忁E��障がぁE�E老E��ア記録の効玁E�� |
| **技術スタチE��** | Next.js 15.2.4 (App Router)、React 19、TypeScript 5 |
| **スタイリング** | Tailwind CSS 3.4、shadcn/ui (Radix UI) |
| **チE�Eタ層** | Supabase (PostgreSQL + Auth + RLS) |
| **チE�Eロイ** | Vercel (Next.js) + Supabase (本番環墁E |
| **チE��チE* | Vitest、Playwright、Testing Library |
| **リポジトリ** | `katoutomohiro/juushin-care-system-v0-careapp8` |

---

## 🚨 絶対ルール�E�違反禁止�E�E
### 1. **推測禁止**
- 仕様が不�Eな場合�E「不�E」と明記し、作業を止めて質問すること
- 侁E "ATさんのチE��プレートフィールド�E�E�E ↁE不�EなめE"不�E" と書ぁE
### 2. **シークレチE��管琁E*
- API キー、データベ�Eス認証惁E��は **絶対にコミットしなぁE*
- Vercel 環墁E��数 (`NEXT_PUBLIC_SUPABASE_URL` など) で管琁E- `.env.local` はローカル開発のみ使用、`.gitignore` 忁E��E
### 3. **ドキュメント参照頁E���E厳宁E*
- 忁E�� `docs/PLAN_MASTER.md`�E�本ファイル�E�から読み始めめE- 機�E開発前に `docs/PLAN_CASE_RECORD.md` でケース記録の完�E形を確誁E- チE�Eロイ前に `docs/PLAN_DEPLOY.md` の手頁E��確誁E
### 4. **ATさん = 完�E形リファレンス**
- ケース記録の実裁E��迷ったら、「ATさんのペ�Eジ」を参�E実裁E��する
- URL: `/services/life-care/users/AT/case-records`
- チE��プレート、�E員選択、バリチE�EションなどすべてATさんで動作確認済み

### 5. **楽観ロチE��忁E��E*
- ケース記録の保存時は忁E�� `version` パラメータを送信
- 409 Conflict 時�E「他�E端末で更新されてぁE��す」ダイアログ表示
- 詳細: `docs/CONCURRENCY.md` 参�E

### 6. **個人惁E��の取り扱ぁE��厳格�E�E*
- **ログ出力禁止**: `full_name`, `address`, `phone`, `emergency_contact` などは `console.log` に絶対に出力しなぁE- **開発環墁E��は匿名データのみ**: 開発・レビュー時�E `display_name`�E�侁E AT, User-001�E��Eみ使用
- **本番のみ実名入劁E*: 個人惁E��は本番環墁E��のみ入力し、E��発環墁E��は含めなぁE- **サンプルチE�Eタ禁止**: migration めEseed ファイルに実名・住所・電話番号を含めなぁE- **RLS で保護**: Supabase RLS で職員のみアクセス可能にする�E�Enon からは個人惁E��を取得不可�E�E- **監査ログの最小化**: audit チE�Eブルには変更されたフィールド名のみ記録し、値は含めなぁE
---

## �E� 個人惁E��管琁E��イヤ�E�忁E���E�E
### 概要E医療機関として求められるセキュリチE��と利便性のバランスを実現するため、多層防御を実裁E��てぁE��す、E
### 関連ドキュメンチE- **詳細設計書**: [PLAN_PERSONAL_INFO_SECURITY.md](./PLAN_PERSONAL_INFO_SECURITY.md)
- **RLS ポリシー**: `supabase/migrations/20260128110000_extend_rls_role_separation.sql`
- **UI 権限制御**: `components/edit-care-receiver-dialog.tsx`

### 権限別表示制御

```
display_name�E�匿名表示�E�E━E全ユーザー表示
━Eログ出劁E ✁EOK
━E編雁E��陁E staff/nurse/admin

full_name, birthday, gender�E�個人識別惁E���E�E━Estaff/nurse/admin のみ表示
━Enurse/admin が編雁E��
━Eログ出劁E ❁E禁止

address, phone, emergency_contact�E�連絡先情報�E�E━Eadmin のみ表示
━Eadmin のみ編雁E━Eログ出劁E ❁E禁止

medical_care_detail�E�医療情報�E�E━Enurse/admin のみ表示
━Enurse/admin が編雁E��
━Eログ出劁E ❁E禁止
```

### 実裁E��況E
| 頁E�� | ファイル | 状慁E|
|------|---------|------|
| セキュリチE��設計書 | `docs/PLAN_PERSONAL_INFO_SECURITY.md` | ✁E完�E |
| DB Migration 1 | `supabase/migrations/20260128100000_add_personal_info_to_care_receivers.sql` | ✁E完�E |
| DB Migration 2 | `supabase/migrations/20260128110000_extend_rls_role_separation.sql` | ✁E完�E |
| UI コンポ�EネンチE| `components/edit-care-receiver-dialog.tsx` | ✁E権限�Eース表示実裁E|
| チE��ト手頁E| `docs/TEST_CARE_RECEIVER_EDIT.md` | ✁E7シナリオ記輁E|

---

## �E�📂 チE��レクトリ構造�E�重要ファイル�E�E
```
juushin-care-system-v0-careapp8/
├── docs/
━E  ├── PLAN_MASTER.md ↁE本ファイル�E�エントリーポイント！E━E  ├── PLAN_PERSONAL_INFO_SECURITY.md ↁE個人惁E��セキュリチE��設訁E━E  ├── PLAN_DEPLOY.md ↁEVercel 本番チE�Eロイ手頁E━E  ├── PLAN_CASE_RECORD.md ↁEケース記録仕槁E━E  ├── PLAN_HISTORY.md ↁE開発経緯ログ
━E  ├── FEATURES.md ↁE全機�E一覧�E�E2ルート！E━E  ├── CONCURRENCY.md ↁE楽観ロチE��設訁E━E  ├── DEPLOYMENT.md ↁEチE�Eロイ詳細手頁E━E  ├── TEST_CARE_RECEIVER_EDIT.md ↁE利用老E��報編雁E��スト手頁E━E  └── ai-collaboration-handbook.md ↁEAI協調開発ルール
├── app/
━E  ├── api/care-receivers/[id]/route.ts ↁE個人惁E�� API�E�権限チェチE���E�E━E  ├── api/case-records/save/route.ts ↁEケース記録保存API�E�E09 Conflict 対応！E━E  └── services/[serviceId]/users/[userId]/case-records/page.tsx
├── components/
━E  ├── edit-care-receiver-dialog.tsx ↁE権限�Eース個人惁E��編雁E��ォーム
━E  └── case-records/CaseRecordFormClient.tsx
├── supabase/migrations/
━E  ├── 20260128100000_add_personal_info_to_care_receivers.sql
━E  ├── 20260128110000_extend_rls_role_separation.sql
━E  └── 20260128093212_add_version_to_case_records.sql
├── .env.local ↁEローカル環墁E��数�E�Egitignore 忁E��！E└── .github/copilot-instructions.md ↁEAI Copilot への持E��
```

---

## 🔐 環墁E��数�E�Eercel 設定忁E��！E
### Production / Preview / Development 全環墁E��設宁E
| 環墁E��数 | 説昁E| 侁E|
|---------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクチEURL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー�E��E開OK�E�E| `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー�E�サーバ�Eのみ�E�E| `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | アプリの本番 URL�E�推奨�E�E| `https://juushin-care.vercel.app` |

**設定手頁E*: `docs/PLAN_DEPLOY.md` 参�E

---

## 🎓 開発フロー�E�EI協調�E�E
### 作業開始時の忁E��チェチE��
1. ✁E`docs/PLAN_MASTER.md`�E�本ファイル�E�を読んだ
2. ✁E`docs/ai-collaboration-handbook.md` で役割刁E��を確認しぁE3. ✁E`docs/PLAN_PERSONAL_INFO_SECURITY.md` で個人惁E��管琁E��確認しぁE4. ✁E不�E点は "不�E" と書ぁE��質問する準備ができた
5. ✁EシークレチE��をコミットしなぁE��とを確認しぁE
### タスク実行頁E��E```
1. オーナ�Eから持E��受頁E   ↁE2. docs/PLAN_MASTER.md で参�E頁E��確誁E   ↁE3. 該当するPLAN_*.md を読む�E�EASE_RECORD / DEPLOY / HISTORY�E�E   ↁE4. 実裁E��EhatGPT 主導、Copilot/v0 補助�E�E   ↁE5. オーナ�E検証
   ↁE6. コミット＋PR作�E
```

---

## 📊 現在の開発状況E��E026年1朁E8日時点�E�E
### ✁E完亁E��み
- [x] 機�E棚卸し！E2ルート、E1 API エンド�Eイント！E- [x] ケース記録ルーチE��ング整琁E��動皁EuserId 対応！E- [x] 楽観ロチE��実裁E��Eersion カラム + 409 Conflict�E�E- [x] Vercel チE�Eロイ設計ドキュメント作�E

### 🚧 進行中
- [ ] PLAN_*.md シリーズの整備（本タスク�E�E- [ ] Vercel 本番チE�Eロイ実衁E- [ ] RLS ポリシー再確誁E
### 📋 優先タスク�E�次のスチE��プ！E1. **Vercel 本番チE�Eロイ**: `docs/PLAN_DEPLOY.md` 手頁E��従って実衁E2. **ATさんチE�Eタ投�E**: Supabase に ATさんのシードデータ登録
3. **動作確誁E*: トップ表示 ↁEログイン ↁEATさんペ�Eジ ↁEケース記録導緁E
---

## �E 困ったとき�E参�E允E
| 質問�E容 | 参�EドキュメンチE|
|---------|----------------|
| ケース記録の仕様�E�E�E| `docs/PLAN_CASE_RECORD.md` |
| Vercel チE�Eロイ手頁E�E�E�E| `docs/PLAN_DEPLOY.md` |
| 過去の経緯を知りたぁE| `docs/PLAN_HISTORY.md` |
| 全機�E一覧は�E�E| `docs/FEATURES.md` |
| 同時編雁E��御の仕絁E��は�E�E| `docs/CONCURRENCY.md` |
| AI の役割刁E��は�E�E| `docs/ai-collaboration-handbook.md` |

---

**最終更新**: 2026年1朁E8日  
**メンチE��**: ChatGPT (gpt-5-codex) + オーナ�E  
**次回更新タイミング**: 本番チE�Eロイ完亁E��、また�E仕様変更晁E
