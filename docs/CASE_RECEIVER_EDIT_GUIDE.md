# 利用者情報編集機能 - 実装ガイド

## 概要

このドキュメントは、Next.js App Router + Supabase を使用した「利用者（case receiver）」詳細ページの**安全な編集・更新UI**の実装を説明します。

## アーキテクチャ

### 1. **フロントエンド（React コンポーネント）**

#### 利用者詳細ページ
- **ファイル**: `app/services/[serviceId]/users/[userId]/page.tsx`
- **機能**:
  - 利用者基本情報の表示
  - 「編集」ボタン（ヘッダー右上）
  - 編集ダイアログの制御

#### 編集ダイアログコンポーネント
- **ファイル**: `components/edit-care-receiver-dialog.tsx`
- **機能**:
  - フォーム入力（name, full_name, birthday, gender, address, phone, emergency_contact, notes）
  - 権限ベース表示制御（userRole: "staff" | "nurse" | "admin"）
  - 変更前後の差分表示（簡易版）
  - バリデーション（必須フィールド、文字数チェック）
  - 楽観ロックの表示（version による競合検出）

### 2. **バックエンド（API ルート）**

#### 利用者更新 API
- **ファイル**: `app/api/care-receivers/[id]/route.ts`
- **メソッド**: `PUT /api/care-receivers/[id]`
- **機能**:
  - Supabase を使用した更新
  - 🔐 **楽観ロック**: `version` フィールドを使用して、他のユーザーとの競合を検出
  - RLS（Row Level Security）前提（Supabase ポリシー）
  - エラー時の適切なステータスコード返却（409 Conflict, 400 Bad Request, 500 Internal Server Error）

### 3. **データベーススキーマ（Supabase PostgreSQL）**

テーブル: `care_receivers`

```sql
CREATE TABLE care_receivers (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  display_name TEXT,
  full_name TEXT,           -- 個人情報（staff は読み取り専用）
  birthday DATE,            -- 個人情報（staff は読み取り専用）
  gender TEXT,
  address TEXT,             -- 個人情報（admin のみ）
  phone TEXT,               -- 個人情報（staff は読み取り専用）
  emergency_contact TEXT,   -- 個人情報（staff は読み取り専用）
  notes TEXT,
  medical_care_detail JSONB,
  age INTEGER,
  care_level TEXT,
  condition TEXT,
  service_code TEXT,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1, -- 楽観ロック用
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  updated_by TEXT,
  CONSTRAINT age_positive CHECK (age >= 0)
);
```

## 使用フロー

### 1. 利用者詳細ページへのアクセス
```
/services/life-care/users/A%E3%83%BBT
```

### 2. 編集ボタンクリック
- ページヘッダー右上の「編集」ボタンをクリック
- 利用者の最新データを Supabase から取得
- 編集ダイアログを開く

### 3. フォーム編集
- 表示名、実名、生年月日、性別、住所、電話、緊急連絡先、メモを編集
- 権限に基づいて表示/編集可能なフィールドが制限される
  - **staff**: 表示名のみ編集可能
  - **nurse**: 基本情報を編集可能
  - **admin**: すべてのフィールド編集可能

### 4. バリデーション
- 必須フィールド: `display_name`（最小1文字）
- 空白のみは禁止
- 年齢: 0 以上

### 5. 保存
- 「保存」ボタンをクリック
- リクエストボディに `version` を含める（楽観ロック用）
- API レスポンスの確認:
  - **成功 (200)**: トースト表示「✅ 利用者情報を更新しました」
  - **409 Conflict**: 「⚠️ 他のユーザーが先に更新しています」 → ページ再読み込み
  - **エラー (400/500)**: 「❌ 保存エラー」 + 詳細メッセージ

## セキュリティ設計

### 1. **RLS（Row Level Security）**
Supabase RLS ポリシーで以下を実装:
```sql
-- 個人情報フィールドのマスキング（staff は編集不可）
CREATE POLICY staff_readonly_on_full_name
  ON care_receivers
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM staff_roles))
  WITH CHECK (full_name = (SELECT full_name FROM care_receivers WHERE id = care_receivers.id));

-- admin のみ特定フィールド編集可
CREATE POLICY admin_can_edit_address
  ON care_receivers
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_roles))
  WITH CHECK (true);
```

### 2. **楽観ロック（Optimistic Locking）**
- `version` フィールドを使用して競合を検出
- 更新時に古い `version` を検出 → 409 Conflict を返す
- DB トリガーで `version` を自動インクリメント

```sql
CREATE TRIGGER increment_version
AFTER UPDATE ON care_receivers
FOR EACH ROW
EXECUTE FUNCTION increment_version_column();
```

### 3. **個人情報の取り扱い**
- ログには `full_name`, `birthday`, `address`, `phone`, `emergency_contact` を含めない
- API レスポンスから個人情報を除外（`sanitizedResponse`）
- UI では権限ベースのフィールド表示制御

### 4. **監査ログ**
- `updated_at`: 更新時刻
- `updated_by`: 更新者 ID（トリガーで自動設定）

## エラーハンドリング

| ステータス | エラー | 対応 |
|-----------|--------|-----|
| 200 | 成功 | トースト表示、ダイアログ閉じる |
| 400 | バリデーション失敗 | 詳細メッセージ表示 |
| 409 | 競合（他者が更新済み） | 「最新のデータを再読み込みしてください」 |
| 500 | サーバーエラー | 「Internal server error」 |

## 実装チェックリスト

- [x] EditCareReceiverDialog コンポーネント実装
- [x] API ルート（PUT）実装
- [x] RLS ポリシー（ TODO: DB 側で実装確認）
- [x] エラーハンドリング
- [x] トースト通知
- [x] 楽観ロック（version チェック）
- [x] 権限ベース表示制御
- [x] TypeScript 型安全性
- [x] ESLint 通過
- [x] Build 成功

## テスト手順

### 1. 単一ユーザーの編集
```bash
pnpm dev
# ブラウザ: http://localhost:3000/services/life-care/users/A%E3%83%BBT
# 編集ボタン → フォーム編集 → 保存 → 確認
```

### 2. 権限ベース表示制御
```typescript
// components/edit-care-receiver-dialog.tsx で userRole を変更
userRole="staff"   // 表示名のみ
userRole="nurse"   // 基本情報
userRole="admin"   // すべて
```

### 3. 競合検出テスト
```bash
# 同時に2つのウィンドウで編集 → version 競合を確認
```

## 今後の改善

- [ ] 差分プレビュー（Before/After）の表示
- [ ] Undo/Redo 機能
- [ ] バッチ更新（複数利用者）
- [ ] 変更履歴のビュー
- [ ] RLS ポリシーの完全実装と検証
