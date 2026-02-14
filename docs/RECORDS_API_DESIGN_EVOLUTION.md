# Records API 設計進化提桁E## 「�E析�E可視化前提の設計」への移行ロード�EチE�E

**作�E日**: 2026-01-30  
**スコーチE*: case_records チE�Eブルの JSON `record_data` 構造の正規化検訁E 
**目皁E*: AI による後進皁E��解析と医療�E福祉現場での実運用を両立させる  
**前提**: コード変更なし、提案�E設計コメント�Eみ

---

## 1. 現状刁E��

### 1.1 現在の構造

**チE�Eタベ�Eス層** (`app/api/case-records/save/route.ts`)�E�E```typescript
// 現状: 自由形式�E JSON オブジェクチErecord_data: any  // 任意�Eキー・値の絁E��合わぁE
// 冁E��で sections.staff が同期される
recordData.sections.staff = {
  mainStaffId: normalizedMainStaffId,
  subStaffIds: normalizedSubStaffId ? [normalizedSubStaffId] : [],
}
```

**スキーマ定義** (`schemas/unified.ts`)�E�E- `UnifiedRecord` は `time`, `notes`, `vitals`, `seizure`, `pee`, `poo` のみ
- `seizure` は軽量構造�E�Eype, duration, response�E�E- `vitals` は定型頁E���E�EeartRate, temperature, oxygenSaturation�E�E- **問顁E*: 排況E��睡眠、E��事�E水刁E�E時系列データとして正規化されてぁE��ぁE
**フロントエンチE* (`src/components/case-records/CaseRecordForm.tsx`)�E�E- カスタムチE��プレート形式で `custom?: TemplateFormValues` を扱ぁE- タイムシリーズ皁E��褁E��イベント�E扱ぁE��不�E確
- `staffOptions` と `allStaff` の同期方式が曖昧

---

## 2. 問題点と制紁E�E整琁E
### 2.1 刁E��・可視化の観点での問顁E
| 観点 | 現状 | 問顁E|
|------|------|------|
| **発作記録** | `seizure` オブジェクト単一 | 褁E��発作イベント�E扱ぁE��不�E。�E列化が忁E��か�E�E|
| **排況E* | `pee: boolean`, `poo: boolean` | 時刻惁E��がなぁE��量・性状のような詳細が記録されなぁE��E|
| **睡眠** | チE��プレーチE`custom` に含まれる | 開始時刻・終亁E��刻・品質が不整琁E��時系列グラフ化困難、E|
| **食事�E水刁E* | `unified.ts` の `nutrition/hydration` カチE��リのみ | 量�E種類�E時刻の絁E��合わせが曖昧。栁E��管琁E��使えなぁE��E|
| **医師への報呁E* | A4 記録シート用に日ごと圧縮 | 詳細な時系列�E失われてぁE��。後から�E刁E��に使えなぁE��E|
| **AI 解极E* | 自由形式�E `record_data` | スキーマ不�E、ELM に与えられなぁE��構造化忁E��、E|

### 2.2 医療�E福祉現場の実運用要件

1. **リアルタイム入劁E*: 多くの記録は当日中に手書きまた�Eスマ�Eトフォンで入力される
2. **褁E��惁E��溁E*: 看護師、介護職、家族が異なる時刻に異なる頁E��を�E劁E3. **修正と追加**: 夜間の事象を翌朝に記録することも多い
4. **月次レポ�EチE*: 月�Eまとめで発作頻度めE��事摂取量傾向を雁E��すめE5. **医師・家族への説昁E*: グラフや表での可視化が重要E
### 2.3 現在の API 統合状況E
| エンド�EインチE| 状慁E| 備老E|
|---|---|---|
| `POST /api/case-records/save` | ✁E実裁E��み | service/care-receiver lookup, optimistic locking 搭輁E|
| `GET /api/case-records` | ✁E実裁E��み | serviceId, careReceiverId 忁E��、pagination 対忁E|
| `GET /api/case-records/list` | ✁E実裁E��み | staff 関連惁E�� join, date range 対忁E|
| 刁E��用エンド�EインチE| ❁E未実裁E| タイムシリーズチE�Eタの雁E���EフィルタなぁE|

---

## 3. 正規化提案（実裁E��し、設計�Eみ�E�E
### 3.1 提案スキーマ：タイムシリーズイベント構造

以下�E `record_data.events` 配�Eとして時系列イベントを格納する構想です、E
```typescript
/**
 * 提桁E record_data の正規化構造
 * 
 * 封E��実裁E��の参老E��E */

// ============================================
// 1. 発作イベント（褁E��化！E// ============================================
type SeizureEvent = {
  event_type: "seizure"
  occurred_at: string  // ISO 8601, "2026-01-30T14:35:00Z"
  seizure_type: "強直間代" | "ミオクロニ�E" | "ピク付き" | "上視緁E | "欠祁E | "不�E"
  duration_sec: number  // 秒！E-36000�E�E  severity: "mild" | "moderate" | "severe"  // NEW: 重症度
  response_taken: string[]  // ["吸弁E, "投薬", "体位変換", "見守り"]
  notes?: string
  recorded_by_staff_id: string  // 誰が記録したぁE  recorded_at: string  // 記録時刻�E�Event の発生時刻と異なる可能性�E�E}

// ============================================
// 2. 排況E��ベント（時刻・詳細付き�E�E// ============================================
type ExcretionEvent = {
  event_type: "excretion"
  occurred_at: string  // ISO 8601
  excretion_type: "urine" | "feces"  // 尿・便
  
  // 尿の場吁E  urine?: {
    amount?: "封E | "中" | "夁E | number  // ml単位もサポ�EチE    color?: "無色" | "淡黁E | "黁E | "褐色"
    clarity?: "透�E" | "混濁E
    odor?: boolean
  }
  
  // 便の場吁E  feces?: {
    amount?: "封E | "中" | "夁E
    consistency?: "硬ぁE | "普送E | "軟便" | "下痢"
    color?: string
    blood?: boolean
  }
  
  pad_changed?: boolean  // オムチE��換�E有無
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 3. 睡眠イベント（開始�E終亁E�Eア�E�E// ============================================
type SleepEvent = {
  event_type: "sleep"
  started_at: string  // ISO 8601, 就寝時刻
  ended_at?: string   // 起床時刻�E�記録時点では null の可能性�E�E  duration_min?: number  // 計算値�E��E
  
  quality?: "poor" | "fair" | "good"  // 睡眠の質
  disturbances?: string[]  // ["夜間覚�E", "寝言", "ぁE�EぁE, "夜尿"]
  
  // 環墁E��報
  room_temperature?: number  // 摂氁E  room_humidity?: number  // %
  position?: "仰向け" | "横向き左" | "横向き右" | "ぁE��ぶぁE  // 最終位置
  
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 4. 食事�E水刁E��ベンチE// ============================================
type NutritionEvent = {
  event_type: "nutrition" | "hydration"
  occurred_at: string  // ISO 8601
  
  // 食亁E  meal?: {
    meal_type: "朝飁E | "昼飁E | "夕飁E | "間飁E | "栁E��補助飁E
    items?: string[]  // ["おかめE, "味噌汁E, "玉子焼ぁE]
    
    intake_rate?: 0 | 25 | 50 | 75 | 100  // % 摂取玁E    consistency?: "普通飁E | "刻み飁E | "ミキサー飁E | "ペ�Eスト飁E | "ゼリー"
    assistance?: "自飁E | "一部介助" | "全介助"
    
    residue?: "なぁE | "少量" | "多量"  // 食べ残し
    notes?: string
  }
  
  // 水刁E��飲水�E�E  hydration?: {
    fluid_type: "水" | "牛乳" | "ジュース" | "スポ�EチE��リンク" | "そ�E仁E
    amount_ml: number
    temperature?: "冷" | "常温" | "温"
    assistance?: "自飲" | "介助飲水" | "経管栁E��E
    residue_ml?: number
    notes?: string
  }
  
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 5. バイタル記録�E�褁E��時点対応！E// ============================================
type VitalEvent = {
  event_type: "vitals"
  measured_at: string  // ISO 8601, 計測時刻
  
  heart_rate?: number  // bpm
  blood_pressure?: { systolic: number; diastolic: number }  // mmHg
  temperature?: number  // 摂氁E  respiratory_rate?: number  // 囁E刁E  oxygen_saturation?: number  // % (SpO2)
  
  measurement_site?: "持E | "耳" | "顁E | "腋窩" | "直腸"  // 計測部佁E  measurement_method?: "自勁E | "手動"
  device_id?: string  // 計測機器 ID
  
  notes?: string
  recorded_by_staff_id: string
  recorded_at: string
}

// ============================================
// 6. 医療�Eケアイベント（汎用�E�E// ============================================
type CareEvent = {
  event_type: "care" | "medical" | "medication"
  occurred_at: string
  
  action: string  // "吸弁E, "体位変換", "スキンケア", "投薬" など
  details?: Record<string, any>  // 詳細は action に応じて
  
  // 投薬の場吁E  medication?: {
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
// 7. コンチE��構造�E�record_data の新しい形
// ============================================
type RecordDataV2 = {
  version: 2  // 新バ�Eジョン識別孁E  
  // ヘッダー惁E��
  header: {
    service_id: string
    care_receiver_id: string
    record_date: string  // YYYY-MM-DD
    main_staff_id: string
    sub_staff_ids?: string[]
    created_at: string
    updated_at: string
  }
  
  // 時系列イベント�E列（�Eて occurred_at でソート可能�E�E  events: (
    SeizureEvent
    | ExcretionEvent
    | SleepEvent
    | NutritionEvent
    | VitalEvent
    | CareEvent
  )[]
  
  // 日付単位�E雁E��E��キャチE��ュ目皁E��E  summary?: {
    seizure_count: number
    seizure_total_duration_min: number
    meals_completed: number
    hydration_total_ml: number
    sleep_duration_min: number
    notes: string
  }
  
  // 自由形式フィールド（後方互換性�E�E  custom_fields?: TemplateFormValues
  
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

## 4. 段階的な移行案（実裁E��定なし、参老E�Eみ�E�E
### フェーズ 1�E�現在�E�E 共存期閁E- `record_data` の新しい構造を採用し始めめE- `events` 配�Eで時系列イベントを格紁E- 既存�E `custom_fields` は並行保持
- API GET レスポンスは両形式を返す

### フェーズ 2�E�API の雁E��機�E追加
```typescript
// 封E��のエンド�Eイント例（検討案！EGET /api/case-records/analytics?
  careReceiverId=xxx
  &dateFrom=2026-01-01
  &dateTo=2026-01-31
  &metric=seizure_frequency,meal_intake,sleep_quality

// レスポンス侁E{
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

### フェーズ 3�E�AI 解析連携
- 時系列イベントを Vercel AI SDK に feed
- Claude/GPT で自動サマリー生�E
- 医師への定期レポ�Eト�E動化
- 異常検知アラーチE
---

## 5. AI による解析�E観点から見た設計評価

### 5.1 現状設計�E AI 解析可能性�E�E*低い** ⚠�E�E
| 頁E�� | 評価 | 琁E�� |
|------|------|------|
| **構造明確性** | ⚠�E�E佁E| JSON スキーマ無し、�E由形式、ELM には context 依存、E|
| **時系列性** | ❁E不可 | 褁E��イベント�E時刻頁E��が定義されてぁE��ぁE��E|
| **量的刁E��** | ⚠�E�E限定的 | 排況E�E睡眠の量的チE�Eタが不足。統計�E析困難、E|
| **因果関俁E* | ❁E困難 | イベント間の関連�E�例：薬投丁EↁE発作頻度低下）を追跡困難、E|
| **自動化レベル** | ⚠�E�E佁E| チE��プレート形式なので、完�Eな自動化は困難、E|

### 5.2 提案設計�E AI 解析可能性�E�E*高い** ✁E
| 頁E�� | 評価 | 琁E�� |
|------|------|------|
| **構造明確性** | ✁E髁E| Zod スキーマで型定義、ELM に prompt context として使用可能、E|
| **時系列性** | ✁E髁E| `event_type + occurred_at` で全イベント頁E��付け可能、E|
| **量的刁E��** | ✁E髁E| 発作秒数、E��事摂取率、睡眠時間など定量チE�Eタ豊富、E|
| **因果関俁E* | ✁E可能 | イベント間の時間距離を計算。傾向�E析が容易、E|
| **自動化レベル** | ✁E髁E| Zod validation + JSON schema で完�E自動化可能、E|

---

## 6. 実裁E��討時の注意点

### 6.1 後方互換性
- 現在の `record_data` はフロントエンド�Eフォームで直接操作されてぁE��
- マイグレーション戦略が忁E��（古ぁE��コーチE+ 新しいイベント形式�E並行運用�E�E- API レスポンスの形状変更は慎重に�E�クライアント�EのアチE�EチE�Eト忁E��！E
### 6.2 Supabase RLS との連携
- `record_data` は JSONB 型で一度に丸ごと保存される
- イベント単位での RLS 制御は困難
- 行レベル権限�E `service_id` + `care_receiver_id` のままとする

### 6.3 チE��ト戦略
1. 現在の形式でのレコード読み取りチE��チE2. 新形式へのマイグレーション スクリプト検証
3. 古ぁE��式と新形式�E混在時�E API 応答テスチE4. AI 解析用エンド�Eイント�E精度チE��チE
### 6.4 フロントエンド影響度
- `CaseRecordForm` は日単位で 1 レコード保孁E- 時系列イベント形式への変更には UI 改修が大規模
- 段階的な機�E追加�E�例：朝・昼・夜�E褁E��入力）�E方が現実的

---

## 7. 参老E��裁E���E細かいポインチE
### 7.1 タイムゾーン
- すべての時刻めEISO 8601 UTC で統一
- クライアント�Eでローカルタイムゾーン変換
- `occurred_at` と `recorded_at` を区別�E�事象の時刻 vs. 記録時刻�E�E
### 7.2 権限と監査
```typescript
// 封E��スキーチE{
  recorded_by_staff_id: string,  // 誰が記録したぁE  recorded_at: string,           // ぁE��記録したぁE  
  edited_by_staff_id?: string,   // 誰が修正したか（あれ�E�E�E  edited_at?: string,            // ぁE��修正したか（あれ�E�E�E  
  edit_reason?: string           // 修正琁E��
}
```

### 7.3 量的チE�Eタの単位統一
- 時間�E�秒！Eduration_sec`�E�、�E�E�Eduration_min`�E�で統一
- 液体：ml で統一
- 温度�E�摂氏で統一
- 圧力：mmHg で統一

---

## 8. 現在のコードとの関連性

### API ルートへの影響
- **`app/api/case-records/save/route.ts`**
  - `record_data` の入力形式が多様化�E�新・旧混在�E�E  - バリチE�Eション層の強化が忁E��E  - 正規化ロジチE���E�例：時刻めEISO 8601 に�E��E追加

- **`app/api/case-records/route.ts`** / **`list/route.ts`**
  - イベント単位での抽出・フィルタリング対忁E  - 雁E��関数の追加�E�発作数カウント等！E  - ペ�Eジネ�Eション ロジチE��の見直し（イベント単佁Evs. レコード単位！E
### スキーマ�E影響
- **`schemas/unified.ts`**
  - `UnifiedRecord` ↁE`UnifiedEventArray` への拡張
  - `UnifiedEntry` ↁE`RecordDataV2` への進匁E  - Zod validation の褁E��匁E
### フロントエンチEの影響
- **`src/components/case-records/CaseRecordForm.tsx`**
  - 時系列イベント�E劁EUI の設計（重要E��E  - 既存�E `custom_fields` との共存期間�E設訁E
---

## 9. まとめと提言

### 現状評価
✁E**完�E度**: Records API の基本皁E��保存�E取得機�Eは実裁E��み  
⚠�E�E**刁E��性**: 医療統計�E可視化には構造が不十刁E 
❁E**AI 連携**: 現状の自由形式では LLM への feed が困難  

### 推奨する次のスチE��プ（優先頁E��E1. **短朁E*: 現在の `record_data` 構造をドキュメント化�E�何が入るか明確化！E2. **中朁E*: 発作�E排況E��ど重要E��E��の時系列化�E�イベント�E列化�E�E3. **中朁E*: API に雁E��エンド�Eイント追加�E�月間レポ�Eト用�E�E4. **長朁E*: AI 解析エンド�Eイント実裁E��Eercel AI SDK 連携�E�E5. **長朁E*: フロントエンチEUI の刷新�E�褁E��時刻入力対応！E
### 医療�E福祉現場での実運用性
- 現状設計でめE**日、E�E記録入力�E十�E可能**
- **月間レポ�Eト作�Eの自動化** には新構造が有効
- **医師への説明賁E��生�E** には AI 解析が有効
- 段階的な改喁E��現実的�E�一度に全部変えなぁE��E
---

**こ�Eドキュメント�E設計検討用です。実裁E�E別途決定�E承認してください、E*


