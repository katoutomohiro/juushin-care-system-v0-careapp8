# ケアシステム新モデル導入計画

## 🎯 最重要ルール（必ず守る）

1. **Phase 1: A・Tさんのケース記録フォームを「完璧な状態」まで完成させることが最優先**。その後、**Phase 2: 他 23 人の利用者のケース記録を順に実装**していく。
2. **ケース記録は共通項目と個別項目が混在する**。各利用者ごとに「共通項目＋個別項目」の構成が異なるため、利用者単位で慎重に作成する。
   - テンプレ増殖ではなく「利用者単位の差分管理」を維持
   - 共通化できる部分と個別化が必要な部分を明確に分離
3. **利用者の表示名は利用者詳細の編集を唯一の正とする**。ケース記録側は常に最新の氏名を取得して表示する。
   - DBは userId（内部ID）で紐付けしたまま、見た目は「利用者名」一本に統一
   - ページで force-dynamic を指定し、キャッシュを無効化
   - Client Component では props の変更を useEffect で state に同期
4. **プランファイルは常に最新状態**を保つ。変更・修正・追加のたびに必ず更新し、AI/人が読んで状況が理解できるようにする。
5. 変更仕様が途中で発生したら、その都度このプランに反映してから実装を進める。

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

**個別項目（利用者ごと）:**
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

### 2026-01-14: A・Tさんケース記録フォーム - 時刻「今すぐ」ボタン機能の実装

**実装内容:**
- `src/components/fields/TimeWithNowField.tsx` を新規作成（共通コンポーネント）
  - 時刻入力欄（type="time"、HH:mm形式）
  - 右側に「今すぐ」ボタン（absolute配置）
  - ボタン押下で現在時刻を自動入力（例：10:30）
  - 手入力による修正は常に可能

- `src/components/case-records/HeaderFields.tsx` を更新
  - 既存の時刻フィールド実装を削除
  - 新しい `TimeWithNowField` コンポーネントに置き換え

**対象ファイル:**
- `src/components/fields/TimeWithNowField.tsx` (NEW)
- `src/components/case-records/HeaderFields.tsx` (UPDATED)

**時刻仕様（次の利用者追加時の参考）:**
- 表示形式: HH:mm（24時間制）
- 「今すぐ」ボタンで現在時刻を自動入力
- 手入力で修正可能
- 保存・印刷で同じ値を使用
- 内部保存形式: HH:mm

**受け入れ条件:**
- ✅ A・Tさんのケース記録画面で「今すぐ」ボタンが表示される
- ✅ ボタン押下で現在時刻が HH:mm 形式で入力される
- ✅ 時刻を手入力で修正可能
- ✅ 保存時に time が HH:mm 形式で送信される
- ✅ Console にエラーなし

### 2026-01-14: A・Tさんケース記録フォーム - 時刻フィールド修正（Phase2、import整合）

**実装内容:**
- `TimeWithNowField` を default export に統一し、呼び出し側の import 不整合を解消
- 時計アイコン非表示のうえ、入力枠内右端に「今すぐ」ボタンを絶対配置（枠内固定）
- onClick で現在時刻 HH:mm を生成し、`{ target: { name, value } }` 形式で親に返却
- type="time" + 右 padding を確保（pr-20）し、UI崩れを防止

**対象ファイル:**
- `src/components/fields/TimeWithNowField.tsx` (UPDATED)
- `src/components/TimeWithNowField.tsx` (RE-EXPORT)
- `src/components/case-records/HeaderFields.tsx` (UPDATED)
- `app/globals.css` (time picker icon 非表示)

**受け入れ条件:**
- ✅ モジュール解決エラー（Module not found: Can't resolve '@/components/TimeWithNowField'）が解消されビルドが通る
- ✅ 時刻欄の右端に「今すぐ」が枠内表示され、時計アイコンは表示されない
- ✅ 「今すぐ」押下で現在時刻が HH:mm で即反映、手入力も可能
- ✅ 保存時に payload の time が HH:mm で送信される
-- ✅ Console にエラーなし

### 2026-01-14: A・Tさん：②時刻 対応追記

**仕様要約:**
- 24時間制、分まで（HH:mm）
- 「今すぐ」ボタンで現在時刻をセット
- 入力枠内右端に絶対配置（はみ出し防止）
- 保存 payload に `time: "HH:mm"` が含まれることを確認

**UI要件:**
- wrapper: `relative w-full min-w-0`
- input: `w-full pr-20`
- button: `absolute right-2 top-1/2 -translate-y-1/2`

**検証観点:**
- `pnpm dev` 起動で module not found が消える
- ケース記録新規入力ページが 500/404 にならず表示される
- 「今すぐ」クリックで現在時刻が `HH:mm` で反映され、Network payload に `time` が含まれる

### 2026-01-15: ケース記録フォーム - SelectItem value="" エラー完全削除

**実装内容:**
- SelectItem の value="" を完全に削除
- 未選択を NONE 定数（`"__none__"`）で統一
- StaffSelector を native select から shadcn/ui Select に変更
- SelectValue の placeholder で「(未選択)」を表示

**対象ファイル:**
- `src/components/case-records/StaffSelector.tsx` (完全刷新)
- `src/components/case-records/CaseRecordsListClient.tsx` (value="" → value={NONE} 変更)

**変換ルール:**
- UI値: NONE → payload変換時: null
- UI値: uuid → payload: uuid

**受け入れ条件:**
- ✅ Runtime Error「Select.Item value empty string」が完全に消える
- ✅ ケース記録画面が正常に表示される
- ✅ 主担当・副担当が同じドロップダウンUIで選択できる
- ✅ 未選択を選んでもクラッシュしない（NONE→nullで保存）
- ✅ pnpm typecheck / pnpm lint が通る

### 2026-01-15: ケース記録フォーム - 主担当/副担当 Select 内「編集モード」実装

**実装内容:**
- StaffSelector に「編集モード」ON/OFF トグル（Switch）を追加
- 編集モード OFF: 通常の SelectItem リスト表示
- 編集モード ON: 各スタッフ行に「名前入力フィールド」＋「保存」ボタンを表示
- 編集は staff.name のみ
- 保存は PUT /api/staff で { id, name, sortOrder, isActive } を送信
- 保存成功後、Select 内の表示が即時更新される
- 選択中の staff.id は変わらない（選択状態の保持）

**対象ファイル:**
- `src/components/case-records/StaffSelector.tsx` (完全拡張)
- `src/components/case-records/CaseRecordForm.tsx` (allStaff prop 追加)
- `src/components/case-records/CaseRecordFormClient.tsx` (allStaff state 追加、fetch ロジック拡張)

**新規 state / hooks:**
- `editMode`: 編集モード ON/OFF
- `editingStaffId`: 編集中のスタッフID
- `editingName`: 編集中の名前入力値
- `isSaving`: 保存中フラグ
- `saveStatus`: 保存成功メッセージ表示（2秒後に消える）

**UI仕様:**
- SelectContent 先頭: 編集モード トグル（Switch）
- 編集モード OFF: [✏️ スタッフ名を編集] ボタンを表示
- 編集モード ON: 各スタッフの行に [入力フィールド] [保存] [キャンセル] ボタンを配置
- 保存中: ボタン disabled + "保存中…" 表示
- 成功: 1～2秒で "保存しました" 表示を消す

**イベント処理:**
- 編集入力・保存ボタンのクリックで e.preventDefault() / e.stopPropagation() を使用
- Select が誤って選択確定しないよう防止

**受け入れ条件:**
- ✅ 主担当・副担当どちらの Select でも編集モードが使える
- ✅ 任意のスタッフ名を編集して保存すると、即座に Select の表示が更新される
- ✅ pnpm typecheck が通る
- ✅ pnpm lint が通る（警告なし）
- ✅ Select empty value エラーが再発しない

## STEP 1: 保存基盤の安定化（2026-01-15）

**テーマ:** ケース記録の保存処理を「絶対に壊れない形」に安定化。既存仕様は変えず、エラーハンドリングとレスポンス形式のみを整理。

**実装内容:**

### 【app/api/case-records/save/route.ts】
- ✅ try/catch 構造を確認・強化
- ✅ 成功時: `{ ok: true, record: data }`
- ✅ 失敗時: `{ ok: false, error: message, detail?, fieldErrors? }`
- ✅ HTTP status: 成功=200, クライアント側エラー=400, サーバーエラー=500
- ✅ Supabase error は message を そのまま返す（throw しない）
- ✅ console.error で error details + stack を記録

### 【services/data-storage-service.ts】
- ✅ `saveCaseRecord()` の戻り値を `boolean` に統一（`CaseRecord` → `true`）
- ✅ fetch 後に `response.ok` + `result.ok` の両方をチェック
- ✅ HTTP error / API result.ok=false の両方で error を throw
- ✅ エラーメッセージに detail を含めて詳細情報を伝える
- ✅ UI責務は持たず、throw Error のみを返す（呼び出し元で try/catch）

### 【src/components/case-records/CaseRecordFormClient.tsx】
- ✅ 保存処理を `try { await fetch → json() → check ok } catch (e) { setError(e.message) }` に統一
- ✅ `apiResponse.ok` チェック → HTTP エラーを早期検出
- ✅ `apiResult?.ok` チェック → API エラーを検出
- ✅ 両方失敗時は Error を throw → catch で error.message 表示
- ✅ 成功時は `setStatusMessage("保存しました")` 表示 + toast
- ✅ console.error は残す（診断用）

**禁止事項:**
- ❌ 新しい保存API作成
- ❌ payload 項目の増減
- ❌ UI構造変更
- ❌ 型を any に逃がす

**受け入れ条件:**
- ✅ pnpm typecheck が通る（型エラーなし）
- ✅ pnpm lint が通る（警告なし）
- ✅ 保存失敗時に理由が画面で分かる
- ✅ 保存成功が必ず分かる（statusMessage + toast）
- ✅ 新しいエラーが発生しない

## STEP 2: 保存後 care receiver 再取得エラー修正（2026-01-15）

**テーマ:** 保存後に発生する `/api/care-receivers` の 500 エラーを修正。保存ロジックには触らず、取得APIのエラーのみを潰す。

**実装内容:**

### 【app/api/care-receivers/route.ts】
- ✅ Select カラムから `service_id` を除去（実テーブルに存在しないため）
- ✅ 実カラムのみ：`id, code, name` をselect
- ✅ Supabase error 時は 500 ではなく 200 + `{ ok: false, error, detail }` を返す
- ✅ data が null の場合も 200 + `{ ok: false }` で返す
- ✅ console.error で エラー詳細を記録（code, details, message）

### 【app/services/[serviceId]/users/[userId]/page.tsx】
- ✅ `fetchCareReceiverName()` を完全リファクタ
  - 戻り値を必ず `string` に（null ではなく、fallback 名を返す）
  - HTTP エラー（response.ok === false）でも throw しない
  - API 結果 ok:false でも throw しない
  - 実例外（JSON parse エラー等）のみ catch して warn を出す
- ✅ console.error → console.warn に変更（重大度低下）
- ✅ 連発防止フラグ `fetchWarnedRef` を導入（warn は1回だけ）
- ✅ setDisplayName は常に実行（fallback 名を設定）

**禁止事項:**
- ❌ 新しいAPIを作らない
- ❌ payload 項目を増減しない
- ❌ throw で画面を止める

**受け入れ条件:**
- ✅ 保存後に Console の 500 エラーが出ない
- ✅ 保存結果画面はそのまま表示される
- ✅ Network tab で GET /api/care-receivers が 200 で返る（ok:false でも 200）
- ✅ Console の赤い「Failed to fetch」系が消える（warn は1回だけ）
- ✅ API が ok:false を返しても画面は正常表示（fallback 名が使われる）

## STEP 4: Care receiver 取得失敗を完全に許容（2026-01-15）

**テーマ:** /api/care-receivers の「ok:false」を完全に許容。取得失敗をエラー扱いせず、UIはフォールバック表示で継続する。

**実装内容:**

### 【全 care receiver 取得箇所】
- ✅ `fetchCareReceiverName()` で統一実装済み
- ✅ fetch 結果が HTTP 200 + json.ok === false でも throw / console.error なし
- ✅ 名前取得関数は必ず string を返す
  - 成功 → careReceiver.name
  - 失敗 → userId（fallback）
- ✅ console.error は例外（コードバグ）のみ
- ✅ console.warn は 1回まで（fetchWarnedRef フラグで抑制）

### 【スキャン結果】
- `UserDetailPage` の `fetchCareReceiverName()`: ✅ 実装済み
- `CaseRecordsPage`: ✅ Supabase 直接クエリ（クライアント API不使用）
- その他の care receiver 取得: ✅ 該当なし（PUT update-display-name は保存用で別扱い）

### 【パターン実装例】
```typescript
const fetchCareReceiverName = useCallback(async (): Promise<string> => {
  try {
    const response = await fetch(`/api/care-receivers?code=...`)
    if (!response.ok) {
      console.warn("[...] HTTP error", { status: response.status })
      return userId // fallback
    }
    const result = await response.json().catch(() => null)
    if (!result?.ok) {
      console.warn("[...] API returned ok:false", { error: result?.error })
      return userId // fallback
    }
    return result?.careReceiver?.name || userId // success or fallback
  } catch (error) {
    console.warn("[...] Unexpected error", error)
    return userId // fallback
  }
}, [...])
```

**受け入れ条件:**
- ✅ 保存後に console に赤 error が出ない（console.warn のみ）
- ✅ 画面表示は継続する（fallback 名で表示）
- ✅ 保存処理は一切変更なし
- ✅ pnpm typecheck / lint が通る

## 次のステップ（アイデアメモ）

- 記録一覧表示（利用者 × 日付での検索・フィルタ）
- 6か月単位の評価・振り返り画面
---

# STEP 5: StaffSelector の「編集モード（インライン編集）」完全安定化 ✅

**2026-01-15 実装完了**

### 目的
StaffSelector の inline edit mode で Radix Select のイベント干渉を排除し、日本語入力・Backspace削除・save処理が安定して動作する環境を実現する。

### 実装内容

#### A. Controlled Open State
- `mainOpen`, `subOpen` useState を追加
- `useEffect` で editMode 変更時に両 Select を強制 open=true に
- 選択変更ブロック: editMode 中は handleMainChange/handleSubChange が早期リターン

#### B. Event Capture フェーズ
Input・Button に以下を追加：
- `onPointerDownCapture`: e.preventDefault() + e.stopPropagation()
- `onKeyDownCapture`: e.stopPropagation() only（キー入力は常に許可）
- `onClick`, `onMouseDown`: 従来通り preventDefault + stopPropagation

#### C. State Management
- `saveMsgById`: Record<string, { message, timestamp }> で複数行の save 状態を管理
- `clearMsgTimerRef`: useRef で timeout を記録し、重複クリア防止

#### D. Save Response Processing
```typescript
if (!response.ok || !result.ok) {
  throw new Error(result.error || "保存に失敗しました")
}
```
→ 厳格なエラーチェック（response.ok AND result.ok）

#### E. Post-Save staffOptions Update
- `onUpdateStaff` callback で親に通知
- CaseRecordFormClient: `setStaffOptions` で label 更新
- CaseRecordFormClient: `setAllStaff` で全情報更新
- 即座に UI に反映（2秒後に save メッセージ消去）

#### F. Div-Based Edit Rendering
- editMode 中は SelectItem 不使用
- edit 行を `<div>` で render（onClick/onMouseDown で事前ブロック）
- これにより Select の click/drag logic 回避

#### G. Value Handling
- NONE sentinel（`__none__`）で統一
- editMode 中は onValueChange 呼び出し抑制（if editMode return）
- Controlled value: mainSelectValue/subSelectValue

### ファイル修正

**修正ファイル:**
1. `src/components/case-records/StaffSelector.tsx`: 完全改修
2. `src/components/case-records/CaseRecordForm.tsx`: onUpdateStaff prop 追加
3. `src/components/case-records/CaseRecordFormClient.tsx`: handleUpdateStaff handler 追加

### 受け入れ条件

✅ **日本語入力が正常に動く**
- 全角文字列の入力・変更が中断されない
- IME入力による選択状態の誤認識がない

✅ **Backspace削除が正常に動く**
- 連続削除が可能
- 文字列端のカーソル位置でのBackspace も反応

✅ **Save ボタンが確実に反応**
- Click/Touch 入力を正しく受け取る
- Save API が呼び出される（fetch 成功）

✅ **Post-Save 表示更新が即座**
- "保存しました" メッセージが 2秒後に消える
- staffOptions の label が即座に更新される
- 複数行編集時に各行が独立して管理される

✅ **Type & Lint 検証**
- pnpm typecheck: ✅ 通る
- pnpm lint: ✅ 通る（no new errors）

### 技術的なポイント

1. **Event Interception**: キャプチャフェーズで Select より先に input/button がイベントを処理
2. **Controlled Open**: React state で Select の open/close を完全制御
3. **saveMsgById Pattern**: ID ベースで複数 save メッセージを管理（previous saveStatus は 1つのみ管理可能）
4. **onUpdateStaff Callback**: 親コンポーネント（CaseRecordFormClient）で staffOptions を動的更新