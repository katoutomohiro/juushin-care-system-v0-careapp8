# SECURITY_MODEL - 重心ケアアプリセキュリティモデル

**Version**: 1.0  
**Last Updated**: 2026-02-20  
**Status**: 確定版（フェーズ1ドキュメント完成）  

---

## 📌 概要

本ドキュメントは、重心ケアアプリの**認証・認可・監査**に関する統一的なセキュリティ設計を定義します。

### 基本原則

1. **最小権限の原則**: ユーザーは業務に必要最小限の権限のみ保有
2. **service_id スコープ必須**: 同法人内でのデータアクセスを許可しない（組織単位での徹底的な分離）
3. **API 強制順序**: 認証 → 認可 → 処理 → 監査ログ
4. **RLS + Application層の多層防御**: Supabase RLS とアプリケーション層での権限チェックを併用
5. **SUPABASE_SERVICE_ROLE_KEY 使用時も認可省略禁止**: 管理用キーでの呼び出しでも権限チェック必須

---

## 🔐 認証フロー

### 1. ユーザー認証

| 段階 | 処理 | 責務 |
|------|------|------|
| **ログイン** | Supabase Auth で email/password 認証 | `/auth/login` |
| **セッション確立** | JWT トークン発行 + ブラウザに保存 | Supabase が自動処理 |
| **API リクエスト** | Authorization ヘッダに JWT 含める | fetch/axios が自動付与 |
| **トークン検証** | API の先頭で `auth.uid` 取得可否を確認 | すべての API ハンドラ |

### 2. トークン アクセス

```typescript
// API ハンドラ内での認証確認パターン
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service Role でアクセス
);

// リクエストから認可ユーザーを取得
const {
  data: { user },
  error: authError,
} = await supabase.auth.admin.getUserById(userId);

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 3. セッションライフサイクル

- **有効期限**: JWT は Supabase デフォルト値（通常 1 時間）
- **リフレッシュ**: Supabase Auth が自動リフレッシュ
- **ログアウト**: JWT 削除 + ローカルストレージ クリア
- **セッション喪失**: 再ログインが必須

---

## 🛡️ 認可フロー

### 1. データアクセスの権限チェック

API ハンドラは以下の順で処理：

```
GET /api/staff/[serviceId] 

1. 認証: リクエストヘッダから user.id (auth.uid) 抽出
   ↓ (失敗時: 401)
   
2. 認可: user が serviceId へのアクセス権を持つか確認
   - staff_profiles.facility_id == serviceId か検査
   - または、service_staff.service_id == serviceId + role チェック
   ↓ (失敗時: 403)
   
3. 処理: Supabase RLS ポリシー経由でデータ取得
   ↓
   
4. 監査: 誰が、いつ、何を取得したかログ記録
   ↓
   
5. レスポンス: JSON 返却
```

### 2. service_id スコープ必須ルール

**禁止事項**：

```typescript
// ❌ 禁止: 複数 service へのアクセス許可
const serviceIds = [serviceIdA, serviceIdB];
for (const sid of serviceIds) {
  await fetchData(sid);  // 同法人の別 service にアクセス可能
}

// ❌ 禁止: リクエストで指定された serviceId をそのまま使用
const { serviceId } = await req.json();
const data = await supabase
  .from('care_receivers')
  .select()
  .eq('service_id', serviceId);  // serviceId の検証なし
```

**必須パターン**：

```typescript
// ✅ 必須: リクエストした user が serviceId へのアクセス権を持つか検査
export async function GET(req, context) {
  const { serviceId } = await context.params;
  const authUser = req.user;  // 認証済みユーザー
  
  // 認可チェック: user が serviceId へのアクセス権をもつか
  const hasAccess = await checkServiceAccess(authUser.id, serviceId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 処理: データ取得
  const data = await supabase
    .from('care_receivers')
    .select()
    .eq('service_id', serviceId);
  
  // 監査ログ
  await logAccess('GET', 'care_receivers', null, authUser.id, serviceId);
  
  return NextResponse.json(data);
}
```

### 3. RLS ポリシーの役割

| 層 | 責務 | 例 |
|-----|------|-------|
| **Supabase RLS** | データベース層での最後の防御 | たとえ API が認可をバイパスしても、RLS で非公開行は取得不可 |
| **Application 層** | API ハンドラでの認可チェック | ユーザーがアクセス権をもつか事前判定し、クエリ時間削減 |

---

## 📊 テーブル別アクセス権限マトリックス

### care_receivers

```
┌─────────────────┬────────┬────────┬────────────┬───────────┐
│ 操作            │ 匿名   │ staff  │ nurse      │ admin     │
├─────────────────┼────────┼────────┼────────────┼───────────┤
│ display_name    │ ❌     │ 🔍     │ 🔍         │ 🔍 + ✏️   │
│ full_name       │ ❌     │ ❌     │ 🔍 + ✏️    │ 🔍 + ✏️   │
│ birthday        │ ❌     │ ❌     │ 🔍 + ✏️    │ 🔍 + ✏️   │
│ address         │ ❌     │ ❌     │ ❌        │ 🔍 + ✏️   │
│ phone           │ ❌     │ ❌     │ ❌        │ 🔍 + ✏️   │
│ emergency_cont. │ ❌     │ ❌     │ ❌        │ 🔍 + ✏️   │
│ medical_detail  │ ❌     │ ❌     │ 🔍 + ✏️    │ 🔍 + ✏️   │
└─────────────────┴────────┴────────┴────────────┴───────────┘

凡例:
🔍 = 参照可
🔍 + ✏️ = 参照 + 編集可
❌ = アクセス不可
```

### case_records

```
┌──────────────────┬────────┬─────────┬──────────────┬────────────┐
│ 操作             │ 匿名   │ staff   │ nurse        │ admin      │
├──────────────────┼────────┼─────────┼──────────────┼────────────┤
│ 参照（自 service)│ ❌     │ 🔍      │ 🔍           │ 🔍         │
│ 新規作成         │ ❌     │ ✏️      │ ✏️          │ ✏️        │
│ 編集（自分の記録)│ ❌     │ ✏️      │ ✏️          │ ✏️        │
│ 削除             │ ❌     │ ❌      │ ❌          │ ✏️        │
│ 監査ログ参照     │ ❌     │ ❌      │ 🔍（限定）   │ 🔍         │
└──────────────────┴────────┴─────────┴──────────────┴────────────┘
```

---

## 🔄 SUPABASE_SERVICE_ROLE_KEY 使用時の認可

**重要**: SERVICE_ROLE キーでの呼び出しでも、**RLS を無視できることは認可を免除するわけではない**。

### パターン

```typescript
// SERVICE_ROLE キー使用時
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ❌ 間違い: RLS 回避 = 認可省略ではない
const allRecords = await supabaseAdmin
  .from('case_records')
  .select()
  .eq('service_id', attacker_service_id);  // 他の service_id も取得可能

// ✅ 正しい: SERVICE_ROLE でも認可チェック必須
const requestUserServiceId = await getUserServiceId(auth.uid);
const allRecords = await supabaseAdmin
  .from('case_records')
  .select()
  .eq('service_id', requestUserServiceId);  // ユーザーの service のみ取得
```

---

## 📝 監査ログ構造

### ログ対象操作

| 操作 | 記録内容 | 例 |
|------|---------|-----|
| **作成** | who, when, action='create', resource_type, resource_id(ハッシュ可) | care_receiver ID='abc...' を staff「田中」が作成 |
| **読取** | who, when, action='read', resource_type, resource_count | case_records から 5 件を nurse「田中」が参照 |
| **更新** | who, when, action='update', resource_type, resource_id, changed_fields(フィールド名のみ) | care_receiver ID='abc...' の birthday を admin「太郎」が変更 |
| **削除** | who, when, action='delete', resource_type, resource_id | case_record ID='xyz...' を admin「花子」が削除 |

### PII/PHI 禁止ルール

```typescript
// ❌ 禁止: full_name, address, phone を監査ログに含める
await logAccess({
  action: 'update',
  resource_type: 'care_receiver',
  resource_id: hashId(carReceiverId),
  full_name: user.full_name,  // 禁止
  address: user.address,       // 禁止
  phone: user.phone,           // 禁止
});

// ✅ 正しい: changed_fields はフィールド名のみ
await logAccess({
  action: 'update',
  resource_type: 'care_receiver',
  resource_id: hashId(carReceiverId),
  changed_fields: ['full_name', 'address'],  // 値は含めない
  actor: auth.uid,
  created_at: now(),
});
```

---

## 🚀 RLS 段階移行ロードマップ

### フェーズ1: 基本 RLS（完了）
- ✅ service_id / facility_id による行レベルセキュリティ有効化
- ✅ staff_profiles テーブルへの RLS

### フェーズ2: 役割ベース RLS（進行中）
- 🔄 service_staff テーブルの実装
- 🔄 role ベース（staff/nurse/admin）の RLS ポリシー統一

### フェーズ3: 属性ベース RLS（計画中）
- ⏳ PII/PHI 保護（医療情報へのアクセスを nurse/admin に制限）
- ⏳ 同一 care_receiver への write 権限制限

### フェーズ4: 監査インテグレーション（計画中）
- ⏳ すべてのデータアクセスの統一監査ログ記録
- ⏳ 監査ログの保存期間ポリシー（7 年など）

---

## 🔒 API セキュリティチェックリスト

すべての API ハンドラは以下を実装必須：

```typescript
// API ハンドラ テンプレート
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // ✅ 1. 認証: ユーザーを識別
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ 2. 認可: ユーザーがリソースに対するアクセス権をもつか
    const { serviceId } = await context.params;
    const hasAccess = await checkServiceAccess(authUser.id, serviceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ✅ 3. 処理: 実際のビジネスロジック
    const result = await fetchServiceData(serviceId);
    
    // ✅ 4. 監査: アクセスをログに記録
    await logAccess({
      action: 'read',
      resource_type: 'service_data',
      actor: authUser.id,
      service_id: serviceId,
      created_at: new Date(),
    });
    
    // ✅ 5. レスポンス
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 📋 確認タスク

実装前に以下を確認してください：

- [ ] service_staff テーブル実装の必要性確認
- [ ] audit_logs テーブルの正式名称決定（audit_logs vs audit_events）
- [ ] 監査ログ保存期間の組織ポリシー確認（7 年？5 年？）
- [ ] エクスポート機能のセキュリティ要件確認
- [ ] バックアップの暗号化方針確認

---

## 📚 参照ドキュメント

- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) - テーブル設計・RLS 現状
- [AUDIT_LOGGING.md](./AUDIT_LOGGING.md) - 監査ログ詳細実装
- [DATA_RETENTION.md](./DATA_RETENTION.md) - データ保存・削除ポリシー
- [PLAN_PERSONAL_INFO_SECURITY.md](./PLAN_PERSONAL_INFO_SECURITY.md) - PII/PHI 保護詳細
