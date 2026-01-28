# 開発経緯ログ

> **📌 対象読者**: 過去の経緯を理解したい開発者、トラブルシューティング担当者  
> **前提**: `docs/PLAN_MASTER.md` を先に読んでいること

---

## 📅 時系列イベント

### 2026年1月28日（最新）: Vercel build fix → 機能統合完了

#### タスク: Vercel Build Failed 最終解決 + URL生成関数統一化

**背景**: PR #244（個人情報セキュリティ設計）で Vercel build が失敗

**修正内容**:

1. **JSX 構文エラー修正**
   - **ファイル1**: `app/home-client.tsx` L482
     - エラー: href属性が崩れていた形式
     - 修正: 正しい URL テンプレート文字列に統一
   
   - **ファイル2**: `app/services/[serviceId]/users/[userId]/page.tsx` L676
     - エラー: Dialog 閉じタグ `</div>` 欠落
     - 修正: 正しい JSX ネスト構造に修正
   
   - **ファイル3**: `components/edit-care-receiver-dialog.tsx`
     - エラー: medical_care section が admin block 内に閉じ込められていた
     - 修正: インデント調整し、admin block の外に配置

   **ビルド結果**: ✅ 成功（エラー 0件）

2. **URL生成関数の共通化**
   - **新規作成**: `lib/utils/care-receiver-urls.ts`
   - **関数一覧**:
     - `getCaseRecordsHref(serviceId, userId)`: ケース記録ページ URL
     - `getCareReceiverDetailHref(serviceId, userId)`: 利用者詳細ページ URL
     - `getDailyLogsHref(serviceId, userId)`: 日誌ページ URL
   
   - **適用先**:
     - `app/home-client.tsx`: ケース記録カード
     - `app/services/[serviceId]/users/[userId]/page.tsx`: ケース記録カード

   **効果**: 404防止 + URL生成ロジック一元化

3. **個人情報編集機能の動作確認**
   - ✅ EditCareReceiverDialog: display_name と full_name を分離入力
   - ✅ API Route: PUT /api/care-receivers/[id] で楽観ロック実装
   - ✅ RLS: PII（full_name, address等）は staff/nurse/admin のみ
   - ✅ ログ出力制限: API応答で PII を除外
   - ✅ 監査ログ: 変更キー名のみ記録（値は含まず）

**コミット**: 57f91a8（refactor: URL生成関数を共通化し、ケース記録導線の404防止）

**成果物**:
- ✅ Vercel build 成功（0エラー）
- ✅ ケース記録導線: 404 なし（デフォルト値 'AT' で安全）
- ✅ 個人情報編集: 表示名と本名を分離管理
- ✅ 同時編集制御: version による競合検出（409 Conflict ダイアログ実装済み）

**次ステップ**:
1. PR #244 を Vercel Preview 通す
2. オーナー検証（ケース記録導線、PII編集）
3. main に マージ

---

### 2026年1月28日: 機能棚卸し → 404修正 → Vercel準備

#### タスク1: 機能棚卸し
**目的**: 実装済み機能を網羅的にリストアップし、404候補を検出

**実施内容**:
- App Router の全ルート（32ルート）を列挙
- API エンドポイント（11個）を列挙
- リンク文字列（"ケース記録"など）と実際のルートを照合

**成果物**:
- `docs/FEATURES.md` 作成
- 結果: **404候補 0件**（すべてのリンクが対応するルートを持つ）

**発見事項**:
- ✅ ルートレベルでの 404 は無し
- ⚠️ ただし、`home-client.tsx` の行482に **ハードコードされた AT リンク** を発見

---

#### タスク2: ケース記録ルーティング修正
**問題**: `home-client.tsx` のケース記録リンクが `userId: "AT"` にハードコード

**影響範囲**:
- ATさん以外の利用者でケース記録ページにアクセスできない
- 動的な利用者選択が機能していない

**調査手順**:
```bash
# ケース記録リンクの全出現箇所を検索
rg -n "case-records" app --type tsx
```

**修正内容**:
- **ファイル**: `app/home-client.tsx` 行482
- **Before**: `href="/services/life-care/users/AT/case-records"`
- **After**: `href={`/services/life-care/users/${selectedCareReceiverId || 'AT'}/case-records`}`

**使用した状態変数**: 既存の `selectedCareReceiverId`（新規依存なし）

**成果物**:
- `docs/ROUTING_ANALYSIS.md` 作成
- コミット: `fix/case-records-routing-2026-01-28` ブランチ

---

#### タスク3: Vercel デプロイ準備
**目的**: 本番運用に向けて、同時編集制御とデプロイ手順を整備

**実施内容**:

1. **docs/DEPLOYMENT.md 作成**
   - Vercel + Supabase デプロイ手順
   - 環境変数設定ガイド
   - ヘルスチェック・モニタリング方針

2. **docs/CONCURRENCY.md 作成**
   - 楽観ロック設計書
   - `version` カラムによる競合検出
   - 409 Conflict 処理フロー

3. **データベースマイグレーション**
   - **ファイル**: `supabase/migrations/20260128093212_add_version_to_case_records.sql`
   - **内容**:
     - `case_records` に `version INT` カラム追加
     - 自動インクリメントトリガー `increment_version()` 作成
     - パフォーマンス用インデックス作成

4. **API 修正**
   - **ファイル**: `app/api/case-records/save/route.ts`
   - **内容**:
     - `version` パラメータを受け取る
     - UPDATE 時に `.eq("version", version)` でチェック
     - 0件更新なら 409 Conflict を返却

5. **フロントエンド実装**
   - **ファイル**: `src/components/case-records/CaseRecordFormClient.tsx`
   - **内容**:
     - `currentVersion` と `currentRecordId` ステート追加
     - 保存時に `version` を送信
     - 409 受信時に AlertDialog 表示（「他の端末で更新されています」）
     - 再読み込みボタンで最新データ取得

6. **ドキュメント更新**
   - **ファイル**: `docs/FEATURES.md`
   - **内容**: セキュリティ・運用機能セクション追加

**成果物**:
- コミット: `feat/deployment-concurrency-2026-01-28` ブランチ（06f1c19）
- 6ファイル変更、874行追加

---

### 過去のイベント（参照情報）

#### 2025年2月: オブジェクトキー構文エラー
**問題**: フォーム入力で `obj[someKey]` を更新する際、`someKey` の型が限定されておらずランタイムエラー

**対処法**:
- Zod スキーマで許容キーを定義
- 型安全なアクセサ関数 (`updateField<T extends keyof Schema>`) を作成
- 単体テストを追加し回帰を防止

**教訓**: 動的オブジェクトキーは必ず型制約を設ける

---

## 🔍 トラブルシューティング履歴

### 問題: "AT ユーザーが存在しない"
**発生日**: 2026年1月28日

**症状**:
- ホーム画面でケース記録リンクをクリック → 404 エラー
- ATさんのプロフィールページにアクセスできない

**原因**:
- Supabase に `userId: "AT"` のデータが存在しない
- シードデータが投入されていない

**解決方法**:
```sql
-- Supabase SQL Editor で実行
INSERT INTO care_receivers (id, user_id, name, service_id)
VALUES (
  gen_random_uuid(),
  'AT',
  'ATさん',
  '<service_uuid>'
);
```

**再発防止策**:
- 開発用シードデータ投入スクリプトを作成（予定）
- `docs/PLAN_DEPLOY.md` に「ATさんデータ投入」手順を明記

---

### 問題: "version が常に 1 のまま"
**発生日**: 2026年1月28日（テスト時）

**症状**:
- ケース記録を保存しても `version` が増加しない
- 同時編集制御が動作しない

**原因**:
- トリガー `increment_version()` が正しく作成されていない
- マイグレーションが本番 Supabase に適用されていない

**解決方法**:
```bash
# ローカルでマイグレーションをテスト
npx supabase db reset

# 本番に適用
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

**確認方法**:
```sql
-- Supabase SQL Editor で実行
SELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;
-- version が 1, 2, 3... と増加していることを確認
```

---

### 問題: "Vercel 環境変数が反映されない"
**発生日**: 2026年1月28日（デプロイ準備時）

**症状**:
- Vercel にデプロイ後、Supabase 接続エラー
- `NEXT_PUBLIC_SUPABASE_URL` が `undefined`

**原因**:
- 環境変数を "Production" のみに設定していた
- "Preview" と "Development" にも設定が必要

**解決方法**:
1. Vercel Dashboard → Environment Variables
2. 各環境変数を **Production, Preview, Development 全てに適用**
3. 再デプロイ: `vercel --prod`

**教訓**: Vercel の環境変数は3つの環境（Production/Preview/Development）に個別設定が必要

---

## 📝 設計上の決定事項

### 1. ATさんを完成形リファレンスとする
**決定日**: 2026年1月28日

**理由**:
- ATさんのページは全機能が実装済み（カスタムフィールド、職員選択、保存、一覧）
- 他の利用者ページを実装する際、ATさんを参照実装とする

**影響範囲**:
- 新規利用者追加時は ATさんのコンポーネントを流用
- テンプレート構造も ATさんを基準にする

---

### 2. 楽観ロックを標準採用
**決定日**: 2026年1月28日

**理由**:
- 医療現場では複数スタッフが同時にケア記録を編集する可能性が高い
- Last Write Wins ではデータロスが発生する
- 409 Conflict で明確にエラー通知する方が安全

**実装方法**:
- `version` カラムを全更新対象テーブルに追加
- API で `version` チェック、不一致なら 409
- フロントで 409 受信時にダイアログ表示

---

### 3. シークレットは Vercel 環境変数で管理
**決定日**: 2026年1月28日

**理由**:
- `.env.local` をコミットするとセキュリティリスク
- Vercel の環境変数は暗号化され、ビルド時のみ注入される
- Production/Preview/Development で環境を分離できる

**運用ルール**:
- `.env.local` はローカル開発のみ使用
- `.gitignore` に `.env.local` を追加
- Vercel 環境変数を "全環境" に適用

---

## 🔄 今後の課題

### 短期（1-2週間）
- [ ] Vercel 本番デプロイ実行
- [ ] ATさんシードデータ投入（Supabase）
- [ ] RLS ポリシー再確認
- [ ] 動作確認（トップ → ログイン → ATさん → ケース記録）

### 中期（1-2ヶ月）
- [ ] 他の利用者でもケース記録が動作するか検証
- [ ] カスタムフィールドのテンプレート管理 UI 作成
- [ ] オフライン対応（IndexedDB + 同期）

### 長期（3ヶ月以降）
- [ ] AI による記録提案（Vercel AI SDK）
- [ ] 音声入力対応（Whisper API）
- [ ] 編集履歴機能（audit log）

---

## 📚 関連ドキュメント

- **機能棚卸し結果**: `docs/FEATURES.md`
- **ルーティング調査**: `docs/ROUTING_ANALYSIS.md`
- **デプロイ手順**: `docs/PLAN_DEPLOY.md`
- **ケース記録仕様**: `docs/PLAN_CASE_RECORD.md`
- **楽観ロック設計**: `docs/CONCURRENCY.md`

---

**最終更新**: 2026年1月28日  
**次回更新タイミング**: 本番デプロイ完了後、または重要な設計変更時
