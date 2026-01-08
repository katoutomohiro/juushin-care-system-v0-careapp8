# A4印刷専用レイアウト - ケース記録

## 概要

ATさんのケース記録をA4サイズ（210mm × 297mm 縦）で正確に印刷するための専用ページです。

## アクセス

**URL**: `/print/a4/case-record`

開発サーバー: `http://localhost:3000/print/a4/case-record`

## 印刷方法

### ブラウザから印刷

1. ページを開く
2. ブラウザの印刷機能を使用（Ctrl+P / Cmd+P）
3. 用紙サイズを「A4」に設定
4. 印刷

### CSS設定

- **用紙サイズ**: A4縦（210mm × 297mm）
- **余白**: 15mm（上下左右）
- **フォント**: 游ゴシック 11pt
- **行間**: 1.6

## レイアウト構成

### 1. 基本情報セクション
- 利用者ID
- 記録日
- 記録時刻
- 担当スタッフ

2列グリッドレイアウト（50mm:50mm）

### 2. リハビリセクション

#### ストレッチ・マッサージ
- テキストエリア形式（最小高さ: 20mm）

#### 課題① 側弯・拘縮予防
- タイトル行
- 実施内容（テキストエリア）

#### 課題② 下肢機能低下防止
- タイトル行
- 立ち上がり訓練回数
- 実施内容（テキストエリア）

### 3. 意思疎通セクション

#### 課題③ 意思疎通
- タイトル行
- コミュニケーション方法（チェックボックスグループ）
  - 声掛け反応
  - カード
  - 視線接触
  - トイレ誘導
  - 身振り
  - その他
- 実施内容・様子（テキストエリア）

### 4. 活動セクション
- 活動等の内容（テキストエリア）

### 5. 身体拘束セクション
- 身体拘束の有無（チェックボックスグループ）
  - 無
  - 有（車いす）
  - 有（テーブル）
  - 有（胸ベルト）
  - 有（その他）
- 実施理由（テキストエリア）

### 6. 特記事項セクション
- 特記事項（テキストエリア）

## 実装ファイル

### page.tsx
**パス**: `app/print/a4/case-record/page.tsx`

現在は静的なレイアウトのみ実装。

**今後の拡張**:
- URLパラメータまたはクエリからデータを取得
- Supabase から実際の記録データを読み込む
- チェックボックスの選択状態を反映

### print.module.css
**パス**: `app/print/a4/case-record/print.module.css`

CSS Modules で印刷専用スタイルを定義。

**主要クラス**:
- `.printContainer`: A4用紙サイズのコンテナ
- `.pageTitle`: ページタイトル（中央揃え、下線付き）
- `.section`: セクション単位（改ページ制御）
- `.sectionTitle`: セクションタイトル（左境界線付き、グレー背景）
- `.fieldRow`: フィールド行（ラベル + 値）
- `.fieldLabel`: フィールドラベル（太字、50mm幅固定）
- `.fieldValue`: フィールド値（下線付き）
- `.fieldValueTextarea`: テキストエリア形式（枠線付き、最小高さ20mm）
- `.checkboxGroup`: チェックボックスグループ
- `.checkboxItem`: チェックボックス項目
- `.checkboxBox`: チェックボックス（4mm×4mm）

## 印刷時の特殊設定

### @media print
```css
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  .printContainer {
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
  }
}
```

### ページブレーク制御
```css
.section {
  page-break-inside: avoid;  /* セクション途中での改ページを防ぐ */
}

.fieldRow {
  page-break-inside: avoid;  /* フィールド行の分断を防ぐ */
}
```

## 画面プレビュー

### @media screen
開発時は画面上でもレイアウトを確認できます：

- コンテナ幅: 210mm固定
- 影付き（box-shadow）
- 上下余白: 20px

## データ構造（将来の実装用）

```typescript
interface CaseRecordPrintData {
  // 基本情報
  userId: string
  recordDate: string
  recordTime: string
  mainStaff: string
  subStaff?: string
  
  // リハビリ
  stretchMassage: string
  challenge1Title: string
  challenge1Details: string
  challenge2Title: string
  challenge2StandingCount: string
  challenge2Details: string
  
  // 意思疎通
  challenge3Title: string
  challenge3Communication: string[]
  challenge3Details: string
  
  // 活動
  activityContent: string
  
  // 身体拘束
  restraintStatus: string
  restraintReason: string
  
  // 特記事項
  specialNotes: string
}
```

## 今後の拡張予定

### フェーズ1: データ連携
- [ ] URLクエリパラメータでデータIDを受け取る
- [ ] Supabase からケース記録を取得
- [ ] フォームに入力されたデータを表示

### フェーズ2: 動的レンダリング
- [ ] チェックボックスの選択状態を反映（□ → ☑）
- [ ] 空のフィールドを非表示または最小化
- [ ] 複数ページ対応（A4 1枚に収まらない場合）

### フェーズ3: PDF出力
- [ ] ブラウザの印刷機能だけでなく、PDF直接生成
- [ ] @react-pdf/renderer との統合
- [ ] ダウンロード機能の追加

## トラブルシューティング

### 印刷時にレイアウトが崩れる
**原因**: ブラウザの印刷設定が正しくない

**解決策**:
1. 用紙サイズを「A4」に設定
2. 余白を「既定」または「15mm」に設定
3. 「背景のグラフィック」をONにする（グレー背景を印刷する場合）

### フォントが変わって印刷される
**原因**: 指定フォントがシステムにインストールされていない

**フォールバック順**:
1. Yu Gothic（游ゴシック）
2. Hiragino Kaku Gothic ProN（ヒラギノ角ゴ）
3. Meiryo（メイリオ）
4. sans-serif（システム標準）

### A4に収まらない
**原因**: コンテンツ量が多い

**対策**:
1. テキストエリアの内容を簡潔にする
2. 複数ページに分ける（将来実装）
3. フォントサイズを小さくする（最終手段、可読性低下注意）

## 関連ドキュメント

- **ATテンプレート定義**: [lib/templates/at-template.ts](../../../lib/templates/at-template.ts)
- **テンプレート拡張ガイド**: [lib/templates/README.md](../../../lib/templates/README.md)
- **ケース記録フォーム**: [app/services/[serviceId]/users/[userId]/case-records/page.tsx](../../../app/services/[serviceId]/users/[userId]/case-records/page.tsx)

## 更新履歴

- **2026-01-08**: 初版作成（静的レイアウト実装）
