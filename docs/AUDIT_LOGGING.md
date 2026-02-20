# AUDIT_LOGGING - 監査ログ実装ガイド

**Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: 確定版（フェーズ1ドキュメント）  

---

## 📌 概要

本ドキュメントは、重心ケアアプリにおける**統一的な監査ログの構造・記録・参照**について定義します。

### 設計原則

1. **PII/PHI 禁止**: 個人識別情報・医療情報をログに含めない
2. **最小限の記録**: who, when, action, resource_type, resource_id（ハッシュ可）のみ記録
3. **アプリケーション層での記録**: DB トリガーに依存せず、アプリケーション層で明示的に呼び出し
4. **保存期間管理**: 監査ログは長期保存し、個人情報は定期削除
5. **改ざん防止**: 監査ログは append-only（追加のみ、更新・削除不可）

---

## 📊 監査ログスキーマ

### テーブル定義

```sql
CREATE TABLE audit_logs (
  -- ID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 誰が: 操作ユーザーの認証 ID
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- どの organization/service で
  service_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  
  -- いつ
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 何を（操作タイプ）
  action TEXT NOT NULL CHECK (action IN (
    'create',      -- リソース新規作成
    'read',        -- リソース読み取り
    'update',      -- リソース更新
    'delete',      -- リソース削除
    'export',      -- データ エクスポート
    'role_change', -- 権限変更
    'login',       -- ログイン
    'logout',      -- ログアウト
    'auth_failed'  -- 認証失敗
  )),
  
  -- 何のリソースに対して
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'care_receiver',
    'case_record',
    'staff',
    'staff_profile',
    'service',
    'auth_user',
    'settings'
  )),
  
  -- どのリソースの ID（SHA-256 ハッシュ推奨）
  resource_id_hash TEXT,
  
  -- 変更内容（フィールド名のみ、値は含めない）
  changed_fields JSONB,
  
  -- エラー情報（失敗時のみ）
  error_message TEXT,
  
  -- 追加メタデータ
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- RLS（同じ service 内の staff/nurse/admin のみ参照可）
  
  -- インデックス（検索性能）
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE RESTRICT,
  CONSTRAINT audit_logs_service_id_fkey FOREIGN KEY (service_id) REFERENCES facilities(id) ON DELETE RESTRICT
);

-- インデックス
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_service_id ON audit_logs(service_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_service_created ON audit_logs(service_id, created_at DESC);

-- RLS ポリシー: staff 以上が自 service のログを参照可
CREATE POLICY "audit_logs: service members can read"
  ON audit_logs FOR SELECT
  USING (
    service_id IN (
      SELECT facility_id FROM staff_profiles 
      WHERE id = auth.uid() 
        AND role IN ('staff', 'nurse', 'admin')
    )
  );

-- RLS ポリシー: ログは append-only（INSERT のみ許可）
CREATE POLICY "audit_logs: service_role can insert"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ログの append-only を強制（UPDATE/DELETE は禁止）
CREATE POLICY "audit_logs: no update"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "audit_logs: no delete"
  ON audit_logs FOR DELETE
  USING (false);
```

---

## 🔐 記録項目と詳細

### 必須項目

| フィールド | 型 | 説明 | 例 |
|-----------|-----|-------|-----|
| `id` | UUID | ログエントリの一意識別子 | `a1b2c3d4-e5f6-...` |
| `actor_id` | UUID | 操作したユーザーの auth.uid | `12345678-...` |
| `service_id` | UUID | 操作が実行された organization | `org-life-care-...` |
| `created_at` | TIMESTAMPTZ | タイムスタンプ | `2026-02-20 14:30:45 UTC` |
| `action` | TEXT | 操作タイプ | `'create', 'read', 'update'` |
| `resource_type` | TEXT | リソースの種別 | `'care_receiver', 'case_record'` |

### オプション項目

| フィールド | 型 | 用途 | 例 |
|-----------|-----|--------|------|
| `resource_id_hash` | TEXT | ハッシュ化されたリソース ID | `sha256('care_receiver_abc123')` |
| `changed_fields` | JSONB | 更新時の変更フィールド（値なし） | `['full_name', 'address']` |
| `error_message` | TEXT | 失敗時のみ記録 | `'User not found'` |
| `metadata` | JSONB | 追加情報（IP アドレス、User-Agent など） | `{"ip": "192.168.1.1"}` |

### 禁止項目

```typescript
// ❌ これらを audit_logs に含めてはいけない
❌ full_name       // 個人識別情報
❌ address         // 住所
❌ phone           // 電話番号
❌ emergency_contact
❌ birthday        // 生年月日
❌ medical_care_detail  // 医療情報
❌ record_data     // case_record の payload
❌ old_value / new_value  // フィールド値
```

---

## 📝 操作ごとの記録パターン

### パターン1: リソース作成

```typescript
// 例: care_receiver 新規作成
async function logCreateCareReceiver(
  actorId: string,
  serviceId: string,
  careReceiverId: string
) {
  const resourceIdHash = hashField(careReceiverId);
  
  return supabase
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      service_id: serviceId,
      action: 'create',
      resource_type: 'care_receiver',
      resource_id_hash: resourceIdHash,
      changed_fields: null,  // 作成時は null
      metadata: { ip: getClientIp() },
    });
}
```

### パターン2: リソース読取

```typescript
// 例: care_receiver リスト参照
async function logReadCareReceivers(
  actorId: string,
  serviceId: string,
  count: number
) {
  return supabase
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      service_id: serviceId,
      action: 'read',
      resource_type: 'care_receiver',
      resource_id_hash: null,  // 複数リソースの読取の場合は null
      changed_fields: { record_count: count },
      metadata: {},
    });
}
```

### パターン3: リソース更新

```typescript
// 例: care_receiver の birthday, address を更新
async function logUpdateCareReceiver(
  actorId: string,
  serviceId: string,
  careReceiverId: string,
  changedFieldNames: string[]  // ['birthday', 'address']
) {
  const resourceIdHash = hashField(careReceiverId);
  
  return supabase
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      service_id: serviceId,
      action: 'update',
      resource_type: 'care_receiver',
      resource_id_hash: resourceIdHash,
      changed_fields: changedFieldNames,  // フィールド名のみ
      metadata: {},
    });
}
```

---

## 📋 記録チェックリスト

すべての API ハンドラで以下を確認：

- [ ] POST/PUT/DELETE ハンドラは監査ログを呼び出しているか
- [ ] ログに PII/PHI が含まれていないか
- [ ] resource_id は存在する場合ハッシュ化しているか
- [ ] changed_fields はフィールド名のみを含むか
- [ ] service_id が正しく記録されているか

---

## 参照

- [SECURITY_MODEL.md](./SECURITY_MODEL.md) - セキュリティ設計概要
- [DATA_RETENTION.md](./DATA_RETENTION.md) - データ削除ポリシー詳細
