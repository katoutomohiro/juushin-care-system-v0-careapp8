# ケース記録テンプレート 拡張ガイド

## 概要

このディレクトリには、利用者ごとのケース記録フォームをカスタマイズするためのテンプレートファイルが格納されています。

## ファイル構成

```
lib/templates/
├── README.md                 # このファイル（拡張ガイド）
├── field-config.ts           # テンプレート選択ロジック（中央管理）
├── at-template.ts            # ATさん専用フィールド定義
├── test-user-template.ts     # テストユーザー用フィールド定義（サンプル）
├── schema.ts                 # フィールドの型定義
├── categories.ts             # カテゴリー定義
└── getTemplate.ts            # テンプレート生成処理
```

## 設計思想：2層アーキテクチャ

### 1. 共通フィールド (commonFields)

**目的**: 全利用者に共通で必要なフィールド  
**現状**: 空配列 `[]`（将来の拡張に備えた構造）

**補足**:
- 日付・時刻・スタッフ・特記事項・家族連絡は、`HeaderFields` と `NotesSection` コンポーネントで別途レンダリングされるため、ここには含まれません
- 将来、全員に共通の項目（例: 体温、気温など）を追加する場合は `COMMON_FIELDS` 配列に定義します

### 2. 個別フィールド (individualFields)

**目的**: 利用者ごとの特性に応じたカスタムフィールド  
**実装**: `field-config.ts` の switch文で userId から対応するテンプレートを選択

**例**:
- ATさん → 11個のフィールド（ストレッチ、マッサージ、チャレンジなど）
- TESTUSER01 → 3個のフィールド（姿勢、緊張度、反応）

---

## 新しい利用者を追加する手順（3ステップ）

### ステップ1: テンプレートファイルを作成

`lib/templates/` ディレクトリに新しいファイルを作成します。

**ファイル名規則**: `{userId小文字}-template.ts`  
**例**: `ik-template.ts`, `os-template.ts`

**テンプレート**:
```typescript
import { TemplateField } from "./schema"
import { CATEGORIES } from "./categories"

/**
 * {利用者名}さん専用フィールド定義
 */
export const {USER_ID}_TEMPLATE_FIELDS: TemplateField[] = [
  {
    key: "{userId}_{field_name}",        // 例: "ik_posture"
    label: "ラベル名",                    // 例: "姿勢"
    type: "select",                       // "select" | "textarea" | "number" など
    category: CATEGORIES.ACTIVITY,        // カテゴリー（schema.tsのCATEGORIES参照）
    required: false,                      // 必須かどうか
    options: [                            // selectの場合のみ
      { value: "sitting", label: "座位" },
      { value: "standing", label: "立位" },
    ],
  },
  // 他のフィールドを追加...
]
```

**参考ファイル**:
- **多くのフィールドが必要な場合**: [at-template.ts](at-template.ts)（11フィールド）
- **シンプルな構成の場合**: [test-user-template.ts](test-user-template.ts)（3フィールド）

### ステップ2: field-config.ts に登録

`lib/templates/field-config.ts` の `getIndividualFields()` 関数の switch文に追加します。

**場所**: 約50行目の switch ブロック

```typescript
function getIndividualFields(userId: string): TemplateField[] {
  switch (userId) {
    case "AT":
      return require("./at-template").AT_TEMPLATE_FIELDS
    
    case "TESTUSER01":
      return require("./test-user-template").TEST_USER_01_TEMPLATE_FIELDS
    
    // ↓↓↓ ここに追加 ↓↓↓
    case "IK":
      return require("./ik-template").IK_TEMPLATE_FIELDS
    
    default:
      return []
  }
}
```

**注意**: 
- `case` の値は**正規化後のユーザーID**（大文字・記号なし）を使用してください
- 例: "I・K" → "IK", "O・S" → "OS", "TEST_USER_01" → "TESTUSER01"
- 正規化処理は `lib/ids/normalizeUserId.ts` で実行されます

### ステップ3: ユーザー一覧に追加

`app/services/[serviceId]/page.tsx` の `userDetails` オブジェクトに利用者情報を追加します。

**場所**: 約200-250行目

```typescript
const userDetails: Record<string, UserDetail> = {
  // ...既存の利用者...
  
  "I・K": {
    age: 25,
    gender: "男性",
    careLevel: "ケアレベル",
    condition: "状態説明",
  },
}
```

**注意**: キーには**正規化前の表記**（・などの記号を含む）を使用してください。

---

## 命名規則

### 1. ユーザーID

| 種類 | 規則 | 例 |
|------|------|-----|
| **表示用** | 中黒（・）などの記号を含む | "A・T", "I・K", "TEST_USER_01" |
| **内部用** | 大文字・記号なし（正規化後） | "AT", "IK", "TESTUSER01" |

**正規化ルール**（自動処理）:
- 記号除去: `・･.\s　-` を削除
- 大文字変換: すべて大文字に統一
- 実装: `lib/ids/normalizeUserId.ts`

### 2. フィールドキー

**規則**: `{userId}_{field_name}`  
**例**:
- ATさんのストレッチ → `at_stretch`
- IKさんの姿勢 → `ik_posture`
- OSさんの食事量 → `os_meal_amount`

**なぜこの規則か**:
- データベースの `payload.custom` オブジェクトでキー衝突を防ぐため
- 利用者IDがプレフィックスとして付くことで、データ構造が明確になる

### 3. 定数名（エクスポート）

**規則**: `{USER_ID大文字}_TEMPLATE_FIELDS`  
**例**:
- `AT_TEMPLATE_FIELDS`
- `IK_TEMPLATE_FIELDS`
- `TEST_USER_01_TEMPLATE_FIELDS`

---

## フィールド型（type）の選択肢

以下の型が利用可能です（詳細は [schema.ts](schema.ts) を参照）:

| type | 説明 | 例 |
|------|------|-----|
| `select` | ドロップダウン選択 | 姿勢（座位/立位/臥位） |
| `textarea` | 複数行テキスト | 活動内容の詳細記述 |
| `number` | 数値入力 | 回数、時間 |
| `text` | 1行テキスト | 短い備考 |
| `checkbox` | チェックボックス | 実施有無 |

**選択のヒント**:
- 定型的な内容 → `select`（後でデータ分析しやすい）
- 自由記述が必要 → `textarea`
- 測定値 → `number`

---

## カテゴリー（category）の選択肢

フィールドは以下のカテゴリーに分類されます（[categories.ts](categories.ts) で定義）:

| カテゴリー | 説明 | 例 |
|-----------|------|-----|
| `ACTIVITY` | 活動・運動 | ストレッチ、散歩、遊び |
| `VITAL` | バイタル・健康 | 体温、血圧、様子 |
| `MEAL` | 食事・水分 | 食事量、水分量 |
| `EXCRETION` | 排泄 | 排便、排尿 |
| `COMMUNICATION` | コミュニケーション | 発語、表情、反応 |
| `CARE` | ケア・介助 | 入浴、着替え、姿勢交換 |
| `MEDICAL` | 医療処置 | 服薬、吸引、リハビリ |
| `OTHER` | その他 | 上記に当てはまらない項目 |

**注意**: カテゴリーは現在 UI での並び順や将来のフィルタリングに使われる可能性があります。適切な分類を選んでください。

---

## データ保存の仕組み

### データベース構造

```sql
CREATE TABLE case_records (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  record_date DATE NOT NULL,
  payload JSONB NOT NULL,
  -- ...
);
```

### payload の構造

```json
{
  "recordTime": "14:30",
  "mainStaffId": "staff-1",
  "subStaffIds": [],
  "specialNotes": "特記事項",
  "familyNotes": "家族連絡",
  "custom": {
    "at_stretch": "upper",
    "at_massage": "none",
    "ik_posture": "sitting",
    "ik_tension": "relaxed"
  }
}
```

**ポイント**:
- 個別フィールドの値は `payload.custom` に `{userId}_{field_name}` キーで保存される
- `select` 型のフィールドは `options[].value` が保存される
- `textarea` 型のフィールドは入力テキストがそのまま保存される

---

## よくある質問（FAQ）

### Q1: ATさんのフィールドを変更したい

**A**: `lib/templates/at-template.ts` を編集してください。既存の `AT_TEMPLATE_FIELDS` 配列にフィールドを追加/削除/修正できます。

### Q2: 全利用者に共通のフィールドを追加したい

**A**: `lib/templates/field-config.ts` の `COMMON_FIELDS` 配列にフィールドを追加してください。すべての利用者のフォームに自動で表示されます。

### Q3: userId の正規化ルールを変更したい

**A**: `lib/ids/normalizeUserId.ts` を編集してください。ただし、既存データとの互換性に注意が必要です。

### Q4: 新しいフィールド型（例: date, time）を追加したい

**A**: 以下の手順が必要です（エンジニア向け）:
1. `lib/templates/schema.ts` の `FieldType` に型を追加
2. `src/components/case-records/CaseRecordFormClient.tsx` でレンダリングロジックを実装
3. バリデーションロジックの追加

### Q5: フィールドの順序を変えたい

**A**: テンプレートファイル（例: `at-template.ts`）内の配列の順序を変更してください。配列の順番がそのままフォームの表示順になります。

### Q6: 既存の利用者のテンプレートを削除したい

**A**: 以下の手順で削除できます:
1. テンプレートファイル（例: `test-user-template.ts`）を削除
2. `field-config.ts` の switch から該当の case を削除
3. `app/services/[serviceId]/page.tsx` の userDetails から削除

**注意**: データベースの既存レコードは削除されません。削除前にバックアップを推奨します。

---

## トラブルシューティング

### エラー: "テンプレートが見つかりません"

**原因**: field-config.ts の case で使用しているユーザーIDが正規化後の値と一致していない

**解決策**:
1. ブラウザの Console で正規化後のユーザーIDを確認
2. field-config.ts の case を正規化後の値に修正

**例**:
```typescript
// ❌ 間違い
case "I・K":  // 正規化前の表記

// ✅ 正しい
case "IK":    // 正規化後（記号除去・大文字）
```

### エラー: フィールドが表示されない

**チェックリスト**:
- [ ] テンプレートファイルが正しくエクスポートされているか
- [ ] field-config.ts に case が追加されているか
- [ ] ファイル名とrequire()のパスが一致しているか
- [ ] ブラウザの Console にエラーが出ていないか

### エラー: 保存できない

**チェックリスト**:
- [ ] フィールドキーが `{userId}_{field_name}` 形式か
- [ ] required: true のフィールドが入力されているか
- [ ] Supabase の環境変数が設定されているか
- [ ] Network タブで API のレスポンスを確認

---

## 参考ドキュメント

- **検証手順**: [docs/template-expansion-verification.md](../../docs/template-expansion-verification.md)
- **テンプレート構造**: [docs/case-records-template-structure.md](../../docs/case-records-template-structure.md)
- **保存処理の検証**: [docs/case-records-save-verification.md](../../docs/case-records-save-verification.md)
- **AI協調開発**: [docs/ai-collaboration-handbook.md](../../docs/ai-collaboration-handbook.md)

---

## 更新履歴

- **2026-01-08**: 初版作成（テンプレート横展開機能の実装完了に伴う）
