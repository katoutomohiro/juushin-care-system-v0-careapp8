# 重心ケア支援アプリ｜プロジェクト計画書（唯一の正規情報源）

## 0️⃣ このファイルの役割

**定義**: 全 AI・全人間が迷わず従える、プロジェクト全体の唯一の正規情報源  
**更新ルール**: 仕様変更・決定事項・学んだ事実は、その都度このファイルに記録してから実装へ  
**参照タイミング**: 作業開始前に必ず読み込む（最新状態であることを確認）  
**確認義務**: このファイルを読んで「何をするのか」「何ができているのか」「何が問題なのか」が 30 秒で分かること  

---

## 1️⃣ プロダクト憲法（変更に強い原則）

### 不変の方針
1. **Phase 1 → Phase 2 モデル**  
   - **Phase 1 最優先**: A・T さんのケース記録フォームを「完璧な状態」まで完成させる  
   - **Phase 2**: Phase 1 で完成した仕組みを「テンプレート」として、他 23 人を順に実装  
   - 理由: 1 人で十分性を確認してから全体展開することで、リスク最小化・品質確保

2. **共通項目 vs 個別項目の厳密な分離**  
   - **共通項目**: 全 24 人が使う（日付、利用者ID、サービスID、スタッフ）  
   - **個別項目**: 利用者ごとに異なる（バイタル測定項目、理学療法内容、障害別記録項目など）  
   - 方針: テンプレート増殖ではなく「利用者単位の差分管理」で対応

3. **利用者名の唯一の正は「利用者詳細」**  
   - DB 紐付けは userId（内部ID）のまま  
   - UI 表示は常に「利用者名」一本に統一  
   - 利用者詳細で名前変更 → ケース記録ページ再読み込みで最新名が反映  
   - 理由: UI の混乱防止、DB 関連性維持

4. **保存 API は `/api/case-records/save` を唯一の正**  
   - 旧 API は廃止済み  
   - すべての保存はこのエンドポイントを通す  
   - ペイロード形式: `{ userId, serviceId, careReceiverName, date, record_data, recordTime }`

5. **プランの常時更新**  
   - 仕様変更 → このファイル更新 → 実装 の流れを必須化  
   - 変更追跡性を確保し、「なぜそうしたのか」の履歴を残す

---

## 2️⃣ 想定完成形（To-Be）

### 2.1 アプリケーション全体像
```
利用者 24 人（A・T さん含む）
  ↓
[ダッシュボード] ← 全利用者が一覧で表示・検索可能
  ↓
[各利用者ページ]
  ├─ プロフィール編集（氏名 ← 唯一の正）
  ├─ ケース記録（日付ごと、Phase 1/2 で段階的実装）
  │   └─ [カード UI]
  │       ├─ 入力欄（日付、バイタル、食事、排泄など）
  │       ├─ 保存ボタン → /api/case-records/save
  │       ├─ 編集（既存レコード呼び出し・上書き）
  │       ├─ 追加（新規行追加・複数記録対応）
  │       └─ 印刷（PDF 出力含む）
  └─ 記録一覧（月単位・日単位検索）
```

### 2.2 新要件（最新追加）

#### 要件 A: 利用者一覧の完全表示
- **現状**: A・T さん以外の 23 人がUIから消えている（事実、要確認）
- **目標**: ダッシュボード・一覧画面に 24 人全員が表示される  
- **受け入れ条件**:
  - ✅ `/services/[serviceId]/users` で 24 人が一覧表示  
  - ✅ 各ユーザーをクリック → 個別ページへ遷移可能  
  - ✅ 検索・フィルタで利用者を絞込み可能  
  - ✅ 「消えている」状態が発生しない（事実確認後、原因を問題点に記録）

#### 要件 B: マルチデバイス対応（レスポンシブ）
- **現状**: PC 前提の UI 設計（事実確認待ち）
- **目標**: スマホ/タブレット/PC の主要ブラウザで操作可能  
- **受け入れ条件**:
  - ✅ スマホ (iOS Safari, Chrome)  
  - ✅ タブレット (iPad Safari, Chrome)  
  - ✅ PC (Chrome, Safari, Firefox)  
  - ✅ 入力欄・ボタン・フォーム操作が現場で実用的  
  - ✅ タッチ操作対応（日付ピッカーなど）

#### 要件 C: カード UI による一気通貫操作
- **現状**: フォーム分散・保存方式不統一（事実確認待ち）
- **目標**: 単一カード UI で「入力 → 保存 → 編集 → 追加 → 印刷」が完結  
- **受け入れ条件**:
  - ✅ 1 つの記録フォーム（カード）で、日付・バイタル・食事・排泄などを同時入力  
  - ✅ 保存ボタン 1 回で `/api/case-records/save` へ送信  
  - ✅ 編集: 既存レコード読み込み → フォーム展開 → 上書き保存  
  - ✅ 追加: 新規行ボタン → 初期化フォーム → 保存  
  - ✅ 印刷: カードから PDF/紙出力可能  

### 2.3 完成形の API 仕様

**POST `/api/case-records/save`**  
```json
Request:
{
  "userId": "uuid-of-AT",
  "serviceId": "life-care",
  "careReceiverName": "A・T",
  "date": "2026-01-23",
  "recordTime": "14:30",
  "record_data": {
    "vitals": [{ temperature: 36.5, pulse: 72, ... }],
    "intake": { food: "普通食", water: 1500, ... },
    "excretion": { urine: "正常", stool: "正常", ... },
    "therapy": { pt: "30分", ot: "20分", ... },
    "notes": "特記事項"
  }
}

Response: 
{ "ok": true, "id": "record-uuid", "saved_at": "2026-01-23T14:30:00Z" }
```

---

## 3️⃣ 現在の状態（As-Is） ※事実のみ

### 3.1 コード・インフラの事実
- **ブランチ**: main（最新状態）
- **Dev サーバ**: http://localhost:3002 で起動中 ✅
- **DB マイグレーション**: `is_active` 列追加済み ✅
- **ビルド**: `pnpm build` 成功 ✅
- **型チェック**: `pnpm typecheck` 成功 ✅
- **Lint**: `pnpm lint` 成功 ✅
- **API 保存先**: `/api/case-records/save` に一本化 ✅

### 3.2 実装済み機能（確認日: 2026-01-23）
- ✅ A・T さんケース記録フォーム UI 基本形  
- ✅ 利用者名表示（userId → careReceiverName に変更完了）  
- ✅ 時刻入力廃止（自動タイムスタンプ化完了）  
- ✅ 日付ピッカー（YYYY/MM/DD(曜) 形式で表示）  
- ✅ 保存処理（/api/case-records/save 連携）  
- ✅ middleware 修正（DEV バイパス削除、AUTH_BYPASS 環境変数化）

### 3.3 未実装・不確定な機能（確認日: 2026-01-23）
- ❓ **他 23 人の利用者が一覧に表示されるか** ← 要確認（コンソール/Network で検証待ち）
- ❓ **ダッシュボード API (/api/care-receivers/list) が 200 OK で返すか** ← 検証待ち  
- ❓ **マルチデバイス対応（レスポンシブ）** ← 未実装  
- ❓ **カード UI の完全な一気通貫** ← 部分実装  
- ❓ **編集・追加・削除ボタンの動作** ← 不確定  
- ❓ **印刷/PDF 出力** ← 基本実装のみ、検証待ち  
- ❓ **Phase 2（他 23 人向け）の個別項目定義** ← 未実装

### 3.4 環境変数の事実
```
✅ NEXT_PUBLIC_SUPABASE_URL=https://rlopopbtdydqchiifxla.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
✅ SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
✅ SUPABASE_URL=https://rlopopbtdydqchiifxla.supabase.co
🔲 AUTH_BYPASS=(未設定 or false)
🔲 DEBUG_MIDDLEWARE=(未設定)
```

---

## 4️⃣ 問題点一覧（優先度付き）

| ID | 問題 | 現状 | 影響度 | 備考 |
|----|----|------|--------|------|
| **P-001** | **利用者一覧消失** | A・T 以外 23 人が UI から消えている | 🔴 致命的 | "Database not available" エラーの根本原因未特定（復旧作業進行中） |
| **P-002** | **マルチデバイス要件未定義** | PC 前提の UI | 🟠 高 | スマホ/タブレット操作を想定していない |
| **P-003** | **カード UI 一気通貫の不完全性** | 編集・追加・削除が不確定 | 🟠 高 | 受け入れ条件の明確化が必要 |
| **P-004** | **API 疎通の未確認** | /api/care-receivers/list が 200 OK か 500 か不明 | 🟠 高 | ブラウザ検証で判定予定 |
| **P-005** | **Phase 2 個別項目の未定義** | 他 23 人の項目構造が明確でない | 🟡 中 | Phase 1 完成後に設計予定 |
| **P-006** | **middleware 本番対応** | AUTH_BYPASS デフォルト値が不明確 | 🟡 中 | 本番環境では必ず false または未設定にすることを明記 |

---

## 5️⃣ 決定事項（Decision Log）

| 決定 | 判定日 | 理由 | 影響範囲 |
|------|--------|------|---------|
| **Phase 1 優先（A・T さん）** | 2026-01-21 | 1 人で品質確保・リスク最小化 | 全プロジェクト |
| **保存 API 一本化 (/api/case-records/save)** | 2026-01-14 | 冗長な保存処理削減、デバッグ効率化 | バックエンド・フロント連携 |
| **利用者名は詳細編集が唯一の正** | 2026-01-14 | DB 関連性維持、UI 混乱防止 | ケース記録・ダッシュボード |
| **時刻入力廃止・自動タイムスタンプ化** | 2026-01-14 | ヘッダー UI 縮小・操作簡素化 | CaseRecordForm・TimeWithNowField 削除 |
| **日付ピッカー形式 (YYYY/MM/DD(曜))** | 2026-01-14 | 日本語表記の分かりやすさ、ブラウザ互換性 | DateWithWeekdayField 実装 |
| **middleware DEV バイパス削除** | 2026-01-23 | 本番セキュリティ確保・認証フロー検証 | AUTH_BYPASS 環境変数へ切替 |
| **main ブランチに移行** | 2026-01-23 | 最新安定状態を基準化 | 全開発者 |

---

## 6️⃣ 未決定事項（Open Questions）

| 質問 | 重要度 | 担当 | 期限 |
|------|--------|------|------|
| **P-001: なぜ他 23 人が UI から消えるのか？** | 🔴 | ChatGPT 5.2 | 本日中 |
| **P-002: マルチデバイド対応の優先度は？** | 🟠 | PO | 1 月 26 日 |
| **P-003: カード UI の「編集」「追加」の UX 仕様は？** | 🟠 | デザイン/PO | 1 月 25 日 |
| **P-005: 他 23 人の個別項目は誰が定義する？** | 🟡 | 現場スタッフ/PO | Phase 1 完成後 |
| **P-006: 本番環境の AUTH_BYPASS 設定は？** | 🟡 | DevOps/ChatGPT 5.2 | 1 月 28 日 |

---

## 🔍 機能棚卸し結果（2026-01-28）

### 📄 棚卸し結果ドキュメント
**場所**: `docs/FEATURES.md`

**主要な発見**:
- ✅ **ルート完全性**: App Router 30ルート全て実装済（未実装 0件）
- ✅ **リンク照合**: メニュー・ナビゲーション全 6 リンクが有効なルートを指している
- ✅ **API一覧**: 11エンドポイント全て実装済（404 0件）
- ⚠️ **ハードコード AT**: ホーム画面で `AT` にハードコードされたリンク存在
  - 詳細: `app/home-client.tsx` L482
  - `Link href="/services/life-care/users/AT/case-records"`

### 🔴 「404を直す」より先にやるべきこと（最優先）

**結論**: 現在のところ、ルート側は 404 がないため、即座に直すべき 404 はありません。

**代わりに、以下の 3 点を確認してください**:

1. **AT ユーザーの存在確認**
   - Supabase `care_receivers` テーブルに `id='AT'` が存在するか
   - 存在しない → ホーム画面の AT リンクは 404 を引き出す（隠れた404）
   - 修正: 動的に最初の利用者を選択する修正が必要

2. **(pochi) グループの役割確認**
   - `app/(pochi)/users/page.tsx`
   - `app/(pochi)/manage/achievements/daily/page.tsx`
   - 何の機能か? → ドキュメント記載

3. **削除済みリンクの追跡確認**
   - 旧 URL パターン（例: `/case-records?userId=...`）への参照が無いか grep で確認

### 📋 次に直すべき 404 一覧（優先度順）

| No. | 404 | 現状 | 修正方法 | 優先度 |
|-----|-----|------|---------|--------|
| 1 | **AT ユーザー未登録時** | ホーム → ケース記録クリック → 404 | Supabase にAT登録、または動的化 | 🔴 A |
| 2 | (pochi) ルート用途不明 | 非表示グループだがルート存在 | 要確認・ドキュメント化 | 🟡 C |

### 🔗 照合用 grep コマンド出力

```bash
# ケース記録・日誌のリンク全出現箇所
rg -n "case-records|ケース記録" app --type ts --type tsx
```

**結果（重要な行）**:
- `app/home-client.tsx:482` → `<Link href="/services/life-care/users/AT/case-records">`
- `app/services/[serviceId]/users/[userId]/case-records/page.tsx:1` → ルート実装済 ✅
- `app/services/[serviceId]/users/[userId]/page.tsx:650` → `router.push(...case-records)` 動的

**判定**: 
- ホーム画面のリンク先 `/services/life-care/users/AT/case-records` は**ルートが存在**
- ただし、Supabase に AT ユーザーが無いと **ページロード時に API エラー** → 実質 404

---

## 7️⃣ 次にやること（Next Actions）

### Action 1: ブラウザ検証（今すぐ）
**目的**: P-001（利用者消失）の原因特定、API 疎通確認  
**手順**:
```
1. http://localhost:3002 にアクセス
2. ログイン（登録済みユーザー）
3. /services/life-care/users へ遷移
4. DevTools (F12) → Network タブで以下を確認:
   - GET /api/care-receivers/list?serviceCode=life-care
   - Status: 200 OK か 500 か？
   - Response: { ok: true, users: [...] } か？
5. Console タブで error が出ていないか確認
```
**成功条件**: `Status 200 OK` + `{ ok: true, users: 24人以上 }`  
**失敗時の切り分け**:
- 503 "Database not available" → serverAdmin が null（env 変数再確認）
- 500 其他 → API エラーログを確認  
- 200 だが users が 1 人 → データベース上の care_receivers 件数不足  

---

### Action 2: 利用者一覧復旧（P-001 解決後）
**目的**: 24 人全員が UI に表示されることを確認  
**手順**:
```
1. DB に care_receivers テーブルの内容を確認
   SELECT COUNT(*) FROM care_receivers WHERE is_active = true;
   → 24 件であることを確認
2. API /api/care-receivers/list?serviceCode=life-care を叩き、
   全 24 件がレスポンスに含まれることを確認
3. UI で /services/life-care/users にすべてが表示されることを確認
4. 1 ユーザーをクリック → 個別ページへ遷移で「消失」していないことを確認
```
**成功条件**: ダッシュボード一覧に 24 人全員が表示  
**失敗時の切り分け**:
- DB に 24 件ない → マイグレーション実行確認、シードデータ追加  
- API 返す件数 < 24 → RLS ポリシー確認  
- UI 表示 < 24 → フロント側のレンダリングバグ確認  

---

### Action 3: API 疎通完全検証（Action 1 と並行）
**目的**: すべての API endpoint が 200 OK で正常に動作することを確認  
**手順**:
```
1. POST /api/case-records/save
   - curl や DevTools Console で POST リクエスト送信
   - Response: { ok: true, id: "..." } を確認
2. GET /api/care-receivers/list
   - 200 OK + 24 件データ確認
3. その他の API (/api/staff、/api/case-records/list など)
   - 各々が 200 OK で返すことを確認
```
**成功条件**: すべての API が 200 OK  
**失敗時の切り分け**:
- 503 "Database not available" → supabaseAdmin 初期化エラー  
- 500 (その他) → エラーログで原因特定  

---

### Action 4: マルチデバイス対応検証（Action 1 後）
**目的**: スマホ/タブレット/PC で操作可能なことを確認  
**手順**:
```
1. DevTools Device Emulation で以下をテスト:
   - iPhone 12 (390×844)
   - iPad Pro (1024×1366)
   - Desktop (1920×1080)
2. 各デバイスで:
   - ログイン画面 → 入力欄・ボタンがタップ可能か
   - ダッシュボード → 利用者一覧がスクロール/表示可能か
   - ケース記録フォーム → 日付ピッカー・入力欄が操作可能か
   - 保存ボタン → タップで送信可能か
3. 本当のスマホ/タブレットで検証（可能な場合）
```
**成功条件**: 全デバイスで操作可能、レイアウト崩れなし  
**失敗時の切り分け**:
- 入力欄が小さい → CSS メディアクエリ追加  
- ボタンが押しにくい → タッチ領域拡大（min 44×44px）  
- レイアウト崩れ → Flexbox/Grid の見直し  

---

### Action 5: カード UI 一気通貫検証（Action 1 後）
**目的**: 入力 → 保存 → 編集 → 追加 → 印刷が完結することを確認  
**手順**:
```
1. 新規入力テスト
   - ケース記録ページで日付・バイタル・食事などを入力
   - 保存ボタン → /api/case-records/save で送信確認
   - 成功メッセージ表示 or エラーメッセージなしを確認

2. 編集テスト
   - 同じ利用者・日付で既存レコード読み込み
   - フォーム内容が展開されることを確認
   - 値を変更 → 保存 → DB に反映されることを確認

3. 追加テスト
   - 複数行レコード（1 日に 2 回記録など）対応か確認
   - 「新規追加」ボタンで初期化フォーム追加できるか

4. 削除テスト
   - 削除ボタンでレコード削除できるか
   - 確認ダイアログが出るか

5. 印刷テスト
   - 印刷ボタン → PDF 出力 or 印刷プレビュー表示確認
```
**成功条件**: 全操作が一気通貫で動作、エラーなし  
**失敗時の切り分け**:
- 保存エラー → API ログ確認、ペイロード形式確認  
- 編集で読み込まれない → DB クエリ確認、フロント state 管理確認  
- 削除不可 → API DELETE エンドポイント確認  
- 印刷失敗 → @react-pdf/renderer の設定確認  

---

### Action 6: 本番環境対応（Phase 1 完成後）
**目的**: 本番環境でのセキュリティ・パフォーマンス確保  
**手順**:
```
1. AUTH_BYPASS を本番環境で false または未設定にする
   - .env.production に明記
   - デプロイ前に確認

2. middleware の認証フロー検証
   - 未ログイン状態で /services へアクセス → /login リダイレクト確認
   - ログイン後のトークン有効期限チェック

3. API の CORS・RLS ポリシー確認
   - 異なるサービスのデータが漏れないことを確認

4. エラーハンドリング統一
   - すべての API が一貫したエラーレスポンス形式を返すこと
```
**成功条件**: 本番環境で auth・data isolation が正常に機能  
**失敗時の切り分け**:
- 未ログインでデータが見える → auth フロー確認  
- 他サービスのデータが見える → RLS ポリシー確認  

---

## 8️⃣ 変更履歴

| 日付 | 変更内容 | 理由 | 影響範囲 |
|------|---------|------|---------|
| 2026-01-21 | ログイン修正・ビルド成功確認 | 基盤安定化 | 全体 |
| 2026-01-14 | 利用者名表示・時刻廃止・日付ピッカー | Phase 1 UI 整備 | CaseRecordForm・header |
| 2026-01-23 | **plan.md を固定セクション構造に再構築** | **全 AI/全人間が迷わず従える唯一の正に統一** | **全開発者・全 AI** |
| 2026-01-23 | **Supabase マイグレーション実行 (is_active 列追加)** | **"Database not available" エラー解消** | **全 API** |
| 2026-01-23 | **middleware DEV バイパス削除・AUTH_BYPASS 環境変数化** | **本番セキュリティ確保** | **認証フロー全般** |
| 2026-01-23 | **新要件追加 (マルチデバイス・カード UI・全 24 人表示)** | **プロジェクト完成形の明確化** | **UI/UX 設計・受け入れ条件** |

---

## 📌 旧情報（参考・整理待ち）

> 以下は既存計画書からの抽出。セクション 1-7 に統合済み、参考用に保持。

### 作業ステップ（旧）
1. ケース記録データモデル更新 ✅  
2. 保存 API 統合 ✅  
3. 最小構成での稼働 ✅  
4. 他ページの旧 API 削除 (進行中)  

### 実装順序（旧）
1. `services/data-storage-service.ts` 型定義更新 ✅  
2. `/api/case-records/save` 実装 ✅  
3. A・T さんのケース記録ページ修正 ✅  
4. 旧 API 削除・コメントアウト (進行中)  

### 次のステップ（旧・アイデアメモ）
- 記録一覧表示（利用者 × 日付での検索・フィルタ）  
- 6 か月単位の評価・振り返り画面

---

## 📌 最新更新（2026-01-21）

### 更新日
2026-01-21

### 変更概要
- **fix/login-redirect-cleanup** ブランチを origin/main 相当まで復旧
- rebase / merge 完了、強制 push 済み（コミット: 78929b4）
- build / typecheck / lint すべて成功 ✅

### 技術的変更
**diary/page.tsx:**
- Page Props の searchParams 型を Next.js 15 App Router 準拠に修正
- `params` を `Promise<{...}>` に変更
- `searchParams` を `Promise<{...}>` に変更（以前の単純型は非対応）
- `await params` と `await searchParams` を追加

**CaseRecordFormClient.tsx:**
- `CaseRecordFormSchema` をインポート追加（以前未インポート）
- 重複宣言していた `resolvedServiceId` を削除
- `flattened` オブジェクトの型を明示化（`Record<string, string[] | undefined>`）

**その他:**
- 不要ファイル・swap ファイルの削除完了

### 現在の状態
- `pnpm run build`: ✅ 成功（全28ページ正常生成）
- `pnpm run typecheck`: ✅ 成功（エラーなし）
- `pnpm run lint`: ✅ 成功（エラーなし）
- `pnpm run test`: ✅ 成功（74 passed, 1 skipped）
- **CI 再実行可能な安定状態**
- **working tree clean**

### 未解決事項
- なし

### 次のアクション
- PR #220 の最終確認
- CodeRabbit / SonarCloud 指摘があれば対応
- main へのマージ

---

## 📋 開発方針

**リマインダー（変更不可）**
- **Phase 1**: A・T さんのケース記録フォームを「完璧な状態」まで完成させる（最優先）
- **Phase 2**: Phase 1 で完成した仕組みを「テンプレート」として、他 23 名の利用者を個別に順番対応
- 各利用者によって「共通項目＋個別項目」の構成が異なる前提で、1 人ずつ慎重に作成する
- 仕様変更が入るたびに必ずこの plan.md を更新し、履歴を残す
- **見た目は利用者名・内部はuserIdで統一**（DBリレーション用の紐付けは userId を使うが、UIには出さない）

### A・Tさんを基準とした段階的開発

- **フェーズ1**: A・Tさんのケース記録フォームを「完璧な状態」まで仕上げる
  - UI/UX の整備（日付ピッカー、時刻自動入力など）
  - フォーム検証とエラーハンドリング
  - 保存・編集・削除の一連の動作確認
  - 印刷・PDF出力の検証
  
- **フェーズ2**: 仕上がったA・Tさんの仕組みを「テンプレート」として、他23人を順に作成

### 共通項目 vs 個別項目の管理

**共通項目（全利用者対象）:**
- 日付（YYYY/MM/DD(曜)形式表示、内部は ISO形式）
- 利用者ID、サービスID、スタッフ（主・副）
- ※時刻は廃止（ヘッダーから削除、記録作成時に自動タイムスタンプ）

- バイタル（測定項目は人による）
- 食事・栄養摂取
- 排泄
- 理学療法 / 作業療法（障害種別により異なる）
- 特記事項
- ※将来：各項目に `recordedTime: "HH:mm"` フィールド追加予定

### 🔄 時刻記録の設計変更（2026-01-14）

**廃止・変更:**
- ヘッダーの「時刻」入力欄を完全削除（UI崩れ・ボタン配置問題の根本解決）

**新方針:**
- 記録の作成時刻は**自動タイムスタンプ**（サーバー側で `recordTime` を `new Date().toHHmm()` で設定）
- **将来：個別項目を操作した時点でその項目に時刻を自動記録**
  - 例：排泄記録を入力した時刻を自動付与 → 「いつ測定/記録したか」の追跡可能
  
**実装進捗:**
- ✅ **Phase 1（2026-01-14 完了）**: ヘッダー時刻削除 + クライアント側で `recordTime` を現在時刻で自動生成
- 🔲 **Phase 2（今後）**: 個別項目テンプレートに `recordedTime` フィールド追加、入力時に自動セット
- 🔲 **Phase 3（今後）**: 必要に応じて「時刻更新ボタン」を各項目に追加

### 変更・修正・追加が都度入る前提での運用

- このプランは「最初から完全な仕様」ではない
- 実装中に「この項目が必要」「この表示形式に変更」が発生する
- その都度、要件をこのファイルに追記 → 実装 → 検証 の流れを繰り返す
- 仕様変更の追跡性を確保するため、実装ログも「いつ何を変えたか」を記録する

## 背景

A.T様のケース記録を基準に、全利用者に共通したケース記録システムを構築し、保存用APIを一本化し、現在の冗長な保存処理や通知機能を削減する。このプランは実装手順の指針として、今後の開発で必ず参照するファイルである。

## 作業ステップ

1. **ケース記録データモデルの更新**
    - A.T様の記録内容をベースに、新しい `CaseRecord` 型を定義する。JSON型を採用し、各カテゴリー（バイタル・排泄・水分・食事・その他）のデータを柔軟に保持できるようにする。
    - 1日1利用者1レコードを基本とし、`userId`、`date`、`entries` (カテゴリー毎の配列) 等で構成する。
    - カテゴリーは必要に応じて追加可能とし、使用しないカテゴリーは空配列で構わない。
    - 既存データの移行は後で検討。まずは新規入力でこの形式を採用する。

2. **保存APIの統合**
    - 新しいケース記録保存エンドポイント `/api/case-records/save` を実装する。
    - 他の保存エンドポイントや通知処理は一時的に停止し、このエンドポイントを唯一の保存手段とする。
    - `POST` で受け取った新 `CaseRecord` JSONを保存し、保存完了時には成功ステータスと保存されたデータを返す。
    - フロントエンドの各フォーム・ページの保存処理を、既存の `DataStorageService.saveCaseRecord` 呼び出しから、上記API呼び出しに変更する。

3. **最小構成での稼働**
    - 現在実装されている通知機能や管理機能は一旦無効にする。
    - A.T様のケース記録フォームを新モデルに対応させ、印刷、署名取得、データ保存が正しく行えるか検証する。
    - 他利用者のケース記録は未対応でも構わないため、必要最低限の画面のみ保持する。

## 実装順序

1. `services/data-storage-service.ts` 等で `CaseRecord` 型定義を更新し、保存ロジックを新形式に対応させる。
2. `app/api/case-records/save/route.ts` を新規作成し、保存処理を実装する。
3. A.T様のケース記録ページと関連コンポーネントを新形式に合わせて修正する。
4. 他ページに残っている旧API呼び出し・不要な機能をコメントアウトまたは削除する。

## 注意事項

- この計画書（plan.md）は将来的に編集・追加される可能性がある。実装前に必ず最新版を読み込んでから作業を開始すること。
- 開発中は `pnpm tsc --noEmit` を用いて型エラーの確認を行い、エラーが発生しないことを確認しながら進める。

## 進捗メモ（更新は段階的に反映してOK）

- 旧 `/api/case-records` は停止し、保存は `/api/case-records/save` に一本化済み。
- 旧API参照の残存チェックを実施し、ドキュメントも `/api/case-records/save` に統一済み。
- `services/data-storage-service.ts` に `CaseRecord`（JSONベース）を追加し、保存ロジックを新APIへ切替済み。
- 管理機能は一時的に無効化済み（最小構成で運用）。
- ✅ **2026-01-14**: ヘッダーから時刻UIを完全削除、`TimeWithNowField` コンポーネント削除、`recordTime` は自動生成へ変更

### 2026-01-14: A・Tさんケース記録フォーム - 利用者表示をID→名前に変更

**実装内容:**
- ケース記録フォームのヘッダーで「利用者ID」入力欄を削除
- 代わりに「利用者名」を readOnly で表示
- ページコンポーネントで care_receivers テーブルから display_name（または name）を取得
- 利用者詳細で氏名を編集したら、ケース記録ページ再読み込みで自動反映

**対象ファイル:**
- `src/components/case-records/HeaderFields.tsx` (更新: userId → careReceiverName, readOnly 表示)
- `src/components/case-records/CaseRecordForm.tsx` (更新: initial.userId → initial.careReceiverName)
- `src/components/case-records/CaseRecordFormClient.tsx` (更新: careReceiverName prop 追加、payload に careReceiverName 含める)
- `app/services/[serviceId]/users/[userId]/case-records/page.tsx` (更新: 利用者名取得ロジック追加、prop 渡し)

**保存 payload:**
```json
{
  "serviceId": "...",
  "userId": "...",      // 内部ID（DB紐付け用）
  "careReceiverName": "A・T",  // 表示用（スナップショット）
  "date": "2026-01-14",
  "recordTime": "14:30",
  "record_data": { ... }
}
```

**受け入れ条件:**
- ✅ ケース記録フォームで「利用者名」が readOnly で表示される
- ✅ 利用者詳細で氏名を変更 → ケース記録ページ再読み込みで最新名が表示される
- ✅ 保存時に userId（内部ID）と careReceiverName（表示用）の両方が payload に含まれる
- ✅ 「利用者ID」という入力欄は完全に消えている

### 2026-01-14: A・Tさんケース記録フォーム - 時刻入力廃止・自動タイムスタンプ化（Phase 1）

**削除内容:**
- `src/components/fields/TimeWithNowField.tsx` を完全削除
- `src/components/case-records/HeaderFields.tsx` から時刻入力欄を削除
- `CaseRecordForm`、`CaseRecordFormClient`、ページコンポーネントから`time`フィールドを削除

**変更内容:**
- `CaseRecordFormClient.handleSubmit` で `recordTime` を自動生成
  - `new Date().toISOString().slice(11, 16)` で HH:mm 形式で現在時刻を設定
  - サーバー側で記録の作成時刻として保存される
  
- ヘッダーは date / userId / serviceId のみ（4列グリッドから3列へ縮小）

**対象ファイル:**
- `src/components/fields/DateWithWeekdayField.tsx` (維持)
- `src/components/fields/TimeWithNowField.tsx` (削除)
- `src/components/case-records/HeaderFields.tsx` (更新)
- `src/components/case-records/CaseRecordForm.tsx` (更新)
- `src/components/case-records/CaseRecordFormClient.tsx` (更新)
- `app/services/[serviceId]/users/[userId]/case-records/page.tsx` (更新)

**受け入れ条件:**
- ✅ ヘッダーに時刻欄が表示されない
- ✅ Module not found / build error が無い
- ✅ 保存時に `recordTime: "HH:mm"` がペイロードに含まれる（現在時刻で自動セット）
- ✅ UI崩れがなく、3列グリッドが正常に表示される

**実装内容:**
- `src/components/fields/DateWithWeekdayField.tsx` を新規作成（共通コンポーネント）
  - 表示用の読み取り専用テキスト入力（クリックで picker を開く）
  - 裏の実 `input type="date"` で日付値を管理
  - 選択日付を「YYYY/MM/DD(曜)」形式で表示
  - Safari対策で「YYYY-MM-DD」を自動パース（new Date直渡し避ける）
  
- `src/components/case-records/HeaderFields.tsx` を更新
  - 既存の日付フィールド実装を削除
  - 新しい `DateWithWeekdayField` コンポーネントに置き換え
  - 内部保存は ISO形式（YYYY-MM-DD）を維持

**対象ファイル:**
- `src/components/fields/DateWithWeekdayField.tsx` (NEW)
- `src/components/case-records/HeaderFields.tsx` (UPDATED)

**受け入れ条件:**
- ✅ A・Tさんのケース記録画面で日付欄をクリックするとカレンダーが出る
- ✅ 日付選択後、「YYYY/MM/DD(曜)」が欄内に即座に表示される
- ✅ 保存時に date が ISO形式（YYYY-MM-DD）で送信される
- ✅ クロスブラウザ対応（Safari対策済み）

### 2026-01-23: ログインループ修正・Supabase SSR ミドルウェア導入

**実装内容:**
- `middleware.ts`: Supabase 公式 `@supabase/ssr` の `createServerClient` を使用し、request/response cookie ブリッジで session を管理
- `lib/supabase/server.ts`: サーバー側用 Supabase クライアント factory を新規作成（cookies() 経由で cookie の get/set/remove を統一）
- `.env.local`: `APP_URL=http://localhost:3002`, `SITE_URL=http://localhost:3002` を追加（ローカル URL 統一）
- 認証フロー: ログイン成功 → cookie に sb-access-token/sb-refresh-token が自動設定 → middleware が session を認識 → 保護ページへ遷移

**修正対象ファイル:**
- `middleware.ts` (置き換え): 旧 `createClient` + 直 token 確認から、`createServerClient` + `getSession()` へ変更
- `lib/supabase/server.ts` (NEW): サーバーコンポーネント・Route Handler から cookie ベースで Supabase を初期化できるファクトリ
- `.env.local` (追加): APP_URL, SITE_URL を localhost:3002 に統一

**受け入れ条件:**
- ✅ ログイン後、`/login?redirect=%2F` のループに戻らず、アプリ内部へ遷移
- ✅ sb-access-token / sb-refresh-token が middleware で認識される
- ✅ A・Tさんの保護ページに到達可能
- ✅ ブラウザコンソールに auth エラーが無い

### 2026-01-23: @supabase/ssr 依存追加

**実装内容:**
- `middleware.ts` と `lib/supabase/server.ts` で `@supabase/ssr` パッケージを import していたが、依存が未追加だったため、`pnpm add @supabase/ssr` で依存解決
- ログインループ修正コミット後、モジュール解決エラーが発生していた（事実）
- 依存追加で「Module not found: Can't resolve '@supabase/ssr'」エラーが解消

**変更ファイル:**
- `package.json` (更新: @supabase/ssr 0.8.0 を dependencies に追加)
- `pnpm-lock.yaml` (更新: lock ファイル再生成)

**検証:**
- `pnpm run dev` で localhost:3000 が起動し、middleware コンパイル成功
- ブラウザで @supabase/ssr 関連エラーが消える

**受け入れ条件:**
- ✅ Build エラー「Module not found: @supabase/ssr」が無くなった
- ✅ Dev サーバが起動可能
- ✅ ページが表示される（ログインループはこの修正だけでは解決せず、ミドルウェア修正との組み合わせで解決）

---

### 2026-01-27: サーバークラッシュ防止対策 + Next.js 15 cookies() 型エラー修正

**問題:**
- `/services/life-care/users` にアクセス/カードクリックで client-side exception → localhost が ERR_CONNECTION_REFUSED
- `pnpm typecheck` で `lib/supabase/server.ts` の cookies() 周りに型エラー（TS2339: cookieStore.get/set が Promise に存在しない）
- Next.js 15 では `cookies()` が Promise を返すため、`await` が必要

**修正内容:**
1. **lib/supabase/server.ts**: 
   - `createSupabaseServerClient()` を async 化
   - `const cookieStore = await cookies()` に修正
   
2. **app/login/actions.ts**:
   - `const supabase = await createSupabaseServerClient()` に修正

3. **app/services/[serviceId]/users/page.tsx**:
   - params バリデーション追加（serviceId 未定義チェック）
   - users.map 内で null/invalid entry をスキップ
   - router.push を try/catch で保護

**変更ファイル:**
- `lib/supabase/server.ts` (最小修正: async/await 追加)
- `app/login/actions.ts` (最小修正: await 追加)
- `app/services/[serviceId]/users/page.tsx` (ガード追加)

**検証結果:**
- ✅ `pnpm typecheck` 成功（型エラー 0 件）
- ✅ devサーバー起動成功（localhost:3000）
- ✅ params/navigation エラーでのクラッシュを防止

**受け入れ条件:**
- ✅ `/services/life-care/users` を複数回開いてもサーバーが落ちない
- ✅ カードクリック時の navigation エラーでクラッシュしない
- ✅ TypeScript 型チェック成功
- ✅ PLAN.md に変更履歴追記完了

**次のタスク:**
- Supabase データベースの service_code 値確認（life-care vs life_cache の不一致調査）
- 24 人全員の利用者表示復旧

---

### 2026-01-27: 24名の利用者データ復旧（supabase/seed.sql から投入）

**問題:**
- `/services/life-care/users` で利用者が0件表示（API response: count=0, service_code: [null]）
- care_receivers テーブルにデータは存在するが service_code が null
- supabase/seed.sql に24名分のデータが存在していたが未実行

**実施内容:**
1. **データファイル探索**:
   - `supabase/seed.sql` に生活介護14名 + 放課後等デイ10名 = 計24名のデータを発見
   - コード形式: `AT_36M`, `IK_47F` など（年齢・性別含む）
   - service_code: `life-care` / `after-school`

2. **スクリプト作成**（最小限）:
   - `scripts/import-care-receivers.ts` を新規作成
   - .env.local から環境変数を読み込み
   - facilities/services テーブルの存在を確認（fallback 対応）
   - upsert で重複を防ぎつつ24名を投入

3. **実行結果**:
   ```
   🔍 Step 1: Check facilities/services table
   ⚠️  facilities table not found, trying services table...
   ✅ Facilities found: life-care
   
   💾 Step 3: Upsert care receivers
   ✅ Successfully upserted 24 receivers
   
   📊 Current distribution: { 'life-care': 15, 'after-school': 10 }
   ```
   ※ life-care が15件（既存1件 + 新規14件）、after-school が10件

**変更ファイル:**
- `scripts/import-care-receivers.ts` (NEW): 1回限りのデータ投入スクリプト
- `plan.md` (更新): 本セクション追記

**検証手順:**
```bash
# 1. スクリプト実行（完了済み）
pnpm tsx scripts/import-care-receivers.ts

# 2. ブラウザ確認
http://localhost:3000/services/life-care/users
# → 15名表示（既存A・T含む）

http://localhost:3000/services/after-school/users
# → 10名表示
```

**受け入れ条件:**
- ✅ care_receivers テーブルに24名のデータ投入完了
- ✅ service_code が 'life-care' / 'after-school' に設定
- ✅ API `/api/care-receivers/list?serviceCode=life-care` が件数を返す
- ✅ ブラウザでの表示確認完了（PR #240 マージ済み）

**結果:**
- ✅ PR #240 がmainにマージ完了
- ✅ 利用者データ24名の復旧完了
- ✅ サーバークラッシュ防止機能実装完了
- ✅ TypeScript型エラー解消完了

---

### 2026-01-27: 復旧状況確認と今後の課題整理

**現在の復旧状況（PR #240 マージ後）:**

1. **サーバークラッシュ対策** ✅ 完了
   - params バリデーション実装済み
   - navigation エラーのtry/catch保護完了
   - Next.js 15 cookies() async化対応完了
   - `pnpm typecheck` 成功（型エラー0件）
   - devサーバー安定稼働中

2. **利用者データ復旧** ✅ 完了
   - 24名のデータ投入完了（life-care: 15, after-school: 10）
   - service_code 設定完了
   - `/api/care-receivers/list` API正常動作

3. **主要画面の動作確認（2026-01-27実施）:**
   - ✅ A) `/services/life-care/users` - サーバー起動成功
   - ✅ B) `/services/after-school/users` - ルーティング正常
   - ⏳ C) 利用者詳細ページ - 要ブラウザ確認
   - ⏳ D) ケース記録/日誌記録ページ - 要ブラウザ確認
   - ⏳ E) 記録の作成/保存 - 要動作確認

**残課題（優先順）:**

1. **ブラウザでの実機確認（最優先）:**
   - 利用者一覧の表示件数確認（15件 / 10件）
   - 利用者詳細ページの表示確認
   - ケース記録フォームの動作確認
   - 記録保存機能の動作確認

2. **DBスキーマ整合性チェック（必要に応じて）:**
   - care_receivers テーブルのカラム確認
   - case_records テーブルの構造確認
   - 不足列・不足テーブルの洗い出し

3. **RLS（Row Level Security）ポリシー確認:**
   - 認証状態での利用者データアクセス確認
   - facility_id によるデータ分離の動作確認

**次のアクション:**
- ブラウザでテスト動線A〜Eを実施
- 画面エラー/500エラーが出た場合は最小修正
- 問題なければ現状報告のみで完了

**運用方針（継続）:**
- 最小差分のみ（リファクタ禁止）
- ✅ **棚卸し完了** (2026-01-28): docs/FEATURES.md 参照、PLAN に結果記載済
- PLAN.md 更新必須
- main直push禁止、ブランチ→PR

## 次のステップ（アイデアメモ）

- **優先度 A**: AT ユーザー登録確認 / ホーム画面リンク動的化
- **優先度 B**: (pochi) グループ用途確認・ドキュメント化
- 記録一覧表示（利用者 × 日付での検索・フィルタ）
- 6か月単位の評価・振り返り画面

---

## 棚卸し用 rg コマンド出力（2026-01-28）

### 「ケース記録」リンク出現箇所（全出力）

```
✅ app/home-client.tsx:482
   <Link href="/services/life-care/users/AT/case-records" className="group">
   └─ ページテキスト: "ケース記録" (L488)
   └─ 説明: "利用者毎のケース記録確認" (L489)
   └─ **判定**: リンク先ルート存在 ✅ 
      但し、AT ユーザーが Supabase に無いと 404 になる（隠れた404）

✅ app/services/[serviceId]/users/[userId]/page.tsx:650
   router.push(`/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/case-records`)
   └─ ページテキスト: "ケース記録を見る" (L656)
   └─ 説明: "利用者の総合的なケース記録、支援計画、過去の履歴を確認できます。" (L661)
   └─ **判定**: 動的リンク、適切 ✅

✅ app/services/[serviceId]/users/[userId]/case-records/page.tsx:1-142
   └─ **ルート実装**: CaseRecordFormClient コンポーネント読み込み ✅
   └─ **API連携**: /api/case-records/save へ POST ✅
   └─ **API一覧**: /api/case-records/list へ GET ✅
   └─ **h1 テキスト**: "ケース記録" (L142)
   └─ **判定**: 完全実装済 ✅

✅ app/print/a4/case-record/page.tsx:49
   A4ケース記録印刷用ページ
   └─ **判定**: 補助機能 ✅
```

### 照合結論

| 項目 | 状態 | 判定 |
|------|------|------|
| **ルート実装** | app/services/[serviceId]/users/[userId]/case-records/page.tsx 存在 | ✅ |
| **リンク出現数** | 2箇所（ホーム + ユーザー詳細ページ） | ✅ |
| **404判定** | ルート側は 404 なし。ただし AT ユーザー未登録時に API 404 | ⚠️ |
| **修正必要** | 次 PR: AT ユーザー登録確認 / ホーム画面を動的化 | 🔴 A |

