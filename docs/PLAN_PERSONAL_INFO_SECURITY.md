# 個人情報セキュリティ管理計画（PLAN_PERSONAL_INFO_SECURITY）

> **対象**: 重心ケア支援アプリにおける個人情報管理の設計・実装方針  
> **更新日**: 2026年1月28日  
> **責任者**: ChatGPT (設計責任) / チーム (実装)  
> **関連ドキュメント**: [PLAN_MASTER.md](./PLAN_MASTER.md)、[PLAN_CASE_RECORD.md](./PLAN_CASE_RECORD.md)、[PLAN_DEPLOY.md](./PLAN_DEPLOY.md)

---

## 1. 個人情報と表示名の分離方針

### 1.1 基本設計

重心ケアアプリでは、**個人情報の可視性を権限と環境に応じて制御**するため、以下のように分離します。

| カテゴリ | フィールド名 | 格納場所 | 表示条件 | 権限要件 | ログ出力 |
|---------|-----------|--------|--------|---------|---------|
| **匿名表示（常時可視）** | `display_name` | `care_receivers.display_name` | 全ページ（リスト、詳細） | 認証ユーザー | ✅ 可 |
| **個人識別情報（制限付き）** | `full_name`, `birthday`, `gender` | `care_receivers.*` | 詳細ページ＋編集時のみ | staff/nurse/admin | ❌ 禁止 |
| **連絡先情報（制限付き）** | `address`, `phone`, `emergency_contact` | `care_receivers.*` | 詳細ページ＋編集時のみ | admin/nurse | ❌ 禁止 |
| **医療情報（最高制限）** | `medical_care_detail` (JSONB) | `care_receivers.*` | 詳細ページ＋編集時のみ | nurse/admin | ❌ 禁止 |

### 1.2 表示名（display_name）の役割

- **用途**: リスト画面、日誌、ケース記録、A4シートなど、全ページで利用者を識別
- **例示値**: "AT"、"User-001"、"田中（匿名）"
- **変更時期**: 新規作成時に設定、編集可能
- **ログ出力**: Console / Network タブ / 監査ログで表示OK
- **本番運用**: 実名でも匿名でも可（施設の運用方針に従う）

### 1.3 実名（full_name）の取り扱い

- **用途**: 利用者詳細ページで「詳細情報編集」ダイアログにのみ表示
- **ログ出力**: **絶対禁止**（Console, API Response Log, Network タブに出さない）
- **開発環境**: 入力不要（空欄のまま）
- **本番環境**: 必要に応じて入力（但しログには一切出さない）
- **Supabase RLS**: Staff/Nurse/Admin ロール以外は SELECT 不可

---

## 2. RLS（Row Level Security）による権限管理

### 2.1 ロール定義と権限マトリクス

| ロール名 | Supabase Role | 説明 | display_name | full_name | medical_detail | 監査ログ |
|---------|---------------|------|-------------|----------|----------------|---------|
| **anon** | anon | 認証未実施 | ❌ | ❌ | ❌ | ❌ |
| **staff** | authenticated+service_staff | 介護職員 | ✅ | ✅ 読み取り | ✅ 読み取り | ✅ 読み取り |
| **nurse** | authenticated+service_nurse | 看護師 | ✅ | ✅ 読み取り/編集 | ✅ 読み取り/編集 | ✅ 読み取り/編集 |
| **admin** | authenticated+service_admin | サービス責任者 | ✅ | ✅ 読み取り/編集 | ✅ 読み取り/編集 | ✅ 読み取り/編集 |

### 2.2 RLS ポリシー実装

```sql
-- ① anon: care_receivers を全て拒否
CREATE POLICY "anon_deny_all" ON public.care_receivers
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ② staff: 自分のサービスに属する利用者のみ閲覧
--    （full_name などの個人情報は SELECT 対象外）
CREATE POLICY "staff_view_care_receivers" ON public.care_receivers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = care_receivers.service_id
      AND ss.role = 'staff'
    )
  );

-- ③ nurse: 自分のサービスに属する利用者のみ閲覧・編集
--    （medical_care_detail は編集可能）
CREATE POLICY "nurse_update_care_receivers" ON public.care_receivers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = care_receivers.service_id
      AND ss.role IN ('nurse', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = care_receivers.service_id
      AND ss.role IN ('nurse', 'admin')
    )
  );

-- ④ admin: サービス内の全利用者を読み取り・編集
CREATE POLICY "admin_full_access_care_receivers" ON public.care_receivers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = care_receivers.service_id
      AND ss.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = care_receivers.service_id
      AND ss.role = 'admin'
    )
  );

-- ⑤ 監査ログの読み取り: Nurse/Admin のみ
CREATE POLICY "nurse_read_care_receiver_audits" ON public.care_receiver_audits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      JOIN public.care_receivers cr ON cr.id = care_receiver_audits.care_receiver_id
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = cr.service_id
      AND ss.role IN ('nurse', 'admin')
    )
  );
```

### 2.3 列レベルセキュリティ（Column RLS）

```sql
-- ① staff: full_name, address, phone は見えない
-- （Supabase RLS では難しいため、API レスポンスレベルで実装）

-- ② nurse: 全列見える（但しログに出さない）

-- ③ admin: 全列見える（但しログに出さない）
```

**注**: Supabase の RLS は行レベルのため、列レベルの制限は API レスポンスでサニタイズする。

---

## 3. UI段階表示設計

### 3.1 リスト画面（users list）

```
┌─ サービス詳細 ─────────────────────────────┐
│  利用者一覧                                 │
├──────────────────────────────────────────┤
│  ▢ display_name: "AT"          (匿名OK)  │  → 全員表示
│  ▢ display_name: "User-001"             │  → 全員表示
│  ▢ display_name: "田中太郎"             │  → 表示名を実名にした例
│                                          │
│  👤: full_name/birthday/address は       │  → 非表示
│      非表示（詳細ページで表示）           │
└──────────────────────────────────────────┘
```

### 3.2 利用者詳細ページ（user profile）

```
┌─ 利用者詳細 ─────────────────────────────┐
│  表示名（display_name）                   │  → 常時表示
│  🔒 詳細情報を編集 [ボタン]               │  → 権限チェック後
├──────────────────────────────────────────┤
│  基本情報                                  │
│  ├ 生年月日: 2000-01-01    [staff/nurse] │  → ダイアログ内のみ
│  ├ 性別: 男性              [staff/nurse] │  → ダイアログ内のみ
│  └ 実名: (非表示)          [staff/nurse] │  → ダイアログ内のみ
│                                          │
│  連絡先情報（管理者のみ）                 │
│  ├ 住所: (非表示)          [admin only]  │  → ダイアログ内のみ
│  ├ 電話: (非表示)          [admin only]  │  → ダイアログ内のみ
│  └ 緊急連絡先: (非表示)    [admin only]  │  → ダイアログ内のみ
│                                          │
│  医療情報（看護師のみ）                   │
│  ├ 経管栄養: ✓             [nurse only]  │  → ダイアログ内のみ
│  └ 吸引対応: ✓             [nurse only]  │  → ダイアログ内のみ
└──────────────────────────────────────────┘
```

### 3.3 編集ダイアログ内表示フロー

```
ユーザーが「詳細情報を編集」ボタンをクリック
    ↓
auth.uid() で権限取得
    ↓
service_staff テーブルから role を確認
    ↓
┌─ role が "staff" の場合
│  ├ display_name: ✅ 編集可
│  ├ full_name: ✅ 表示・読み取り
│  ├ birthday: ✅ 表示・読み取り
│  ├ gender: ✅ 表示・読み取り
│  └ address, phone, medical_detail: ❌ 非表示
│
├─ role が "nurse" の場合
│  ├ display_name: ✅ 編集可
│  ├ full_name: ✅ 編集可
│  ├ birthday: ✅ 編集可
│  ├ gender: ✅ 編集可
│  ├ medical_care_detail: ✅ 編集可
│  └ address, phone: ❌ 非表示
│
└─ role が "admin" の場合
   ├ 全フィールド: ✅ 表示・編集可
   └ （但しログには出さない）
```

---

## 4. 編集・更新履歴方針

### 4.1 監査ログ（care_receiver_audits）の記録内容

```sql
INSERT INTO care_receiver_audits (
  care_receiver_id,
  action,
  changed_fields,  -- JSONB 配列: ["display_name", "medical_care_detail"]
  actor
) VALUES (
  'care_receiver_uuid',
  'update',
  '["display_name", "medical_care_detail"]'::jsonb,
  'editor_user_id'
)
```

**重要**: `changed_fields` には**フィールド名のみ**記録し、変更された**値は含めない**。

### 4.2 表示権限による監査ログ閲覧制限

| ロール | 監査ログ閲覧 | 備考 |
|--------|----------|------|
| anon | ❌ 不可 | |
| staff | ❌ 不可 | |
| nurse | ✅ 可 | 同じサービス内のみ |
| admin | ✅ 可 | 全サービス（又はサービス内） |

### 4.3 更新履歴の表示UI

```
┌─ 更新履歴タブ ───────────────────────────┐
│  2026-01-28 14:30  admin: display_name 更新
│  2026-01-28 13:15  nurse: medical_detail 更新
│  2026-01-27 09:00  staff: (表示権限なし)
│
│  ⓘ 個人情報の変更内容は、セキュリティ上
│    表示されません
└──────────────────────────────────────────┘
```

---

## 5. 技術実装の詳細

### 5.1 DB層（Supabase）

#### スキーマ
```sql
-- care_receivers テーブル
CREATE TABLE public.care_receivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  code text NOT NULL,  -- 利用者ID（例: "AT", "User-001"）
  
  -- 匿名表示（常時可視）
  display_name text NOT NULL DEFAULT '',
  
  -- 個人識別情報
  full_name text,      -- 実名
  birthday date,       -- 生年月日
  gender text,         -- 性別
  
  -- 連絡先情報
  address text,        -- 住所
  phone text,          -- 電話番号
  emergency_contact text,  -- 緊急連絡先
  
  -- 医療情報
  medical_care_detail jsonb,  -- {tube_feeding: true, suctioning: true, ...}
  
  -- メタデータ
  notes text,
  version int NOT NULL DEFAULT 1,  -- 楽観ロック用
  updated_by uuid,     -- 最終編集者
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (service_id, code)
);

-- care_receiver_audits テーブル
CREATE TABLE public.care_receiver_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_receiver_id uuid NOT NULL REFERENCES public.care_receivers(id),
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_fields jsonb,  -- ["display_name", "medical_care_detail"]
  actor uuid,            -- auth.uid()
  created_at timestamptz NOT NULL DEFAULT now()
);

-- service_staff テーブル（権限管理）
CREATE TABLE public.service_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('staff', 'nurse', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, user_id)
);
```

### 5.2 API層（Next.js）

#### GET `/api/care-receivers/[id]`
```typescript
// ✅ 権限チェック後に、role に応じたフィールドのみ返す
const response = {
  id: careReceiver.id,
  display_name: careReceiver.display_name,  // 常時含む
  
  // staff/nurse/admin のみ
  ...(role !== 'anon' && {
    full_name: careReceiver.full_name,
    birthday: careReceiver.birthday,
    gender: careReceiver.gender,
  }),
  
  // nurse/admin のみ
  ...(role === 'nurse' || role === 'admin') && {
    medical_care_detail: careReceiver.medical_care_detail,
  }),
  
  // admin のみ
  ...(role === 'admin' && {
    address: careReceiver.address,
    phone: careReceiver.phone,
    emergency_contact: careReceiver.emergency_contact,
  }),
}

// ⚠️ ログに出す場合は、個人情報を除外
const sanitizedResponse = {
  id: response.id,
  display_name: response.display_name,
  version: careReceiver.version,
}
console.log('Fetched care receiver:', sanitizedResponse)  // ✅ OKログ
```

#### PUT `/api/care-receivers/[id]`
```typescript
// ✅ 権限チェック後に、role に応じた編集を許可
const userRole = await getUserRole(auth.uid(), careReceiver.service_id)

if (userRole === 'staff') {
  // display_name のみ編集可
  allowedFields = ['display_name']
} else if (userRole === 'nurse') {
  // 個人情報 + 医療情報は編集可
  allowedFields = ['display_name', 'full_name', 'birthday', 'gender', 'medical_care_detail', 'notes']
} else if (userRole === 'admin') {
  // 全フィールド編集可
  allowedFields = ['display_name', 'full_name', 'birthday', 'gender', 'address', 'phone', 'emergency_contact', 'medical_care_detail', 'notes']
}

// ⚠️ 監査ログ記録時は、値は含めず、フィールド名のみ
const changedFields = Object.keys(payload).filter(key => allowedFields.includes(key))
```

### 5.3 UI層（React）

#### EditCareReceiverDialog コンポーネント
```typescript
export function EditCareReceiverDialog({ careReceiver, userRole, isOpen, onClose, onSuccess }: Props) {
  // ① 権限に応じたフィールド表示制御
  const canEditPersonalInfo = ['staff', 'nurse', 'admin'].includes(userRole)
  const canEditMedicalInfo = ['nurse', 'admin'].includes(userRole)
  const canEditContactInfo = userRole === 'admin'
  
  // ② フォームレンダリング時に権限チェック
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* display_name は常時表示・編集可 */}
        <Field
          label="表示名"
          value={displayName}
          onChange={setDisplayName}
          disabled={false}
        />
        
        {canEditPersonalInfo && (
          <>
            <Field label="実名" value={fullName} onChange={setFullName} />
            <Field label="生年月日" value={birthday} onChange={setBirthday} />
          </>
        )}
        
        {canEditMedicalInfo && (
          <FieldGroup label="医療情報">
            <Checkbox label="経管栄養" checked={medicalTubeFeed} onChange={setMedicalTubeFeed} />
            <Checkbox label="吸引対応" checked={medicalSuctioning} onChange={setMedicalSuctioning} />
          </FieldGroup>
        )}
        
        {canEditContactInfo && (
          <>
            <Field label="住所" value={address} onChange={setAddress} />
            <Field label="電話" value={phone} onChange={setPhone} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

---

## 6. ログ出力ルール

### 6.1 禁止事項

| ❌ 禁止 | 理由 | 例 |
|---------|------|-----|
| Console.log に個人情報を出す | GitHub や Chat に漏れる | `console.log('User:', careReceiver)` |
| API Response に個人情報を含める | Network タブで見える | `res.json({ full_name, address })` |
| Migration や Seed に実名を入れる | コミット履歴に残る | `INSERT INTO care_receivers (full_name) VALUES ('山田太郎')` |
| エラーメッセージに個人情報を含める | ユーザーに見える | `"User 太郎 already exists"` |

### 6.2 推奨ルール

| ✅ 推奨 | 例 |
|--------|-----|
| Sanitized response をログに出す | `console.log('Updated:', { id, version, display_name })` |
| エラーメッセージは一般的に | `"User already exists"` |
| 個人情報は Supabase に保存のみ | DB には記録、Console には出さない |
| 監査ログには変更されたフィールド名のみ | `['full_name', 'medical_care_detail']` |

---

## 7. 本番環境での運用

### 7.1 環境別ポリシー

| 環境 | display_name | full_name 入力 | 監査ログ取得 |
|-----|------------|------------|-----------|
| **ローカル開発** | 匿名OK（"User-001"など） | **空欄推奨** | 自由 |
| **Preview** | 匿名OK（"User-001"など） | **空欄推奨** | 自由 |
| **本番** | 実名OK | **実名入力推奨** | 権限チェック（nurse/admin） |

### 7.2 本番デプロイ直前チェック

```bash
# 1. RLS ポリシー確認
npx supabase link --project-ref <project-id>
npx supabase db pull

# 2. migration 適用確認
SELECT * FROM information_schema.columns 
WHERE table_name = 'care_receivers' AND column_name IN ('full_name', 'medical_care_detail');

# 3. RLS テスト（anon ロールで full_name が見えないこと）
SET ROLE anon;
SELECT full_name FROM care_receivers LIMIT 1;  -- 期待: 0件

# 4. ログ出力確認（Console に個人情報が出ていないこと）
# → ブラウザの DevTools で確認
```

---

## 8. トラブルシューティング

| 問題 | 原因 | 対処 |
|-----|------|------|
| Console に full_name が出ている | API の sanitizeResponse が未実装 | API の PUT/GET で sanitizedResponse を使用 |
| staff が medical_detail を見られる | RLS ポリシーが不完全 | RLS で nurse/admin のみに制限 |
| 開発環境で実名が保存されている | 運用ポリシーが未周知 | 開発者に「開発環境では display_name のみ」を徹底 |
| 409 Conflict が頻発する | version カラムがない | migration を実行して version を追加 |

---

## まとめ

1. **display_name（匿名表示）** → 常時可視、ログ出力OK
2. **full_name + medical_detail（個人情報）** → 権限制限、ログ出力禁止
3. **RLS ポリシー** → staff/nurse/admin で段階的に制限
4. **監査ログ** → フィールド名のみ記録、値は含めない
5. **本番運用** → 実名は本番のみ、ログには一切出さない

このポリシーを遵守することで、医療機関として求められるセキュリティと利便性のバランスを実現できます。
