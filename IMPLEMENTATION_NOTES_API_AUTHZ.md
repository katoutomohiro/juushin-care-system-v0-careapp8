# API 認可強制実装 - 検証メモ (2026-02-20)

## 実装完了

### 新規ファイル
1. **lib/authz/serviceScope.ts** (104 行)
   - `requireServiceIdFromRequest(req)` → serviceId 抽出,でなければ 400
   - `assertServiceAssignment(supabase, userId, serviceId)` → 割り当て確認, なければ 403
   - `requireServiceIdAndAssignment(req, supabase, userId)` → 複合チェック

2. **lib/audit/writeAuditLog.ts** (153 行)
   - `writeAuditLog(supabase, entry)` → audit_logs に記録（非ブロッキング）
   - `auditRead()` / `auditMutation()` → 便利ラッパー
   - PII/PHI フィルタリング（名前/住所/電話 禁止）

### 修正ファイル
1. **app/api/care-receivers/route.ts**
   - インポート追加: requireServiceIdFromRequest, assertServiceAssignment, auditRead
   - 操作フロー変更:
     ```
     STEP 1: Authentication (requireApiUser) → 401
     STEP 2: Parameter validation (requireServiceIdFromRequest) → 400
     STEP 3: Authorization check (assertServiceAssignment) → 403
     STEP 4: Database query (scoped by serviceId)
     STEP 5: Audit logging (auditRead, async non-blocking)
     ```

## 検証シナリオ

### ✅ 想定される挙動

| シナリオ | リクエスト | 期待される応答 | HTTP Status |
|--------|----------|-------------|-----------|
| **未認証** | なし (Cookie無) | Authorization required | 401 |
| **serviceId 無し** | `GET /api/care-receivers` | Service ID required | 400 |
| **割り当て無し** | `GET /api/care-receivers?serviceId=other-org` | Access denied | 403 |
| **正常系** | `GET /api/care-receivers?serviceId=life-care` (有効ユーザ) | careReceivers JSON | 200 |

### ⚠️ 暫定状態（已认认可までのギャップ）

| 項目 | 現状 | 永続状態 |
|-----|------|--------|
| **service_staff テーブル** | 未作成（RLS 参照のみ） | 作成予定（Phase 2） |
| **割り当てロジック** | staff_profiles.facility_id 使用 | service_staff.user_id + role に統一 |
| **監査ログテーブル** | audit_logs スキーマ定義のみ | 実装待ち（audit_logs 作成後自動記録） |
| **エラー メッセージ** | クライアント用汎用メッセージ | PII 漏洩なし（確認済） |

## 根拠ドキュメント & ファイル

| 項目 | ファイルパス | 説明 |
|-----|-----------|------|
| **割り当てテーブル候補** | `docs/DOMAIN_MODEL.md#156` | service_staff 참考データベース設計 |
| **割り当てテーブル未実装** | `docs/DOMAIN_MODEL.md#179` | 「service_staff Table Missing」セクション |
| **RLS ポリシー参照** | `supabase/migrations/20260128110000_extend_rls_role_separation.sql` | service_staff.user_id/service_id/role を参照 |
| **監査ログスキーマ** | `docs/AUDIT_LOGGING.md#28` | audit_logs テーブル DDL |
| **PII 禁止ルール** | `docs/AUDIT_LOGGING.md#115` | 記録禁止項目:full_name, address, phone, medical_care_detail |
| **セキュリティモデル** | `docs/SECURITY_MODEL.md#79` | 認可フロー定義: auth → authz → process → audit |

## 確認タスク（フェーズ 2-3）

| # | タスク | 優先度 | 担当 | 状態 |
|---|-------|--------|------|------|
| CT-1 | service_staff テーブル実装 (schema/migration) | HIGH | DBA | ❌ |
| CT-2 | service_staff の seed (staff_profiles から) | HIGH | DBA | ❌ |
| CT-3 | lib/authz/serviceScope.ts を service_staff に変更 | HIGH | DEV | 延期 |
| CT-4 | audit_logs テーブル実装 (migration) | MEDIUM | DBA | ❌ |
| CT-5 | audit_logs RLS ポリシー有効化 | MEDIUM | DBA | ❌ |
| CT-6 | 他データ API への横展開 (staff, case-records等) | MEDIUM | DEV | 延期 |

## 実装ノート

### パターン: care-receiversで学んだAPI認可パターン

```typescript
// ✅ 推奨パターン（care-receivers で実装）
export async function GET(req: NextRequest) {
  try {
    // 1. 認証
    const user = await requireApiUser()
    if (!user) return unauthorizedResponse(true)
    
    // 2. Supabase 接続確認
    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) return clientError
    
    // 3. serviceId 抽出 (400)
    let serviceId: string
    try {
      serviceId = requireServiceIdFromRequest(req)
    } catch (err) {
      if (err instanceof NextResponse) return err
      throw err
    }
    
    // 4. 認可チェック (403)
    const authzError = await assertServiceAssignment(supabaseAdmin!, user.id, serviceId)
    if (authzError) return authzError
    
    // 5. データクエリ (serviceId でスコープ)
    const { data, error } = await supabaseAdmin!
      .from("リソース表")
      .select(...)
      .eq("service_id", serviceId)  // ← 必須:スコープ
    
    if (error) return supabaseErrorResponse(...)
    
    // 6. 監査ログ (async, 非ブロッキング)
    void auditRead(supabaseAdmin!, { actor_id: user.id, service_id: serviceId, ... })
    
    return NextResponse.json({ ok: true, ... })
  } catch (error) {
    return unexpectedErrorResponse(...)
  }
}
```

### 決定事項

1. **継続性**: requireServiceIdFromRequest/assertServiceAssignment は他 API にも使用可能
2. **暫定性**: service_staff 未実装のため、staff_profiles を interim として使用
3. **非ブロッキング**: 監査ログ失敗は API 応答をブロックしない（writeAuditLog は best-effort）
4. **PII 安全**: 全コード で名前/住所等を console/response に出さない（確認済）

## Next Steps (フェーズ 2-3)

1. **確認タスク化**（本ファイルの確認タスク表参照）
2. **service_staff テーブル作成**後、lib/authz/serviceScope.ts 更新
3. **audit_logs テーブル作成**後、writeAuditLog は自動記録に変更
4. **他 API への横展開**:
   - GET `/api/staff?serviceId=...`
   - GET `/api/case-records/list?serviceId=...&careReceiverId=...`
   - POST `/api/case-records/save` (body に serviceId)
   - GET `/api/case-receivers/[id]?serviceId=...` (optional if path に service context がある)
