# ROUTE_MAP.md - 画面とファイルパスの対応表

**更新日**: 2025-12-16

## 主要画面とファイルパス

### 利用者詳細ページ
- **URL**: `/services/[serviceId]/users/[userId]`
- **ファイル**: `app/services/[serviceId]/users/[userId]/page.tsx`
- **機能**: 
  - 利用者の基本情報表示
  - "ケース記録を見る" / "日誌記録" / "タイムライン" カード
  - A.T専用: "ケース記録入力（A4印刷対応）" カード（userId === AT_USER_ID 時）

### ケース記録カード（CaseRecordCards）
- **コンポーネント**: `app/services/[serviceId]/users/[userId]/_components/case-records-cards.tsx`
- **役割**: 
  - 利用者詳細ページの "ケース記録を見る" セクションに表示
  - `/api/case-records` を fetch して最近のケース記録一覧を表示
  - 新規ケース記録の作成ダイアログ
- **問題**: useEffect で無限fetchループが発生している可能性

### A.Tケース記録フォーム
- **テンプレート定義**: `lib/at-case-record-template.ts`
- **フォームコンポーネント**: `components/at-case-record-form.tsx`
- **プリントコンポーネント**: `components/at-case-record-print.tsx`
- **表示条件**: userId === "A・T" の場合、日誌記録カードクリックで表示
- **currentView 状態**: "at-case-record-form" | "at-case-record-preview"

### API Routes

#### /api/case-records
- **ファイル**: `app/api/case-records/route.ts`
- **GET**: ケース記録一覧取得
  - クエリパラメータ: userId（必須）, serviceType（任意）, limit（任意）
- **POST**: ケース記録新規作成
  - Body: userId, serviceType, recordDate（必須）+ その他フィールド
- **現在の問題**: 500エラーが連打される

## コンポーネント階層

```
page.tsx (利用者詳細)
├── currentView === "overview"
│   ├── CaseRecordCards (ケース記録カード一覧)
│   └── 日誌記録カード（クリックで分岐）
│       ├── A.T専用 → "at-case-record-form"
│       └── その他 → "daily-logs"
├── currentView === "at-case-record-form"
│   └── ATCaseRecordForm
├── currentView === "at-case-record-preview"
│   └── ATCaseRecordPrint
└── currentView === "daily-logs"
    └── 日誌カテゴリ一覧
```

## データフロー

### CaseRecordCards のfetch
```
CaseRecordCards (component)
  ↓ useEffect [userId, serviceId, toast] ← toastが依存配列に入っているのが問題の可能性
  ↓ fetch GET /api/case-records?userId=xxx&serviceType=xxx&limit=20
  ↓
app/api/case-records/route.ts (GET handler)
  ↓
lib/case-records-structured.ts (listCaseRecords)
  ↓
Supabase case_records テーブル
```

### A.T ケース記録の保存（未実装）
```
ATCaseRecordForm
  ↓ onSave (data)
  ↓ setATCaseRecordData(data)
  ↓ setCurrentView("at-case-record-preview")
  ↓
ATCaseRecordPrint (A4プレビュー)
  ↓ window.print()
```

## 修正対象ファイル

### 優先度：高（Console 500止血）
1. `app/services/[serviceId]/users/[userId]/_components/case-records-cards.tsx`
   - useEffect 依存配列修正
   - A.T専用ガード追加（暫定）

2. `app/api/case-records/route.ts`
   - エラーログ強化（既存 try/catch の詳細化）

### 優先度：中（TSエラー）
3. `components/ui/clickable-card.tsx`
   - particleColors プロパティを型定義に追加

4. `lib/case-records-structured.ts`
   - number/string 比較の型統一
