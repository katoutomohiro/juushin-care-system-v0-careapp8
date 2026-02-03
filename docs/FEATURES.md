# 重心ケア支援アプリ｜機能一覧（棚卸し結果）

**更新日**: 2026年1月28日  
**棚卸し方法**: App Router ルート全網羅 + リンク照合 + API一覧  
**目的**: 実装済機能・404候補・未実装機能を一覧化し、次の改修の優先度を決定

---

## 📋 方法論

1. **ルート抽出**: `app/` 配下の全 `page.tsx` + `route.ts` を列挙
2. **リンク照合**: アプリ内のリンク文字列（"ケース記録"など）→ 対応ルートの有無確認
3. **API確認**: `/api/**` 以下の route.ts を列挙し、フロント遷移との紐付け
4. **状態判定**: 
   - ✅ 実装済: ルート存在 + リンク存在 + UI実装
   - 🔗 リンク存在＋ルート無: **404候補** → 次の優先度 A
   - ❌ 未実装: リンク/ルート共に無

---

## 📍 App Router ルート一覧（全32ルート）

### ルート分類と URL パターン

| ルート | URL パターン | 説明 | 状態 |
|--------|------------|------|------|
| **ホーム** | | | |
| home-client | `/` | メインダッシュボード（Home画面） | ✅ 実装済 |
| **ログイン・認証** | | | |
| login/page | `/login` | ログイン画面 | ✅ 実装済 |
| reset-password/page | `/reset-password` | パスワードリセット | ✅ 実装済 |
| **サービス管理** | | | |
| services/[serviceId]/page | `/services/{serviceId}` | サービス詳細ページ | ✅ 実装済 |
| services/[serviceId]/staff/page | `/services/{serviceId}/staff` | スタッフ一覧 | ✅ 実装済 |
| services/[serviceId]/users/page | `/services/{serviceId}/users` | 利用者一覧 | ✅ 実装済 |
| **利用者管理** | | | |
| services/[serviceId]/users/[userId]/page | `/services/{serviceId}/users/{userId}` | 利用者詳細（プロフィール） | ✅ 実装済 |
| services/[serviceId]/users/[userId]/case-records/page | `/services/{serviceId}/users/{userId}/case-records` | **ケース記録** | ✅ 実装済 |
| services/[serviceId]/users/[userId]/daily-logs/page | `/services/{serviceId}/users/{userId}/daily-logs` | 日誌一覧 | ✅ 実装済 |
| services/[serviceId]/users/[userId]/diary/page | `/services/{serviceId}/users/{userId}/diary` | 日記ページ | ✅ 実装済 |
| **日誌・記録** | | | |
| daily-log/page | `/daily-log` | 日誌メイン | ✅ 実装済 |
| daily-log/expression/page | `/daily-log/expression` | 表情・反応記録 | ✅ 実装済 |
| daily-log/expression/history/page | `/daily-log/expression/history` | 表情・反応履歴 | ✅ 実装済 |
| daily-log/seizure/page | `/daily-log/seizure` | 発作記録 | ✅ 実装済 |
| daily-log/seizure/history/page | `/daily-log/seizure/history` | 発作履歴 | ✅ 実装済 |
| **日記** | | | |
| diary/page | `/diary` | 日記一覧 | ✅ 実装済 |
| diary/[id]/page | `/diary/{id}` | 日記詳細 | ✅ 実装済 |
| diary/monthly/page | `/diary/monthly` | 月別日記ビュー | ✅ 実装済 |
| **その他機能** | | | |
| alerts/page | `/alerts` | アラート一覧 | ✅ 実装済 |
| medications/page | `/medications` | 服薬管理 | ✅ 実装済 |
| seizures/page | `/seizures` | 発作管理 | ✅ 実装済 |
| seizures/new/page | `/seizures/new` | 発作新規記録 | ✅ 実装済 |
| todos/page | `/todos` | TODO管理 | ✅ 実装済 |
| voice/page | `/voice` | 音声記録 | ✅ 実装済 |
| family/page | `/family` | 家族連携 | ✅ 実装済 |
| settings/thresholds/page | `/settings/thresholds` | 閾値設定 | ✅ 実装済 |
| print/a4/case-record/page | `/print/a4/case-record` | A4ケース記録印刷用 | ✅ 実装済 |
| forms/[form]/page | `/forms/{form}` | 動的フォーム | ✅ 実装済 |
| **Pochi（非表示グループ）** | | | |
| (pochi)/users/page | `/pochi/users`? | Pochi用利用者一覧 | ❓ 不明 |
| (pochi)/manage/achievements/daily/page | `/pochi/manage/achievements/daily`? | Pochi達成管理 | ❓ 不明 |
| **Records（非表示グループ）** | | | |
| (records)/* | 非表示 | 記録用内部ルート | ❓ 不明 |

---

## 🔗 メニュー・リンク照合表

### ホーム画面のリンク

| リンク文字列 | href | ルート存在 | 状態 | 備考 |
|-----------|------|----------|------|------|
| ケース記録 | `/services/life-care/users/AT/case-records` | ✅ | ✅ 実装済 | AT（A・Tさん）専用リンク |
| 日誌記録 | `/daily-log` | ✅ | ✅ 実装済 | 日誌メインページ |
| 発作記録 | `/seizures` | ✅ | ✅ 実装済 | 発作管理ページ |
| 服薬管理 | `/medications` | ✅ | ✅ 実装済 | 服薬管理ページ |
| 日記 | `/diary` | ✅ | ✅ 実装済 | 日記一覧ページ |
| サービス一覧 | `/services/{serviceId}` | ✅ | ✅ 実装済 | 各サービスの詳細ページ |

### 利用者詳細ページ (`/services/{serviceId}/users/{userId}`) のナビゲーション

| ナビゲーション項目 | 遷移先 URL | ルート存在 | 状態 | 備考 |
|------------------|----------|----------|------|------|
| Overview タブ | `/services/{serviceId}/users/{userId}` | ✅ | ✅ 実装済 | 利用者プロフィール |
| Case Records ボタン | `/services/{serviceId}/users/{userId}/case-records` | ✅ | ✅ 実装済 | ケース記録ページ |
| Daily Logs | `/services/{serviceId}/users/{userId}/daily-logs` | ✅ | ✅ 実装済 | 日誌一覧 |
| Diary | `/services/{serviceId}/users/{userId}/diary` | ✅ | ✅ 実装済 | 日記ページ |

---

## 🔴 404 候補（リンク存在 ↔ ルート無）

現在のところ、**404候補は検出されませんでした**。

#### 補足
- `home-client.tsx` 行482: `Link href="/services/life-care/users/AT/case-records"` は正しくルートが存在
- すべてのメニューリンクが対応するルートを持つ
- ただし、**AT（"AT"という userId）が事前に Supabase に存在しているか**を確認する必要がある

---

## 🔌 API ルート一覧（全11エンドポイント）

| API エンドポイント | メソッド | 説明 | 利用先 | 状態 |
|------------------|---------|------|-------|------|
| `/api/case-records/save` | POST | ケース記録を保存 | CaseRecordFormClient.tsx | ✅ 実装済 |
| `/api/case-records/list` | GET | ケース記録一覧取得 | CaseRecordsListClient.tsx | ✅ 実装済 |
| `/api/case-records` | GET/POST/DELETE | ケース記録 CRUD | 複数 | ✅ 実装済 |
| `/api/care-receivers` | GET/POST/DELETE | 利用者情報 CRUD | ServicePage, UserList | ✅ 実装済 |
| `/api/care-receivers/list` | GET | 利用者一覧取得 | Dashboard | ✅ 実装済 |
| `/api/care-receivers/[id]` | GET/PUT/DELETE | 利用者詳細操作 | UserDetailPage | ✅ 実装済 |
| `/api/care-receivers/update-display-name` | PUT | 利用者名更新 | UserDetailPage | ✅ 実装済 |
| `/api/staff` | GET/POST | スタッフ情報 | StaffSelector | ✅ 実装済 |
| `/api/voice/save` | POST | 音声記録保存 | VoiceRecorder | ✅ 実装済 |
| `/api/whisper` | POST | 音声認識（OpenAI Whisper） | VoiceRecorder | ✅ 実装済 |
| `/api/push/send` | POST | プッシュ通知送信 | Notification | ✅ 実装済 |

---

## �️ セキュリティ・運用機能

| 機能分類 | 機能名 | 実装状況 | 説明 |
|---------|-------|---------|------|
| **デプロイメント** | Vercel + Supabase 本番構成 | ✅ 設計済 | `docs/DEPLOYMENT.md` にデプロイ手順を記載 |
| **デプロイメント** | 環境変数管理 | ✅ 設計済 | `NEXT_PUBLIC_SUPABASE_URL` など必須変数を整理 |
| **デプロイメント** | ヘルスチェック | ✅ 設計済 | `/api/health` エンドポイント（予定） |
| **同時編集制御** | 楽観ロック（Optimistic Locking） | ✅ 実装済 | `version` カラムによる競合検出 |
| **同時編集制御** | 409 Conflict エラー処理 | ✅ 実装済 | フロントで競合ダイアログ表示 |
| **同時編集制御** | 再読み込みボタン | ✅ 実装済 | AlertDialog から最新データ取得 |
| **同時編集制御** | DB トリガー | ✅ 実装済 | `increment_version()` で自動 version 増加 |
| **利用者情報管理** | 個人情報編集フォーム | ✅ 実装済 | full_name, address, phone, emergency_contact など |
| **利用者情報管理** | 医療的ケア詳細入力 | ✅ 実装済 | 経管栄養、吸引、酸素吸入、人工呼吸器、発作対応 |
| **利用者情報管理** | 匿名表示（display_name） | ✅ 実装済 | 個人情報保護のため display_name を基本表示 |
| **利用者情報管理** | RLS による個人情報保護 | ✅ 実装済 | 職員のみアクセス可能、anon は拒否 |
| **利用者情報管理** | 楽観ロック（利用者情報） | ✅ 実装済 | version カラム + 409 UI |
| **監査ログ** | care_receiver_audits テーブル | ✅ 実装済 | 変更されたフィールド名のみ記録 |
| **監査ログ** | 自動監査ログ記録 | ✅ 実装済 | UPDATE トリガーで自動記録 |

### 実装詳細

#### 利用者情報編集
- **DB migration**: `supabase/migrations/20260128100000_add_personal_info_to_care_receivers.sql`
- **API**: `/api/care-receivers/[id]` で PUT/GET（version チェック + 409 Conflict）
- **UI**: `components/edit-care-receiver-dialog.tsx`（個人情報編集フォーム + 医療的ケアチェックボックス）
- **ページ統合**: `app/services/[serviceId]/users/[userId]/page.tsx`（"🔒 詳細情報を編集" ボタン）
- **個人情報保護**: ログ出力禁止、RLS で保護、開発環境では匿名データのみ

#### 楽観ロック（ケース記録）
- **DB migration**: `supabase/migrations/20260128093212_add_version_to_case_records.sql`
- **API**: `/api/case-records/save` で `version` パラメータを受け取り、一致しなければ 409 を返却
- **フロント**: `CaseRecordFormClient.tsx` で 409 受信時に競合ダイアログを表示
- **設計書**: `docs/CONCURRENCY.md` に詳細設計を記載

#### デプロイメント
- **Vercel**: Next.js アプリを Vercel にデプロイ
- **Supabase**: 本番用プロジェクトを新規作成し、環境変数に設定
- **環境変数**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **設計書**: `docs/DEPLOYMENT.md` にデプロイ手順を記載

---

## �📊 機能ステータスサマリー

| カテゴリ | 実装済 | 404 | 未実装 | 合計 |
|---------|------|-----|-------|------|
| ページ/ルート | 30 | 0 | 2* | 32 |
| API エンドポイント | 11 | 0 | 0 | 11 |
| メニューリンク | 6 | 0 | 0 | 6 |

*未実装: `(pochi)` グループ 2ルート（非表示グループ、実装状況不明）

---

## ✅ 「ケース記録」機能の詳細確認

### リンク元
- **ホーム画面** (`app/home-client.tsx` L482)
  ```tsx
  <Link href="/services/life-care/users/AT/case-records">
    <h3>ケース記録</h3>
    <p>利用者毎のケース記録確認</p>
  </Link>
  ```

- **利用者詳細ページ** (`app/services/[serviceId]/users/[userId]/page.tsx` L650)
  ```tsx
  router.push(`/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/case-records`)
  ```

### ルート実装
- **ルート**: `/services/[serviceId]/users/[userId]/case-records/page.tsx` ✅ 存在
- **コンポーネント**: `src/components/case-records/CaseRecordFormClient.tsx` ✅ 実装済
- **API**: `/api/case-records/save` (POST) ✅ 実装済

### 依存テーブル
- `case_records` (Supabase)
- `care_receivers` (Supabase)
- `services` (Supabase)

### 現在の実装状況
✅ **完全実装**
- ページルート存在
- フォームUI実装
- 保存API実装
- 一覧表示API実装

---

## 🚀 次に直すべき 404 一覧

**現在: 0件**

すべてのメニューリンクが正しいルートを指しており、404 は検出されませんでした。

### ただし確認すべき項目

1. **AT（userId "AT"）の存在確認**
   - ホーム画面で `AT` にハードコードされたリンクがある
   - Supabase に実際に `AT` という user が存在するか確認が必要
   - 存在しない場合 → 動的に利用者を選択できるように修正すべき

2. **(pochi) グループの整理**
   - `app/(pochi)/users/page.tsx` と `app/(pochi)/manage/achievements/daily/page.tsx` は何か?
   - 非表示グループだがルートは存在する → 要確認

3. **削除済み/廃止ルートの確認**
   - 旧 URL や削除済み API への参照がないか確認

---

## 📝 リンク確認コマンド

```bash
# 「ケース記録」「日誌」などの全リンク出現箇所
rg -n "case-records|ケース記録|diary|日誌" app --type ts --type tsx

# API 呼び出し出現箇所
rg -n "/api/" src components --type ts --type tsx | grep fetch
```

---

## 使用テンプレート

- **shared schema**: `src/lib/case-records/form-schemas.ts`
- **API schema validation**: Zod
- **State management**: React Hooks + localStorage/Supabase

---

**End of Document**  
*次のタスク: 優先度A「AT ユーザーの動的化」またはリンク未実装の404修正*
