# ケース記録チE��プレート構造ガイチE
## 概要E
ケース記録フォームは、�E利用老E�E通�E頁E��と、利用老E��有�E頁E��を�E離した2層構造になってぁE��す、E
## アーキチE��チャ

### 1. フィールド�E刁E��E
```typescript
type FieldConfiguration = {
  commonFields: TemplateField[]      // 全利用老E�E通フィールチE  individualFields: TemplateField[]  // 利用老E��有フィールチE}
```

#### commonFields�E��E通フィールド！E現在は空配�E。封E��皁E��全利用老E��共通するカスタムフィールドがあれば、ここに追加します、E
**注愁E*: 以下�E別コンポ�Eネントで既に実裁E��れてぁE��す！E- 日付�E時間 ↁE`HeaderFields`
- スタチE��選抁EↁE`StaffSelector`
- 特記事頁E�E家族連絡 ↁE`NotesSection`

#### individualFields�E�個別フィールド！E利用老E��とに異なるカスタムフィールド。`userId`に基づぁE��動的に読み込みます、E
**現在サポ�EチE*:
- `AT` ↁE`lib/templates/at-template.ts` (11個�EカスタムフィールチE

**封E��追加可能**:
- `IK` ↁE`lib/templates/ik-template.ts`
- `OS` ↁE`lib/templates/os-template.ts`
- など

### 2. ファイル構�E

```
lib/templates/
├── field-config.ts          # フィールド構�Eの管琁E��新規追加�E�E├── getTemplate.ts           # チE��プレート取得関数�E�Eield-configを使用�E�E├── at-template.ts           # ATさん専用フィールド定義
├── schema.ts                # 型定義
└── categories.ts            # カチE��リ定義
```

### 3. チE�Eタフロー

```
userId (侁E "AT")
  ↁEgetTemplate(userId)
  ↁEgetFieldConfiguration(userId)
  ├─ commonFields: []
  └─ individualFields: AT_TEMPLATE_FIELDS (from at-template.ts)
  ↁEmergeFields(config)
  ↁECareReceiverTemplate {
  careReceiverId: "AT",
  name: "A・T 専用チE��プレーチE,
  customFields: [...11個�Eフィールド]
}
  ↁECaseRecordFormClient
  ↁECaseRecordForm
  ↁETemplateFieldsSection (個別フィールドをレンダリング)
```

## 新しい利用老E��追加する方況E
### Step 1: チE��プレートファイル作�E

`lib/templates/ik-template.ts` を作�E:

```typescript
import { TemplateField } from "./schema"
import { CareCategory } from "./categories"

export const IK_TEMPLATE_FIELDS: TemplateField[] = [
  {
    id: "ik_custom_field_1",
    label: "I・Kさん専用頁E��1",
    category: CareCategory.ACTIVITY,
    type: "textarea",
    required: false,
    placeholder: "記録冁E��を�E劁E,
    order: 0,
  },
  // ... 他�EフィールチE]
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

### Step 3: 動作確誁E
1. `/services/life-care/users/IK/case-records` にアクセス
2. I・Kさん専用フィールドが表示されることを確誁E3. 保存して Supabase の `payload.custom` に保存されることを確誁E
## 既存�Epayload構造�E�維持E��E
保存時のJSONペイロード構造は変更なぁE

```json
{
  "userId": "AT",
  "serviceId": "life-care",
  "recordDate": "2026-01-08",
  "recordTime": "14:30",
  "mainStaffId": "staff-1",
  "subStaffIds": ["staff-2"],
  "payload": {
    "specialNotes": "特記事頁E,
    "familyNotes": "家族連絡",
    "custom": {
      "at_stretch_massage": "10刁E��施",
      "at_challenge1_details": "着座訓練"
      // ... 他�EカスタムフィールチE    }
  }
}
```

## コンポ�Eネント�E役割刁E��

### CaseRecordFormClient
- チE��プレート取征E- API送信処琁E- 保存状態�E表示

### CaseRecordForm
- フォーム全体�E構造
- 共通セクション (Header, Staff, Notes)
- 個別フィールドセクション (TemplateFieldsSection)

### TemplateFieldsSection
- `templateFields` を受け取りレンダリング
- `commonFields` + `individualFields` の区別は不要E���Eージ済み�E�E
## 封E��の拡張可能性

### 共通フィールド�E追加侁E
全利用老E��「体調」フィールドを追加する場吁E

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
      { value: "normal", label: "普送E },
      { value: "poor", label: "不調" },
    ],
    required: true,
    order: 0,
  },
]
```

これにより、�E利用老E�Eケース記録に「体調」フィールドが表示されます、E
## 制紁E��頁E
- API / Supabase のスキーマ�E変更しなぁE- UIの見た目は変更しなぁE- 既存�EATさんの動作�E維持すめE- フィールドIDの重褁E��避ける�E�Eat_`, `ik_` などプレフィチE��ス推奨�E�E
