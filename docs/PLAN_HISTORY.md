# 開発経緯ログ

> **📌 対象読者**: 過去の経緯を理解したい開発者・トラブルシューティング時に確認
> **前提**: `docs/PLAN_MASTER.md` を先に読んでいること

---

## 2026-02-20: serviceId Slug/UUID 正規化 Hotfix

### 背景

フェーズ 2 で実装した API 要認可ガードで、serviceId として slug 形式（`life-care`）を受け付けるとき、内部で UUID 形式（`550e8400-...`) が必要となり、型の不一致から 500 エラーが発生する可能性があった。

抜本対応：serviceId を受け取った直後に UUID に正規化し、以降は UUID ベースで認可・クエリを実行。

### 実装内容（コード）

#### 修正ファイル（2 個）

1. **lib/authz/serviceScope.ts**
   - `isValidUUID()` インポート追加（route-helpers から）
   - **新規関数**: `resolveServiceIdToUuid(supabase, serviceId)`
     - UUID 形式なら `services.id` で検証→UUID 返却
     - slug 形式なら `services.slug` で lookup→UUID 返却
     - 見つからなければ 404 エラー
     - 形式不正なら 400 エラー
   - **修正**: `assertServiceAssignment(userId, serviceUuid)`
     - 引数を `serviceId` → `serviceUuid` に変更（UUID 前提）
     - UUID 形式チェック追加（`isValidUUID()`）
   - **修正**: `requireServiceIdAndAssignment()`
     - 戻り値を `[serviceId, error]` → `[serviceUuid, serviceSlug, error]` に変更
     - `resolveServiceIdToUuid()` 呼び出し追加

2. **app/api/care-receivers/route.ts**
   - インポート: `resolveServiceIdToUuid` 追加
   - **STEP 2.5 追加**: `resolveServiceIdToUuid()` で slug/UUID 正規化
   - **STEP 3 修正**: `assertServiceAssignment(userId, serviceUuid)` で UUID を渡す
   - **STEP 4 修正**: クエリを `service_code` → `facility_id` (UUID) でスコープ
     - care_receivers には facility_id カラムが必要（確認）
   - **レスポンス修正**: `serviceCode` に slug を返す（UUID ではなく）

### テーブル構造確認

**care_receivers テーブル** (確認):
- `facility_id` (UUID) ← このカラムで services テーブルと紐付け
- `service_code` (text) ← 従来のスラッグ相当（廃止予定？）

**services テーブル**:
- `id` (UUID) - PRIMARY KEY
- `slug` (text, UNIQUE) - e.g., "life-care", "after-school"

### 動作シナリオ（想定）

| リクエスト | flow | 期待値 | 実装状 |
|----------|------|--------|--------|
| `?serviceId=life-care` | resolve(life-care)→UUID | 200 | ✓ STEP 2.5 resolve |
| `?serviceId=550e...` (UUID) | resolve(550e...)→UUID | 200 | ✓ STEP 2.5 resolve |
| （なし） | requireServiceIdFromRequest | 400 | ✓ STEP 2 |
| `?serviceId=invalid` | resolve(invalid)→404 | 404 | ✓ STEP 2.5 resolve |
| `?serviceId=life-care` (割当無し) | assertServiceAssignment | 403 | ✓ STEP 3 |

### 確認タスク

| # | 項目 | ファイル | 優先度 | 状態 |
|----|------|---------|--------|------|
| CT-7 | care_receivers.facility_id の存在確認 | DB schema | HIGH | ⏳ |
| CT-8 | services.slug/id ペアが完全に設定されているか確認 | DB seed | HIGH | ⏳ |
| CT-9 | /api/care-receivers 動作テスト（slug+UUID 両形式） | integration test | HIGH | ⏳ |

### 参考資料

- フェーズ 2 実装: [docs/PLAN_HISTORY.md#2026-02-20-API-認可強制実装フェーズ2-完成](./PLAN_HISTORY.md)

---

## 2026-02-20: API 認可強制実装フェーズ2 完成

### 背景

CodeQL セキュリティスキャンで SSRF 警告が検出された（`app/api/security/rls-violations/route.ts`）。根本対応として、API 設計レベルでセキュリティモデルを統一する必要があった。

会話ログは正本にできないため、GitHub ドキュメントを唯一の正本として確立。

### 実装内容（ドキュメント）

#### 新規作成（4 ファイル）

1. **docs/SECURITY_MODEL.md**
   - 認証→認可→処理→監査の API 強制フロー
   - service_id スコープ必須ルール（同法人内でのアクセス禁止）
   - RLS + Application 層の多層防御設計
   - テーブル別権限マトリックス
   - API セキュリティチェックリスト

2. **docs/AUDIT_LOGGING.md**
   - 監査ログスキーマ（audit_logs）
   - PII/PHI 禁止ルール実装ガイド
   - 操作ごとのログパターン（create/read/update/delete/export）
   - lib/audit-logging.ts 実装例
   - 保存期間ポリシー（確認タスク）

3. **docs/DATA_RETENTION.md**
   - テーブル別保存期間（利用終了 + 3～7 年後削除）
   - 定期削除スクリプト（実装例・未実装）
   - バックアップ・リストア戦略
   - データエクスポート制御
   - GDPR 対応検討項

4. **docs/HANDOFF_PROMPT.md**
   - AI 引き継ぎチェックリスト
   - 実装前に読む順番（SECURITY_MODEL 最優先）
   - PR 記入テンプレート
   - よくある質問 Q&A

#### 既存ファイル更新（2 ファイル）

5. **.ai/READ_BEFORE_RUN.md**
   - セキュリティドキュメント確認必須セクション（2026-02-20 追加）

6. **app/api/security/rls-violations/route.ts** （bug fix）
   - ❌ 削除: `req.nextUrl.origin` + fetch() 呼び出し（SSRF 警告原因）
   - ✅ 追加: `fs/promises.readFile()` で docs/DOMAIN_MODEL.md を直接読み込み
   - ✅ 実装: テーブル名解析・RLS 状態判定をローカル実行

### 検証内容

- ✅ ドキュメント整合性（相互参照リンク確認）
- ✅ セキュリティ指標の一貫性（認証→認可フロー統一）
- ✅ テンプレートコード実装可能性（lib/audit-logging.ts など）
- ✅ API チェックリスト実用性

### 技術的決定・トレードオフ

| 項目 | 決定 | 根拠 |
|------|------|------|
| 監査ログ名 | **audit_logs**（確認待ち） | DOMAIN_MODEL.md では audit_events も参照。統一的命名で確認予定。 |
| RLS 段階移行 | 4 フェーズに分割 | Phase1: 基本（完了）→ Phase2: 役割ベース（進行中）→ Phase3: 属性ベース → Phase4: 監査統合 |
| PII 削除時期 | 利用終了 + **N 年**後 | 医療法準拠で 7 年、個人情報保護法準拠で 3 年。組織ポリシー確認待ち。 |
| SUPABASE_SERVICE_ROLE_KEY | **認可省略禁止** | 管理キーでも RLS bypass ≠ 認可省略。API レイヤーで権限チェック必須。 |

### 実装予定（フェーズ2～4）

| フェーズ | タイムライン | 内容 |
|---------|-------------|------|
| **フェーズ 2** | 2026年3月 | すべての API に service_id スコープ・認可チェック統一化 |
| **フェーズ 3** | 2026年3月 | audit_logs テーブル実装 + 全 API に監査ログ呼び出し 統合 |
| **フェーズ 4** | 2026年4月 | RLS 段階移行・service_staff テーブル実装 |
| **フェーズ 5** | 2026年5月～ | 定期削除 cron・オフサイトバックアップ |

### 残留確認事項（ブロッキング）

| # | 項目 | 影響 | 確認者 | 期日 |
|---|------|------|--------|------|
| 1 | service_staff テーブル実装有無 | RLS ポリシー | オーナー | - |
| 2 | audit_logs テーブル正式名 | DB スキーマ | オーナー | - |
| 3 | PII/医療情報保存期間 | 削除スクリプト | 法務/監査 | - |
| 4 | GDPR 対応要否 | 削除機能仕様 | PM | - |
| 5 | バックアップ暗号化方針 | インフラ | オーナー | - |

### 参考資料

- [GitHub PR: chore/security-model-docs](https://github.com/katoutomohiro/juushin-care-system-v0-careapp8/pull/XXX)（push 予定）
- [CodeQL SSRF 警告](https://github.com/katoutomohiro/juushin-care-system-v0-careapp8/security/code-scanning)
- [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md)

---

## 2026-02-20: API 認可強制実装フェーズ2 完成

### 背景

フェーズ 1 で確立した SECURITY_MODEL (`docs/SECURITY_MODEL.md`) に基づき、API 層の認可チェックを全エンドポイントに統一化。サービス境界（service_id）を超えたアクセスを 403 で拒否する仕組みを実装。

### 実装内容（コード）

#### 新規作成ファイル（2 ファイル）

1. **lib/authz/serviceScope.ts** (136 行)
   - `requireServiceIdFromRequest(req)` → query param から serviceId 抽出、なければ 400
   - `assertServiceAssignment(supabase, userId, serviceId)` → ユーザーが service に割り当てられているか確認、なければ 403
   - `requireServiceIdAndAssignment()` → 2 つの合成関数
   - **根拠**: docs/SECURITY_MODEL.md で定義された「認可フロー（auth → authz → process → audit）」を実装

2. **lib/audit/writeAuditLog.ts** (155 行)
   - `writeAuditLog(supabase, entry)` → audit_logs テーブルに記録（非ブロッキング）
   - `auditRead()` / `auditMutation()` → 便利ラッパー
   - PII/PHI フィルタリング（名前/住所/電話/医療情報禁止）
   - **根拠**: docs/AUDIT_LOGGING.md で定義されたスキーマと禁止ルール

3. **IMPLEMENTATION_NOTES_API_AUTHZ.md** (165 行、本ファイル）
   - 実装完了した API パターンのドキュメント
   - API 認可フロー（5 ステップ図）
   - 検証シナリオ表（401/400/403/200）
   - 確認タスク表（service_staff/audit_logs 実装待ち）

#### 修正ファイル（1 ファイル）

4. **app/api/care-receivers/route.ts** (GET エンドポイント)
   ```
   STEP 1: Authentication (requireApiUser) → 401
   STEP 2: Parameter validation (requireServiceIdFromRequest) → 400
   STEP 3: Authorization check (assertServiceAssignment) → 403
   STEP 4: Database query (scoped by serviceId)
   STEP 5: Audit logging (auditRead, async non-blocking)
   ```
   - `requireServiceIdFromRequest()` 導入 → serviceId なければ 400 で応答停止
     - **削除**: 従来の `validateRequiredField()` + if(!validation.valid) パターン
     - **理由**: より明示的で、ガード関数パターンの一貫性
   - `assertServiceAssignment()` 導入 → 割り当てなければ 403 で応答停止
   - `auditRead()` 呼び出し → 読み取り操作をログ（async, void で非ブロッキング）

### 割り当てテーブル根拠（interim state）

#### 現状：service_staff テーブル未実装
- **参照**: docs/DOMAIN_MODEL.md#156 - 「service_staff (REFERENCED BUT NOT CREATED)」
- **RLS ポリシー定義**: supabase/migrations/20260128110000_extend_rls_role_separation.sql
  - RLS では `service_staff.user_id`, `service_staff.service_id`, `service_staff.role` を参照
  - **実際の create table ステートメント未検出**（grep 3300+ マッチ内に CREATE なし）
- **決定**: Phase 2 では **staff_profiles テーブル** を interim として使用
  - 根拠: staff_profiles.id = auth.users(id), staff_profiles.facility_id
  - 制限: 現在の実装は "ユーザーが auth 内に存在するか" を確認するのみ
  - 計画: Phase 4 で service_staff 実装後に lib/authz/serviceScope.ts を更新

### 監査ログテーブル根拠

#### 現状：audit_logs テーブル未実装
- **スキーマ定義**: docs/AUDIT_LOGGING.md#28-90
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY, actor_id UUID, service_id UUID,
    action text, resource_type text, resource_id text, metadata jsonb, created_at timestamptz
  )
  ```
- **PII 禁止ルール**: docs/AUDIT_LOGGING.md#115
  - 禁止項目: full_name, address, phone, emergency_contact, medical_care_detail, field values
  - 許可項目: action, resource_type, resource_id, count, timestamp
- **決定**: writeAuditLog() は非ブロッキング＆graceful degradation
  - audit_logs テーブル未実装 → PGRST116(not found) を detect して console.debug() で記録
  - API 応答はブロックしない
  - 計画: Phase 3 で audit_logs 実装後に自動記録へ変更

### 検証内容

✅ **コード検証**
- lib/authz/serviceScope.ts: 400/403 エラー応答パターン確認
- lib/audit/writeAuditLog.ts: PII フィルタリング確認（名前等 禁止）
- app/api/care-receivers/route.ts: 5 ステップフロー実装確認

✅ **パターンテスト** (想定シナリオ)
| シナリオ | リクエスト | 期待値 | 実装状 |
|--------|----------|-------|--------|
| 未認証 | no auth | 401 | ✓ middleware + requireApiUser |
| serviceId 無し | ?serviceId= | 400 | ✓ requireServiceIdFromRequest throws |
| 割り当て無し | serviceId=other | 403 | ✓ assertServiceAssignment check |
| 正常系 | ?serviceId=life-care | 200 | ✓ DB query + audit |

### 技術的決定・トレードオフ

| 項目 | 決定 | 根拠 |
|------|------|------|
| **serviceId 型** | string（query param） | care_receivers.service_code が text，UUID ではなく slug ベース |
| **割り当てロジック** | staff_profiles.facility_id（interim） | service_staff 未実装。Phase 4 で切り替え予定。本ファイル確認タスク #CT-1 参照 |
| **監査ログ失敗** | 非ブロッキング | API は 200 返却，ログは best-effort。ユーザー影響最小化 |
| **エラーメッセージ** | 汎用（PII 非公開） | "Service ID required" など detail 非開示 |
| **RLS 並行実行** | RLS + API 層認可 | SUPABASE_SERVICE_ROLE_KEY 盗用時も API 層で検証（二重防御） |

### 実装予定（フェーズ3～5）

| フェーズ | タイムライン | 内容 |
|---------|-------------|------|
| **フェーズ 3** | 2026年3月 | audit_logs テーブル実装 + API 全スコープでの監査ログ統合 |
| **フェーズ 4** | 2026年4月 | service_staff テーブル実装 + lib/authz/serviceScope.ts マイグレーション |
| **フェーズ 5** | 2026年5月～ | 定期削除 cron・オフサイトバックアップ・監査レポート |

### 残留確認事項（ブロッキング）

| # | タスク | ファイル/テーブル | 優先度 | 根拠 | 状態 |
|----|--------|-----------------|--------|------|------|
| CT-1 | service_staff テーブル実装 (user_id, service_id, role) | supabase/migrations/ | HIGH | docs/DOMAIN_MODEL.md#215: Phase 2 仕様 | ❌ 計画中 |
| CT-2 | service_staff 初期化（staff_profiles から seed） | migration + seed | HIGH | 既存ユーザーの割り当て確保 | ❌ 計画中 |
| CT-3 | audit_logs テーブル実装 (schema migration) | supabase/migrations/ | HIGH | docs/AUDIT_LOGGING.md#28 スキーマ定義済 | ❌ 計画中 |
| CT-4 | audit_logs RLS ポリシー有効化 | migration | MEDIUM | docs/AUDIT_LOGGING.md#93-112 ポリシー定義済 | ❌ 計画中 |
| CT-5 | 他 API へ横展開 (staff, case-records等) | app/api/**/route.ts | MEDIUM | 実装パターン: lib/authz + lib/audit ラッパー | 延期 |
| CT-6 | service_staff → lib/authz 切り替え | lib/authz/serviceScope.ts | MEDIUM | CT-1 実装後 | 延期 |

### 参考資料

- [docs/SECURITY_MODEL.md](./SECURITY_MODEL.md) - API 認可フロー定義
- [docs/AUDIT_LOGGING.md](./AUDIT_LOGGING.md) - PII 禁止ルール
- [docs/DOMAIN_MODEL.md](./DOMAIN_MODEL.md#215) - service_staff 設計案
- [supabase/migrations/20260128110000_extend_rls_role_separation.sql](../supabase/migrations/20260128110000_extend_rls_role_separation.sql) - RLS ポリシー（service_staff 参照）
- [IMPLEMENTATION_NOTES_API_AUTHZ.md](./IMPLEMENTATION_NOTES_API_AUTHZ.md) - 実装パターン記録

---

## 📅 時系列イベント
### 2026年1月8日（最新）: Vercel build fix → 機能統合完成
#### タスク: Vercel Build Failed 最終解決 + URL生成関数統一化
**背景**: PR #244（個人情報セキュリティ設計）で Vercel build が失敗
**修正内容**:

1. **JSX 構文エラー修正**
   - **ファイル1**: `app/home-client.tsx` L482
     - エラー: href属性が崩れている形式
     - 修正: 正しい URL テンプレート文字列に統一
   
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
