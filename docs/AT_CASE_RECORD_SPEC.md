# AT_CASE_RECORD_SPEC.md - A.T専用ケース記録仕様

**更新日**: 2025-12-16  
**対象利用者**: A・T（userId = "A・T", AT_USER_ID）

## 概要
生活介護サービスにおける日々のケア記録をA4用紙に印刷可能な形式で記録するフォーム。  
プルダウン/チェック/数値/時刻/自由記述を組み合わせた詳細記録。

## データモデル
**ファイル**: `lib/at-case-record-template.ts`

### ATCaseRecord インターフェース（28フィールド）

#### ヘッダ情報
- `date: string` - 記録日（YYYY-MM-DD）
- `staffName: string` - 担当職員名
- `serviceStartTime: string` - サービス開始時刻（HH:mm）
- `serviceEndTime: string` - サービス終了時刻（HH:mm）

#### バイタルサイン（4回分の体温記録）
- `bodyTemperatures: number[]` - 体温（4回分、例: [36.5, 36.7, 0, 0]）
- `bodyTemperatureTimes: string[]` - 測定時刻（4回分、例: ["10:00", "14:00", "", ""]）

#### 水分補給（4回分）
- `hydrationTypes: string[]` - 水分種類（4回分、例: ["水", "お茶", "", ""]）
- `hydrationAmounts: number[]` - 量（ml単位、例: [200, 150, 0, 0]）
- `hydrationTimes: string[]` - 時刻（4回分）

#### 排泄記録（6回分）
- `excretionTimes: string[]` - 排泄時刻（6回分）
- `excretionDefecations: boolean[]` - 便の有無（6回分）
- `excretionDefecationStatuses: string[]` - 便の状態（6回分、例: ["普通", "軟便", "", ...]）

#### 食事記録
##### 昼食
- `lunchMainFoodPercentage: number` - 主食摂取率（%）
- `lunchSideDishPercentage: number` - 副食摂取率（%）
- `lunchMedicationTime: string` - 服薬時刻
- `lunchOralCare: boolean` - 口腔ケア実施

##### おやつ
- `snackMainFoodPercentage: number` - おやつ摂取率（%）
- `snackMedicationTime: string` - 服薬時刻
- `snackOralCare: boolean` - 口腔ケア実施

#### 入浴
- `bathingMethod: string` - 入浴方法（例: "一般浴", "機械浴", "清拭"）

#### 課題・訓練（3項目）
- `task1: string` - 課題①（自由記述）
- `task2: string` - 課題②（自由記述）
- `task3: string` - 課題③（自由記述）

#### 身体拘束
- `physicalRestraint: boolean` - 実施有無
- `physicalRestraintDetail: string` - 詳細（実施時のみ記入）

#### 活動記録
- `activityContent: string` - 活動内容（自由記述）

#### 特記事項
- `remarks: string` - その他特記事項（自由記述）

## フォーム構成
**ファイル**: `components/at-case-record-form.tsx`

### セクション1: ヘッダ（日付・職員・時間帯）
- 記録日（日付入力）
- 担当職員名（テキスト入力）
- サービス開始時刻・終了時刻（時刻入力）

### セクション2: バイタルサイン
- 体温測定（4回分）: 時刻 + 体温（℃）

### セクション3: 水分補給
- 4回分: 時刻 + 種類（プルダウン: 水/お茶/ジュース/その他）+ 量（ml）

### セクション4: 排泄記録
- 6回分: 時刻 + 便有無（チェック）+ 便の状態（プルダウン: 普通/軟便/下痢/便秘）

### セクション5: 食事（昼食・おやつ）
- 昼食: 主食摂取率（%）+ 副食摂取率（%）+ 服薬時刻 + 口腔ケア（チェック）
- おやつ: 摂取率（%）+ 服薬時刻 + 口腔ケア（チェック）

### セクション6: 入浴
- 入浴方法（プルダウン: 一般浴/機械浴/清拭/シャワー浴/なし）

### セクション7: 課題・訓練
- 課題①、②、③（テキストエリア）

### セクション8: 身体拘束
- 実施有無（チェック）+ 詳細（テキストエリア）

### セクション9: 活動内容
- 活動内容（テキストエリア）

### セクション10: 特記事項
- その他特記事項（テキストエリア）

## A4出力レイアウト
**ファイル**: `components/at-case-record-print.tsx`

### 用紙サイズ
- A4（210mm × 297mm）
- 余白: 各20mm

### レイアウト
1. **タイトル**: 中央揃え「生活介護ケース記録」
2. **利用者名**: "A・T"（固定）
3. **記録日・担当者・時間帯**: 表形式
4. **バイタル〜特記事項**: 各セクションを表またはブロックで配置
5. **フッター**: なし（追加可能）

### 印刷方法
- ブラウザの `window.print()` を使用
- 印刷ダイアログから用紙サイズA4、縦向きを選択

## プルダウン選択肢一覧
**定義**: `lib/at-case-record-template.ts` の `AT_FORM_METADATA`

### 水分種類
- "水", "お茶", "ジュース", "スポーツドリンク", "その他"

### 入浴方法
- "一般浴", "機械浴", "清拭", "シャワー浴", "なし"

### 便の状態
- "普通", "軟便", "下痢", "便秘", "なし"

## 今後の拡張予定
- [ ] Supabaseへの保存機能（現在はフォーム入力→プレビュー→印刷のみ）
- [ ] 過去記録の参照・編集機能
- [ ] Excel出力機能
- [ ] 他の利用者への横展開（テンプレ化）

## 参考
- A.Tさん専用の feature flag: `userId === AT_USER_ID`
- 他の利用者は従来の「日誌記録」（daily-logs）を使用
