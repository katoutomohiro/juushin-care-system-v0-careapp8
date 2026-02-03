# Records API 設計進化提案
## 「分析・可視化前提の設計」への移行ロードマップ

**作成日**: 2026-01-30  
**スコープ**: case_records テーブルの JSON `record_data` 構造の正規化検討  
**目的**: AI による後進的な解析と医療・福祉現場での実運用を両立させる  
**前提**: コード変更なし、提案・設計コメントのみ

---

## 1. 現状分析

### 1.1 現在の構造

**データベース層** (`app/api/case-records/save/route.ts`)：
```typescript
// 現状: 自由形式の JSON オブジェクト
record_data: any  // 任意のキー・値の組み合わせ

// 内部で sections.staff が同期される
recordData.sections.staff = {
  mainStaffId: normalizedMainStaffId,
  subStaffIds: normalizedSubStaffId ? [normalizedSubStaffId] : [],
}
```

**スキーマ定義** (`schemas/unified.ts`)：
- `UnifiedRecord` は `time`, `notes`, `vitals`, `seizure`, `pee`, `poo` のみ
- `seizure` は軽量構造（type, duration, response）
- `vitals` は定型項目（heartRate, temperature, oxygenSaturation）
- **問題**: 排泄、睡眠、食事・水分は時系列データとして正規化されていない

**フロントエンド** (`src/components/case-records/CaseRecordForm.tsx`)：
- カスタムテンプレート形式で `custom?: TemplateFormValues` を扱う
- タイムシリーズ的な複数イベントの扱いが不明確
- `staffOptions` と `allStaff` の同期方式が曖昧

---

## 2. 問題点と制約の整理

### 2.1 分析・可視化の観点での問題

| 観点 | 現状 | 問題 |
|------|------|------|
| **発作記録** | `seizure` オブジェクト単一 | 複数発作イベントの扱いが不明。配列化が必要か？ |
| **排泄** | `pee: boolean`, `poo: boolean` | 時刻情報がない。量・性状のような詳細が記録されない。 |
| **睡眠** | テンプレート `custom` に含まれる | 開始時刻・終了時刻・品質が不整理。時系列グラフ化困難。 |
| **食事・水分** | `unified.ts` の `nutrition/hydration` カテゴリのみ | 量・種類・時刻の組み合わせが曖昧。栄養管理に使えない。 |
| **医師への報告** | A4 記録シート用に日ごと圧縮 | 詳細な時系列は失われている。後からの分析に使えない。 |
| **AI 解析** | 自由形式の `record_data` | スキーマ不明。LLM に与えられない。構造化必須。 |

### 2.2 医療・福祉現場の実運用要件

1. **リアルタイム入力**: 多くの記録は当日中に手書きまたはスマートフォンで入力される
2. **複数情報源**: 看護師、介護職、家族が異なる時刻に異なる項目を入力
3. **修正と追加**: 夜間の事象を翌朝に記録することも多い
4. **月次レポート**: 月のまとめで発作頻度や食事摂取量傾向を集計する
5. **医師・家族への説明**: グラフや表での可視化が重要

### 2.3 現在の API 統合状況

| エンドポイント | 状態 | 備考 |
|---|---|---|
| `POST /api/case-records/save` | ✅ 実装済み | service/care-receiver lookup, optimistic locking 搭載 |
| `GET /api/case-records` | ✅ 実装済み | serviceId, careReceiverId 必須、pagination 対応 |
| `GET /api/case-records/list` | ✅ 実装済み | staff 関連情報 join, date range 対応 |
| 分析用エンドポイント | ❌ 未実装 | タイムシリーズデータの集計・フィルタなし |

---

## 3. 正規化提案（実装なし、設計のみ）

### 3.1 提案スキーマ：タイムシリーズイベント構造

以下は `record_data.events` 配列として時系列イベントを格納する構想です。

```typescript
/**
 * 提案: record_data の正規化構造
 * 
 * 将来実装時の参考案
 */

// ============================================
// 1. 発作イベント（複数化）
// ============================================
type SeizureEvent = {
  event_type: "seizure"
  occurred_at: string  // ISO 8601, "2026-01-30T14:35:00Z"
  seizure_type: "強直間代" | "ミオクロニー" | "ピク付き" | "上視線" | "欠神" | "不明"
  duration_sec: number  // 秒（0-36000）
  severity: "mild" | "moderate" | "severe"  // NEW: 重症度
  response_taken: string[]  // ["吸引", "投薬", "体位変換", "見守り"]
  notes?: string
  recorded_by_staff_id: string  // 誰が記録したか
  recorded_at: string  // 記録時刻（event の発生時刻と異なる可能性）
}

// ============================================
// 2. 排泄イベント（時刻・詳細付き）
// ============================================
type ExcretionEvent = {
  event_type: "excretion"
  occurred_at: string  // ISO 8601
  excretion_type: "urine" | "feces"  // 尿・便
  
  // 尿の場合
  urine?: {
    amount?: "少" | "中" | "多" | number  // ml単位もサポート
    color?: "無色" | "淡黄" | "黄" | "褐色"
    clarity?: "透明" | "混濁"
    odor?: boolean
  }
  
  // 便の場合
  feces?: {
    amount?: "少" | "中" | "多"
    consistency?: "硬い" | "普通" | "軟便" | "下痢"
    color?: string
    blood?: boolean
  }
  
  pad_changed?: boolean  // オムツ交換の有無
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 3. 睡眠イベント（開始・終了ペア）
// ============================================
type SleepEvent = {
  event_type: "sleep"
  started_at: string  // ISO 8601, 就寝時刻
  ended_at?: string   // 起床時刻（記録時点では null の可能性）
  duration_min?: number  // 計算値：分
  
  quality?: "poor" | "fair" | "good"  // 睡眠の質
  disturbances?: string[]  // ["夜間覚醒", "寝言", "いびき", "夜尿"]
  
  // 環境情報
  room_temperature?: number  // 摂氏
  room_humidity?: number  // %
  position?: "仰向け" | "横向き左" | "横向き右" | "うつぶせ"  // 最終位置
  
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 4. 食事・水分イベント
// ============================================
type NutritionEvent = {
  event_type: "nutrition" | "hydration"
  occurred_at: string  // ISO 8601
  
  // 食事
  meal?: {
    meal_type: "朝食" | "昼食" | "夕食" | "間食" | "栄養補助食"
    items?: string[]  // ["おかゆ", "味噌汁", "玉子焼き"]
    
    intake_rate?: 0 | 25 | 50 | 75 | 100  // % 摂取率
    consistency?: "普通食" | "刻み食" | "ミキサー食" | "ペースト食" | "ゼリー"
    assistance?: "自食" | "一部介助" | "全介助"
    
    residue?: "なし" | "少量" | "多量"  // 食べ残し
    notes?: string
  }
  
  // 水分（飲水）
  hydration?: {
    fluid_type: "水" | "牛乳" | "ジュース" | "スポーツドリンク" | "その他"
    amount_ml: number
    temperature?: "冷" | "常温" | "温"
    assistance?: "自飲" | "介助飲水" | "経管栄養"
    residue_ml?: number
    notes?: string
  }
  
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 5. バイタル記録（複数時点対応）
// ============================================
type VitalEvent = {
  event_type: "vitals"
  measured_at: string  // ISO 8601, 計測時刻
  
  heart_rate?: number  // bpm
  blood_pressure?: { systolic: number; diastolic: number }  // mmHg
  temperature?: number  // 摂氏
  respiratory_rate?: number  // 回/分
  oxygen_saturation?: number  // % (SpO2)
  
  measurement_site?: "指" | "耳" | "額" | "腋窩" | "直腸"  // 計測部位
  measurement_method?: "自動" | "手動"
  device_id?: string  // 計測機器 ID
  
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 6. 医療・ケアイベント（汎用）
// ============================================
type CareEvent = {
  event_type: "care" | "medical" | "medication"
  occurred_at: string
  
  action: string  // "吸引", "体位変換", "スキンケア", "投薬" など
  details?: Record<string, any>  // 詳細は action に応じて
  
  // 投薬の場合
  medication?: {
    name: string
    dosage: string
    route: "oral" | "intravenous" | "inhalation" | "topical" | "other"
    given_by_staff_id: string
  }
  
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 7. コンテナ構造：record_data の新しい形
// ============================================
type RecordDataV2 = {
  version: 2  // 新バージョン識別子
  
  // ヘッダー情報
  header: {
    service_id: string
    care_receiver_id: string
    record_date: string  // YYYY-MM-DD
    main_staff_id: string
    sub_staff_ids?: string[]
    created_at: string
    updated_at: string
  }
  
  // 時系列イベント配列（全て occurred_at でソート可能）
  events: (
    SeizureEvent
    | ExcretionEvent
    | SleepEvent
    | NutritionEvent
    | VitalEvent
    | CareEvent
  )[]
  
  // 日付単位の集約（キャッシュ目的）
  summary?: {
    seizure_count: number
    seizure_total_duration_min: number
    meals_completed: number
    hydration_total_ml: number
    sleep_duration_min: number
    notes: string
  }
  
  // 自由形式フィールド（後方互換性）
  custom_fields?: TemplateFormValues
  
  // 添付ファイル
  attachments?: Array<{
    id: string
    type: "photo" | "pdf" | "audio"
    uri: string
    caption?: string
    timestamp: string
  }>
}
```

---

## 4. 段階的な移行案（実装予定なし、参考のみ）

### フェーズ 1（現在）: 共存期間
- `record_data` の新しい構造を採用し始める
- `events` 配列で時系列イベントを格納
- 既存の `custom_fields` は並行保持
- API GET レスポンスは両形式を返す

### フェーズ 2：API の集計機能追加
```typescript
// 将来のエンドポイント例（検討案）
GET /api/case-records/analytics?
  careReceiverId=xxx
  &dateFrom=2026-01-01
  &dateTo=2026-01-31
  &metric=seizure_frequency,meal_intake,sleep_quality

// レスポンス例
{
  ok: true,
  analytics: {
    seizure: {
      count: 7,
      avg_duration_sec: 45,
      types: { "強直間代": 5, "ピク付き": 2 },
      daily: [
        { date: "2026-01-01", count: 1, total_duration: 120 },
        // ...
      ]
    },
    meal: {
      completion_rate: 0.85,
      daily: [ ... ]
    },
    sleep: {
      avg_duration_min: 420,
      quality_distribution: { poor: 0, fair: 5, good: 10 },
      daily: [ ... ]
    }
  }
}
```

### フェーズ 3：AI 解析連携
- 時系列イベントを Vercel AI SDK に feed
- Claude/GPT で自動サマリー生成
- 医師への定期レポート自動化
- 異常検知アラート

---

## 5. AI による解析の観点から見た設計評価

### 5.1 現状設計の AI 解析可能性：**低い** ⚠️

| 項目 | 評価 | 理由 |
|------|------|------|
| **構造明確性** | ⚠️ 低 | JSON スキーマ無し、自由形式。LLM には context 依存。 |
| **時系列性** | ❌ 不可 | 複数イベントの時刻順序が定義されていない。 |
| **量的分析** | ⚠️ 限定的 | 排泄・睡眠の量的データが不足。統計分析困難。 |
| **因果関係** | ❌ 困難 | イベント間の関連（例：薬投与 → 発作頻度低下）を追跡困難。 |
| **自動化レベル** | ⚠️ 低 | テンプレート形式なので、完全な自動化は困難。 |

### 5.2 提案設計の AI 解析可能性：**高い** ✅

| 項目 | 評価 | 理由 |
|------|------|------|
| **構造明確性** | ✅ 高 | Zod スキーマで型定義。LLM に prompt context として使用可能。 |
| **時系列性** | ✅ 高 | `event_type + occurred_at` で全イベント順序付け可能。 |
| **量的分析** | ✅ 高 | 発作秒数、食事摂取率、睡眠時間など定量データ豊富。 |
| **因果関係** | ✅ 可能 | イベント間の時間距離を計算。傾向分析が容易。 |
| **自動化レベル** | ✅ 高 | Zod validation + JSON schema で完全自動化可能。 |

---

## 6. 実装検討時の注意点

### 6.1 後方互換性
- 現在の `record_data` はフロントエンド・フォームで直接操作されている
- マイグレーション戦略が必須（古いレコード + 新しいイベント形式の並行運用）
- API レスポンスの形状変更は慎重に（クライアント側のアップデート必須）

### 6.2 Supabase RLS との連携
- `record_data` は JSONB 型で一度に丸ごと保存される
- イベント単位での RLS 制御は困難
- 行レベル権限は `service_id` + `care_receiver_id` のままとする

### 6.3 テスト戦略
1. 現在の形式でのレコード読み取りテスト
2. 新形式へのマイグレーション スクリプト検証
3. 古い形式と新形式の混在時の API 応答テスト
4. AI 解析用エンドポイントの精度テスト

### 6.4 フロントエンド影響度
- `CaseRecordForm` は日単位で 1 レコード保存
- 時系列イベント形式への変更には UI 改修が大規模
- 段階的な機能追加（例：朝・昼・夜の複数入力）の方が現実的

---

## 7. 参考実装上の細かいポイント

### 7.1 タイムゾーン
- すべての時刻を ISO 8601 UTC で統一
- クライアント側でローカルタイムゾーン変換
- `occurred_at` と `recorded_at` を区別（事象の時刻 vs. 記録時刻）

### 7.2 権限と監査
```typescript
// 将来スキーマ
{
  recorded_by_staff_id: string,  // 誰が記録したか
  recorded_at: string,           // いつ記録したか
  
  edited_by_staff_id?: string,   // 誰が修正したか（あれば）
  edited_at?: string,            // いつ修正したか（あれば）
  
  edit_reason?: string           // 修正理由
}
```

### 7.3 量的データの単位統一
- 時間：秒（`duration_sec`）、分（`duration_min`）で統一
- 液体：ml で統一
- 温度：摂氏で統一
- 圧力：mmHg で統一

---

## 8. 現在のコードとの関連性

### API ルートへの影響
- **`app/api/case-records/save/route.ts`**
  - `record_data` の入力形式が多様化（新・旧混在）
  - バリデーション層の強化が必須
  - 正規化ロジック（例：時刻を ISO 8601 に）の追加

- **`app/api/case-records/route.ts`** / **`list/route.ts`**
  - イベント単位での抽出・フィルタリング対応
  - 集計関数の追加（発作数カウント等）
  - ページネーション ロジックの見直し（イベント単位 vs. レコード単位）

### スキーマの影響
- **`schemas/unified.ts`**
  - `UnifiedRecord` → `UnifiedEventArray` への拡張
  - `UnifiedEntry` → `RecordDataV2` への進化
  - Zod validation の複雑化

### フロントエンド の影響
- **`src/components/case-records/CaseRecordForm.tsx`**
  - 時系列イベント入力 UI の設計（重要）
  - 既存の `custom_fields` との共存期間の設計

---

## 9. まとめと提言

### 現状評価
✅ **完成度**: Records API の基本的な保存・取得機能は実装済み  
⚠️ **分析性**: 医療統計・可視化には構造が不十分  
❌ **AI 連携**: 現状の自由形式では LLM への feed が困難  

### 推奨する次のステップ（優先順）
1. **短期**: 現在の `record_data` 構造をドキュメント化（何が入るか明確化）
2. **中期**: 発作・排泄など重要項目の時系列化（イベント配列化）
3. **中期**: API に集計エンドポイント追加（月間レポート用）
4. **長期**: AI 解析エンドポイント実装（Vercel AI SDK 連携）
5. **長期**: フロントエンド UI の刷新（複数時刻入力対応）

### 医療・福祉現場での実運用性
- 現状設計でも **日々の記録入力は十分可能**
- **月間レポート作成の自動化** には新構造が有効
- **医師への説明資料生成** には AI 解析が有効
- 段階的な改善が現実的（一度に全部変えない）

---

**このドキュメントは設計検討用です。実装は別途決定・承認してください。**

