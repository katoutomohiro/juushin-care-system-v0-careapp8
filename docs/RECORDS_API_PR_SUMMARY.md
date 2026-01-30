# Records API 統一 PR - 変更サマリー

**日時**: 2026-01-30  
**ブランチ**: feat/records-api-unify-v3  
**状態**: ✅ lint/typecheck/build 全て成功

---

## 変更ファイル一覧

| ファイル | 変更内容 | 行数 |
|---------|---------|------|
| `app/api/case-records/save/route.ts` | 時系列イベント化への設計コメント追加 | +16 |
| `app/api/case-records/route.ts` | 分析API構想のコメント追加 | +13 |
| `app/api/case-records/list/route.ts` | イベントフィルタ・集計機能の提案コメント追加 | +9 |
| `schemas/unified.ts` | 正規化スキーマ設計ノート追加 | +30 |
| `docs/RECORDS_API_DESIGN_EVOLUTION.md` | 詳細設計ドキュメント（新規） | 463行 |

**合計変更**: 5ファイル、68行コメント・ドキュメント追加  
**コード変更**: 0行（コメント・ドキュメントのみ）

---

## レスポンス形式（変更なし - 後方互換性保持）

### Case Records API の現在のレスポンス形式

#### 成功レスポンス

**POST /api/case-records/save** - 記録保存
```json
{
  "ok": true,
  "record": {
    "id": "uuid",
    "service_id": "uuid",
    "care_receiver_id": "uuid",
    "record_date": "YYYY-MM-DD",
    "record_time": "HH:mm:ss",
    "record_data": { /* 構造化 JSON */ },
    "main_staff_id": "uuid",
    "sub_staff_id": "uuid",
    "created_at": "ISO 8601",
    "updated_at": "ISO 8601",
    "version": 1
  }
}
```

**GET /api/case-records** - 記録取得（単一/リスト）
```json
{
  "ok": true,
  "records": [
    { /* record object */ }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 42,
    "hasMore": true
  }
}
```

**GET /api/case-records/list** - 記録一覧（staff 関連情報付き）
```json
{
  "ok": true,
  "records": [
    {
      "id": "uuid",
      "record_date": "YYYY-MM-DD",
      "record_data": { /* 構造化 JSON */ },
      "main_staff": { "id": "uuid", "name": "田中太郎" },
      "sub_staff": { "id": "uuid", "name": "佐藤次郎" }
    }
  ],
  "pagination": { /* pagination info */ }
}
```

#### エラーレスポンス

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "詳細メッセージ"
  }
}
```

**HTTP ステータスコード**:
- `200`: 成功
- `400`: バリデーションエラー（必須フィールド不足、形式不正）
- `401/403`: 認証/認可エラー
- `404`: リソース不足（service, care_receiver, record not found）
- `409`: 競合（optimistic locking version 不一致）
- `503`: DB 接続不可（Supabase admin client 初期化失敗）
- `500`: 予期しないエラー

---

## 設計上の改善点（提案済み、実装予定なし）

### 1. 時系列イベント化

**現状**:
- `record_data` は自由形式 JSON
- 複数イベント（発作、排泄、睡眠）を同一レコード内で扱う方法が不統一

**提案**:
- `record_data.events[]` 配列で時系列イベントを格納
- 各イベントに `event_type` + `occurred_at` (ISO 8601) を必須化
- イベント型: SeizureEvent, ExcretionEvent, SleepEvent, NutritionEvent, VitalEvent, CareEvent

### 2. 分析用エンドポイント（将来実装）

```
GET /api/case-records/analytics?careReceiverId=xxx&metric=seizure_frequency&dateFrom=2026-01-01&dateTo=2026-01-31

レスポンス例:
{
  "ok": true,
  "analytics": {
    "seizure": {
      "count": 7,
      "avg_duration_sec": 45,
      "types": { "強直間代": 5, "ピク付き": 2 },
      "daily": [
        { "date": "2026-01-01", "count": 1, "total_duration_sec": 120 }
      ]
    },
    "meal": { "completion_rate": 0.85, ... },
    "sleep": { "avg_duration_min": 420, ... }
  }
}
```

### 3. イベント型フィルタ（将来実装）

```
GET /api/case-records/list?eventType=seizure&minSeverity=moderate

フィルタ対象：
- eventType: seizure, excretion, sleep, nutrition, hydration, vitals, care
- severity/amount の定量範囲指定
```

---

## 品質チェック結果

✅ **pnpm lint** - PASS  
✅ **pnpm typecheck** - PASS  
✅ **pnpm build** - PASS (29 pages generated)

---

## 差分最小化

- ✅ 変更ファイルは Records API 関連のみ（5ファイル）
- ✅ 他の API ルート・コンポーネントへの影響なし
- ✅ コード変更 0行（コメント・ドキュメント追加のみ）
- ✅ レスポンス形式は現状維持（後方互換性 100%）

---

## PR マージ準備状況

| 項目 | 状態 |
|------|------|
| コード品質（lint） | ✅ 合格 |
| 型安全性（typecheck） | ✅ 合格 |
| ビルド可能性（build） | ✅ 合格 |
| 差分最小化 | ✅ 達成 |
| ドキュメント完備 | ✅ 完了 |
| 後方互換性 | ✅ 100% 保持 |

**結論**: 本 PR は merge-ready 状態です。

