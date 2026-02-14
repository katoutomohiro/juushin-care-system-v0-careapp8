# A4印刷専用レイアウチE- ケース記録

## 概要E
ATさんのケース記録をA4サイズ�E�E10mm ÁE297mm 縦�E�で正確に印刷するための専用ペ�Eジです、E
## アクセス

**URL**: `/print/a4/case-record`

開発サーバ�E: `http://dev-app.local:3000/print/a4/case-record`

## 印刷方況E
### ブラウザから印刷

1. ペ�Eジを開ぁE2. ブラウザの印刷機�Eを使用�E�Etrl+P / Cmd+P�E�E3. 用紙サイズを「A4」に設宁E4. 印刷

### CSS設宁E
- **用紙サイズ**: A4縦�E�E10mm ÁE297mm�E�E- **余白**: 15mm�E�上下左右�E�E- **フォンチE*: 游ゴシチE�� 11pt
- **行間**: 1.6

## レイアウト構�E

### 1. 基本惁E��セクション
- 利用老ED
- 記録日
- 記録時刻
- 拁E��スタチE��

2列グリチE��レイアウト！E0mm:50mm�E�E
### 2. リハビリセクション

#### ストレチE��・マッサージ
- チE��ストエリア形式（最小高さ: 20mm�E�E
#### 課題① 側弯・拘縮予防
- タイトル衁E- 実施冁E���E�テキストエリア�E�E
#### 課題② 下肢機�E低下防止
- タイトル衁E- 立ち上がり訓練回数
- 実施冁E���E�テキストエリア�E�E
### 3. 意思疎通セクション

#### 課題③ 意思疎送E- タイトル衁E- コミュニケーション方法（チェチE��ボックスグループ！E  - 声掛け反忁E  - カーチE  - 視線接触
  - トイレ誘封E  - 身振めE  - そ�E仁E- 実施冁E��・様子（テキストエリア�E�E
### 4. 活動セクション
- 活動等�E冁E���E�テキストエリア�E�E
### 5. 身体拘束セクション
- 身体拘束�E有無�E�チェチE��ボックスグループ！E  - 無
  - 有（車いす！E  - 有（テーブル�E�E  - 有（�Eベルト！E  - 有（その他！E- 実施琁E���E�テキストエリア�E�E
### 6. 特記事頁E��クション
- 特記事頁E��テキストエリア�E�E
## 実裁E��ァイル

### page.tsx
**パス**: `app/print/a4/case-record/page.tsx`

現在は静的なレイアウト�Eみ実裁E��E
**今後�E拡張**:
- URLパラメータまた�EクエリからチE�Eタを取征E- Supabase から実際の記録チE�Eタを読み込む
- チェチE��ボックスの選択状態を反映

### print.module.css
**パス**: `app/print/a4/case-record/print.module.css`

CSS Modules で印刷専用スタイルを定義、E
**主要クラス**:
- `.printContainer`: A4用紙サイズのコンチE��
- `.pageTitle`: ペ�Eジタイトル�E�中央揁E��、下線付き�E�E- `.section`: セクション単位（改ペ�Eジ制御�E�E- `.sectionTitle`: セクションタイトル�E�左墁E��線付き、グレー背景�E�E- `.fieldRow`: フィールド行（ラベル + 値�E�E- `.fieldLabel`: フィールドラベル�E�太字、E0mm幁E��定！E- `.fieldValue`: フィールド値�E�下線付き�E�E- `.fieldValueTextarea`: チE��ストエリア形式（枠線付き、最小高さ20mm�E�E- `.checkboxGroup`: チェチE��ボックスグルーチE- `.checkboxItem`: チェチE��ボックス頁E��
- `.checkboxBox`: チェチE��ボックス�E�EmmÁEmm�E�E
## 印刷時�E特殊設宁E
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

### ペ�Eジブレーク制御
```css
.section {
  page-break-inside: avoid;  /* セクション途中での改ペ�Eジを防ぁE*/
}

.fieldRow {
  page-break-inside: avoid;  /* フィールド行�E刁E��を防ぁE*/
}
```

## 画面プレビュー

### @media screen
開発時�E画面上でもレイアウトを確認できます！E
- コンチE��幁E 210mm固宁E- 影付き�E�Eox-shadow�E�E- 上下余白: 20px

## チE�Eタ構造�E�封E��の実裁E���E�E
```typescript
interface CaseRecordPrintData {
  // 基本惁E��
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
  
  // 意思疎送E  challenge3Title: string
  challenge3Communication: string[]
  challenge3Details: string
  
  // 活勁E  activityContent: string
  
  // 身体拘杁E  restraintStatus: string
  restraintReason: string
  
  // 特記事頁E  specialNotes: string
}
```

## 今後�E拡張予宁E
### フェーズ1: チE�Eタ連携
- [ ] URLクエリパラメータでチE�EタIDを受け取めE- [ ] Supabase からケース記録を取征E- [ ] フォームに入力されたチE�Eタを表示

### フェーズ2: 動的レンダリング
- [ ] チェチE��ボックスの選択状態を反映�E�□ ↁE☑！E- [ ] 空のフィールドを非表示また�E最小化
- [ ] 褁E��ペ�Eジ対応！E4 1枚に収まらなぁE��合！E
### フェーズ3: PDF出劁E- [ ] ブラウザの印刷機�Eだけでなく、PDF直接生�E
- [ ] @react-pdf/renderer との統吁E- [ ] ダウンロード機�Eの追加

## トラブルシューチE��ング

### 印刷時にレイアウトが崩れる
**原因**: ブラウザの印刷設定が正しくなぁE
**解決筁E*:
1. 用紙サイズを「A4」に設宁E2. 余白を「既定」また�E、E5mm」に設宁E3. 「背景のグラフィチE��」をONにする�E�グレー背景を印刷する場合！E
### フォントが変わって印刷されめE**原因**: 持E��フォントがシスチE��にインスト�EルされてぁE��ぁE
**フォールバック頁E*:
1. Yu Gothic�E�游ゴシチE���E�E2. Hiragino Kaku Gothic ProN�E�ヒラギノ角ゴ�E�E3. Meiryo�E�メイリオ�E�E4. sans-serif�E�シスチE��標準！E
### A4に収まらなぁE**原因**: コンチE��チE��が多い

**対筁E*:
1. チE��ストエリアの冁E��を簡潔にする
2. 褁E��ペ�Eジに刁E��る（封E��実裁E��E3. フォントサイズを小さくする（最終手段、可読性低下注意！E
## 関連ドキュメンチE
- **ATチE��プレート定義**: [lib/templates/at-template.ts](../../../lib/templates/at-template.ts)
- **チE��プレート拡張ガイチE*: [lib/templates/README.md](../../../lib/templates/README.md)
- **ケース記録フォーム**: [app/services/[serviceId]/users/[userId]/case-records/page.tsx](../../../app/services/[serviceId]/users/[userId]/case-records/page.tsx)

## 更新履歴

- **2026-01-08**: 初版作�E�E�静皁E��イアウト実裁E��E
