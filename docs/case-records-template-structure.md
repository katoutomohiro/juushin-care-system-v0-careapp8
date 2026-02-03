# ケース記録テンプレート構造ガイド

## 概要

ケース記録フォームは、全利用者共通の項目と、利用者固有の項目を分離した2層構造になっています。

## アーキテクチャ

### 1. フィールドの分類

```typescript
type FieldConfiguration = {
  commonFields: TemplateField[]      // 全利用者共通フィールド
  individualFields: TemplateField[]  // 利用者固有フィールド
}
```

#### commonFields（共通フィールド）
現在は空配列。将来的に全利用者に共通するカスタムフィールドがあれば、ここに追加します。

**注意**: 以下は別コンポーネントで既に実装されています：
- 日付・時間 → `HeaderFields`
- スタッフ選択 → `StaffSelector`
- 特記事項・家族連絡 → `NotesSection`

#### individualFields（個別フィールド）
利用者ごとに異なるカスタムフィールド。`userId`に基づいて動的に読み込みます。

**現在サポート**:
- `AT` → `lib/templates/at-template.ts` (11個のカスタムフィールド)

**将来追加可能**:
- `IK` → `lib/templates/ik-template.ts`
- `OS` → `lib/templates/os-template.ts`
- など

### 2. ファイル構成

```
lib/templates/
├── field-config.ts          # フィールド構成の管理（新規追加）
├── getTemplate.ts           # テンプレート取得関数（field-configを使用）
├── at-template.ts           # ATさん専用フィールド定義
├── schema.ts                # 型定義
└── categories.ts            # カテゴリ定義
```

### 3. データフロー

```
userId (例: "AT")
  ↓
getTemplate(userId)
  ↓
getFieldConfiguration(userId)
  ├─ commonFields: []
  └─ individualFields: AT_TEMPLATE_FIELDS (from at-template.ts)
  ↓
mergeFields(config)
  ↓
CareReceiverTemplate {
  careReceiverId: "AT",
  name: "A・T 専用テンプレート",
  customFields: [...11個のフィールド]
}
  ↓
CaseRecordFormClient
  ↓
CaseRecordForm
  ↓
TemplateFieldsSection (個別フィールドをレンダリング)
```

## 新しい利用者を追加する方法

### Step 1: テンプレートファイル作成

`lib/templates/ik-template.ts` を作成:

```typescript
import { TemplateField } from "./schema"
import { CareCategory } from "./categories"

export const IK_TEMPLATE_FIELDS: TemplateField[] = [
  {
    id: "ik_custom_field_1",
    label: "I・Kさん専用項目1",
    category: CareCategory.ACTIVITY,
    type: "textarea",
    required: false,
    placeholder: "記録内容を入力",
    order: 0,
  },
  // ... 他のフィールド
]
```

### Step 2: field-config.ts に追加

`lib/templates/field-config.ts` の `getIndividualFields` 関数を更新:

```typescript
function getIndividualFields(userId: string): TemplateField[] {
  switch (userId) {
    case "AT":
      return require("./at-template").AT_TEMPLATE_FIELDS
    
    case "IK":  // 追加
      return require("./ik-template").IK_TEMPLATE_FIELDS
    
    default:
      return []
  }
}
```

### Step 3: 動作確認

1. `/services/life-care/users/IK/case-records` にアクセス
2. I・Kさん専用フィールドが表示されることを確認
3. 保存して Supabase の `payload.custom` に保存されることを確認

## 既存のpayload構造（維持）

保存時のJSONペイロード構造は変更なし:

```json
{
  "userId": "AT",
  "serviceId": "life-care",
  "recordDate": "2026-01-08",
  "recordTime": "14:30",
  "mainStaffId": "staff-1",
  "subStaffIds": ["staff-2"],
  "payload": {
    "specialNotes": "特記事項",
    "familyNotes": "家族連絡",
    "custom": {
      "at_stretch_massage": "10分実施",
      "at_challenge1_details": "着座訓練"
      // ... 他のカスタムフィールド
    }
  }
}
```

## コンポーネントの役割分担

### CaseRecordFormClient
- テンプレート取得
- API送信処理
- 保存状態の表示

### CaseRecordForm
- フォーム全体の構造
- 共通セクション (Header, Staff, Notes)
- 個別フィールドセクション (TemplateFieldsSection)

### TemplateFieldsSection
- `templateFields` を受け取りレンダリング
- `commonFields` + `individualFields` の区別は不要（マージ済み）

## 将来の拡張可能性

### 共通フィールドの追加例

全利用者に「体調」フィールドを追加する場合:

```typescript
// lib/templates/field-config.ts
export const COMMON_FIELDS: TemplateField[] = [
  {
    id: "common_condition",
    label: "体調",
    category: CareCategory.VITAL,
    type: "select",
    options: [
      { value: "good", label: "良好" },
      { value: "normal", label: "普通" },
      { value: "poor", label: "不調" },
    ],
    required: true,
    order: 0,
  },
]
```

これにより、全利用者のケース記録に「体調」フィールドが表示されます。

## 制約事項

- API / Supabase のスキーマは変更しない
- UIの見た目は変更しない
- 既存のATさんの動作は維持する
- フィールドIDの重複を避ける（`at_`, `ik_` などプレフィックス推奨）
