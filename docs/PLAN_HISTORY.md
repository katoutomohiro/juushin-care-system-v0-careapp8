# 開発経緯ログ

> **📌 対象読老E*: 過去の経緯を理解したぁE��発老E��トラブルシューチE��ング拁E��老E 
> **前提**: `docs/PLAN_MASTER.md` を�Eに読んでぁE��こと

---

## 📅 時系列イベンチE
### 2026年1朁E8日�E�最新�E�E Vercel build fix ↁE機�E統合完亁E
#### タスク: Vercel Build Failed 最終解決 + URL生�E関数統一匁E
**背景**: PR #244�E�個人惁E��セキュリチE��設計）で Vercel build が失敁E
**修正冁E��**:

1. **JSX 構文エラー修正**
   - **ファイル1**: `app/home-client.tsx` L482
     - エラー: href属性が崩れてぁE��形弁E     - 修正: 正しい URL チE��プレート文字�Eに統一
   
   - **ファイル2**: `app/services/[serviceId]/users/[userId]/page.tsx` L676
     - エラー: Dialog 閉じタグ `</div>` 欠落
     - 修正: 正しい JSX ネスト構造に修正
   
   - **ファイル3**: `components/edit-care-receiver-dialog.tsx`
     - エラー: medical_care section ぁEadmin block 冁E��閉じ込められてぁE��
     - 修正: インチE��ト調整し、admin block の外に配置

   **ビルド結果**: ✁E成功�E�エラー 0件�E�E
2. **URL生�E関数の共通化**
   - **新規作�E**: `lib/utils/care-receiver-urls.ts`
   - **関数一覧**:
     - `getCaseRecordsHref(serviceId, userId)`: ケース記録ペ�Eジ URL
     - `getCareReceiverDetailHref(serviceId, userId)`: 利用老E��細ペ�Eジ URL
     - `getDailyLogsHref(serviceId, userId)`: 日誌�Eージ URL
   
   - **適用允E*:
     - `app/home-client.tsx`: ケース記録カーチE     - `app/services/[serviceId]/users/[userId]/page.tsx`: ケース記録カーチE
   **効极E*: 404防止 + URL生�EロジチE��一允E��

3. **個人惁E��編雁E���Eの動作確誁E*
   - ✁EEditCareReceiverDialog: display_name と full_name を�E離入劁E   - ✁EAPI Route: PUT /api/care-receivers/[id] で楽観ロチE��実裁E   - ✁ERLS: PII�E�Eull_name, address等）�E staff/nurse/admin のみ
   - ✁Eログ出力制陁E API応答で PII を除夁E   - ✁E監査ログ: 変更キー名�Eみ記録�E�値は含まず！E
**コミッチE*: 57f91a8�E�Eefactor: URL生�E関数を�E通化し、ケース記録導線�E404防止�E�E
**成果物**:
- ✁EVercel build 成功�E�Eエラー�E�E- ✁Eケース記録導緁E 404 なし（デフォルト値 'AT' で安�E�E�E- ✁E個人惁E��編雁E 表示名と本名を刁E��管琁E- ✁E同時編雁E��御: version による競合検�E�E�E09 Conflict ダイアログ実裁E��み�E�E
**次スチE��チE*:
1. PR #244 めEVercel Preview 通す
2. オーナ�E検証�E�ケース記録導線、PII編雁E��E3. main に マ�Eジ

---

### 2026年1朁E8日: 機�E棚卸ぁEↁE404修正 ↁEVercel準備

#### タスク1: 機�E棚卸ぁE**目皁E*: 実裁E��み機�Eを網羁E��にリストアチE�Eし、E04候補を検�E

**実施冁E��**:
- App Router の全ルート！E2ルート）を列挙
- API エンド�Eイント！E1個）を列挙
- リンク斁E���E�E�Eケース記録"など�E�と実際のルートを照吁E
**成果物**:
- `docs/FEATURES.md` 作�E
- 結果: **404候裁E0件**�E�すべてのリンクが対応するルートを持つ�E�E
**発見事頁E*:
- ✁Eルートレベルでの 404 は無ぁE- ⚠�E�Eただし、`home-client.tsx` の衁E82に **ハ�Eドコードされた AT リンク** を発要E
---

#### タスク2: ケース記録ルーチE��ング修正
**問顁E*: `home-client.tsx` のケース記録リンクぁE`userId: "AT"` にハ�EドコーチE
**影響篁E��**:
- ATさん以外�E利用老E��ケース記録ペ�EジにアクセスできなぁE- 動的な利用老E��択が機�EしてぁE��ぁE
**調査手頁E*:
```bash
# ケース記録リンクの全出現箁E��を検索
rg -n "case-records" app --type tsx
```

**修正冁E��**:
- **ファイル**: `app/home-client.tsx` 衁E82
- **Before**: `href="/services/life-care/users/AT/case-records"`
- **After**: `href={`/services/life-care/users/${selectedCareReceiverId || 'AT'}/case-records`}`

**使用した状態変数**: 既存�E `selectedCareReceiverId`�E�新規依存なし！E
**成果物**:
- `docs/ROUTING_ANALYSIS.md` 作�E
- コミッチE `fix/case-records-routing-2026-01-28` ブランチE
---

#### タスク3: Vercel チE�Eロイ準備
**目皁E*: 本番運用に向けて、同時編雁E��御とチE�Eロイ手頁E��整傁E
**実施冁E��**:

1. **docs/DEPLOYMENT.md 作�E**
   - Vercel + Supabase チE�Eロイ手頁E   - 環墁E��数設定ガイチE   - ヘルスチェチE��・モニタリング方釁E
2. **docs/CONCURRENCY.md 作�E**
   - 楽観ロチE��設計書
   - `version` カラムによる競合検�E
   - 409 Conflict 処琁E��ロー

3. **チE�Eタベ�Eスマイグレーション**
   - **ファイル**: `supabase/migrations/20260128093212_add_version_to_case_records.sql`
   - **冁E��**:
     - `case_records` に `version INT` カラム追加
     - 自動インクリメントトリガー `increment_version()` 作�E
     - パフォーマンス用インチE��クス作�E

4. **API 修正**
   - **ファイル**: `app/api/case-records/save/route.ts`
   - **冁E��**:
     - `version` パラメータを受け取めE     - UPDATE 時に `.eq("version", version)` でチェチE��
     - 0件更新なめE409 Conflict を返却

5. **フロントエンド実裁E*
   - **ファイル**: `src/components/case-records/CaseRecordFormClient.tsx`
   - **冁E��**:
     - `currentVersion` と `currentRecordId` スチE�Eト追加
     - 保存時に `version` を送信
     - 409 受信時に AlertDialog 表示�E�「他�E端末で更新されてぁE��す」！E     - 再読み込みボタンで最新チE�Eタ取征E
6. **ドキュメント更新**
   - **ファイル**: `docs/FEATURES.md`
   - **冁E��**: セキュリチE��・運用機�Eセクション追加

**成果物**:
- コミッチE `feat/deployment-concurrency-2026-01-28` ブランチE��E6f1c19�E�E- 6ファイル変更、E74行追加

---

### 過去のイベント（参照惁E���E�E
#### 2025年2朁E オブジェクトキー構文エラー
**問顁E*: フォーム入力で `obj[someKey]` を更新する際、`someKey` の型が限定されておらずランタイムエラー

**対処況E*:
- Zod スキーマで許容キーを定義
- 型安�Eなアクセサ関数 (`updateField<T extends keyof Schema>`) を作�E
- 単体テストを追加し回帰を防止

**教訁E*: 動的オブジェクトキーは忁E��型制紁E��設ける

---

## 🔍 トラブルシューチE��ング履歴

### 問顁E "AT ユーザーが存在しなぁE
**発生日**: 2026年1朁E8日

**痁E��**:
- ホ�Eム画面でケース記録リンクをクリチE�� ↁE404 エラー
- ATさんのプロフィールペ�EジにアクセスできなぁE
**原因**:
- Supabase に `userId: "AT"` のチE�Eタが存在しなぁE- シードデータが投入されてぁE��ぁE
**解決方況E*:
```sql
-- Supabase SQL Editor で実衁EINSERT INTO care_receivers (id, user_id, name, service_id)
VALUES (
  gen_random_uuid(),
  'AT',
  'ATさん',
  '<service_uuid>'
);
```

**再発防止筁E*:
- 開発用シードデータ投�Eスクリプトを作�E�E�予定！E- `docs/PLAN_DEPLOY.md` に「ATさんチE�Eタ投�E」手頁E��明訁E
---

### 問顁E "version が常に 1 のまま"
**発生日**: 2026年1朁E8日�E�テスト時�E�E
**痁E��**:
- ケース記録を保存してめE`version` が増加しなぁE- 同時編雁E��御が動作しなぁE
**原因**:
- トリガー `increment_version()` が正しく作�EされてぁE��ぁE- マイグレーションが本番 Supabase に適用されてぁE��ぁE
**解決方況E*:
```bash
# ローカルでマイグレーションをテスチEnpx supabase db reset

# 本番に適用
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

**確認方況E*:
```sql
-- Supabase SQL Editor で実衁ESELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;
-- version ぁE1, 2, 3... と増加してぁE��ことを確誁E```

---

### 問顁E "Vercel 環墁E��数が反映されなぁE
**発生日**: 2026年1朁E8日�E�デプロイ準備時！E
**痁E��**:
- Vercel にチE�Eロイ後、Supabase 接続エラー
- `NEXT_PUBLIC_SUPABASE_URL` ぁE`undefined`

**原因**:
- 環墁E��数めE"Production" のみに設定してぁE��
- "Preview" と "Development" にも設定が忁E��E
**解決方況E*:
1. Vercel Dashboard ↁEEnvironment Variables
2. 吁E��墁E��数めE**Production, Preview, Development 全てに適用**
3. 再デプロイ: `vercel --prod`

**教訁E*: Vercel の環墁E��数は3つの環墁E��Eroduction/Preview/Development�E�に個別設定が忁E��E
---

## 📝 設計上�E決定事頁E
### 1. ATさんを完�E形リファレンスとする
**決定日**: 2026年1朁E8日

**琁E��**:
- ATさんのペ�Eジは全機�Eが実裁E��み�E�カスタムフィールド、�E員選択、保存、一覧�E�E- 他�E利用老E�Eージを実裁E��る際、ATさんを参照実裁E��する

**影響篁E��**:
- 新規利用老E��加時�E ATさんのコンポ�Eネントを流用
- チE��プレート構造めEATさんを基準にする

---

### 2. 楽観ロチE��を標準採用
**決定日**: 2026年1朁E8日

**琁E��**:
- 医療現場では褁E��スタチE��が同時にケア記録を編雁E��る可能性が高い
- Last Write Wins ではチE�Eタロスが発生すめE- 409 Conflict で明確にエラー通知する方が安�E

**実裁E��況E*:
- `version` カラムを�E更新対象チE�Eブルに追加
- API で `version` チェチE��、不一致なめE409
- フロントで 409 受信時にダイアログ表示

---

### 3. シークレチE��は Vercel 環墁E��数で管琁E**決定日**: 2026年1朁E8日

**琁E��**:
- `.env.local` をコミットするとセキュリチE��リスク
- Vercel の環墁E��数は暗号化され、ビルド時のみ注入されめE- Production/Preview/Development で環墁E��刁E��できる

**運用ルール**:
- `.env.local` はローカル開発のみ使用
- `.gitignore` に `.env.local` を追加
- Vercel 環墁E��数めE"全環墁E に適用

---

## 🔄 今後�E課顁E
### 短期！E-2週間！E- [ ] Vercel 本番チE�Eロイ実衁E- [ ] ATさんシードデータ投�E�E�Eupabase�E�E- [ ] RLS ポリシー再確誁E- [ ] 動作確認（トチE�E ↁEログイン ↁEATさん ↁEケース記録�E�E
### 中期！E-2ヶ月！E- [ ] 他�E利用老E��もケース記録が動作するか検証
- [ ] カスタムフィールド�EチE��プレート管琁EUI 作�E
- [ ] オフライン対応！EndexedDB + 同期�E�E
### 長期！Eヶ月以降！E- [ ] AI による記録提案！Eercel AI SDK�E�E- [ ] 音声入力対応！Ehisper API�E�E- [ ] 編雁E��歴機�E�E�Eudit log�E�E
---

## 📚 関連ドキュメンチE
- **機�E棚卸し結果**: `docs/FEATURES.md`
- **ルーチE��ング調査**: `docs/ROUTING_ANALYSIS.md`
- **チE�Eロイ手頁E*: `docs/PLAN_DEPLOY.md`
- **チE�EロイチェチE��リスチE*: `docs/DEPLOY_CHECKLIST.md`
- **ケース記録仕槁E*: `docs/PLAN_CASE_RECORD.md`
- **楽観ロチE��設訁E*: `docs/CONCURRENCY.md`

---

### 2026年2朁E日: チE�EロイチェチE��リスト作�E完亁E
#### タスク: 本番チE�Eロイ向けチェチE��リスト�E斁E��

**背景**: PLAN_DEPLOY.md に記載されたチE�Eロイ手頁E��実運用向けのチェチE��リスト化

**修正冁E��**:

1. **新規ドキュメント作�E**: `docs/DEPLOY_CHECKLIST.md`
   - **構�E**: セクション A�E�J�E��E10セクション�E�E     - A. チE�Eロイ前（ローカル�E�E     - B. Supabase�E�本番�E�準備
     - C. Vercel 準備�E�環墁E��数�E�E     - D. チE�Eロイ�E�Eercel CLI 推奨�E�E     - E. 本番 Supabase に Migration 適用
     - F. セキュリチE��確認（個人惁E���E�E     - G. チE�Eロイ後�E動作確認（最短チェチE���E�E     - H. 監視�Eログ
     - I. トラブル時（最小手頁E��E     - J. ロールバック�E�緊急時�Eみ�E�E   
   - **特徴**:
     - チェチE��ボックス形式で実行状況を追跡可能
     - 確認コマンド、SQL クエリを記輁E     - シークレチE��のコミット禁止を�E訁E     - PLAN_DEPLOY.md の頁E��のみを抽出�E�推測追加なし！E
**判断琁E��**: 本番チE�Eロイを安�Eに実行するため、褁E��なチE�Eロイ手頁E��段階的に確認できるチェチE��リストに明文匁E
**影響篁E��**: ドキュメント�Eみ�E�実裁E�ECI・workflow への影響なし！E
**マ�Eジ状況E*: PR #270 ↁESquash and merge 完亁E
**成果物**:
- ✁EDEPLOY_CHECKLIST.md 作�E
- ✁EチE�Eロイ剁E中/後�Eタスク可視化
- ✁EセキュリチE��確認頁E��の明確匁E- ✁Eトラブル対応フローの整琁E
---

**最終更新**: 2026年2朁E日  
**次回更新タイミング**: 本番チE�Eロイ完亁E��、また�E重要な設計変更晁E
