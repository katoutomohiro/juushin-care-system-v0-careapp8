# 個人惁E��セキュリチE��管琁E��画�E�ELAN_PERSONAL_INFO_SECURITY�E�E
> **対象**: 重忁E��ア支援アプリにおける個人惁E��管琁E�E設計�E実裁E��釁E 
> **更新日**: 2026年1朁E8日  
> **責任老E*: ChatGPT (設計責任) / チ�Eム (実裁E  
> **関連ドキュメンチE*: [PLAN_MASTER.md](./PLAN_MASTER.md)、[PLAN_CASE_RECORD.md](./PLAN_CASE_RECORD.md)、[PLAN_DEPLOY.md](./PLAN_DEPLOY.md)

---

## 1. 個人惁E��と表示名�E刁E��方釁E
### 1.1 基本設訁E
重忁E��アアプリでは、E*個人惁E��の可視性を権限と環墁E��応じて制御**するため、以下�Eように刁E��します、E
| カチE��リ | フィールド名 | 格納場所 | 表示条件 | 権限要件 | ログ出劁E|
|---------|-----------|--------|--------|---------|---------|
| **匿名表示�E�常時可視！E* | `display_name` | `care_receivers.display_name` | 全ペ�Eジ�E�リスト、詳細�E�E| 認証ユーザー | ✁E可 |
| **個人識別惁E���E�制限付き�E�E* | `full_name`, `birthday`, `gender` | `care_receivers.*` | 詳細ペ�Eジ�E�編雁E��のみ | staff/nurse/admin | ❁E禁止 |
| **連絡先情報�E�制限付き�E�E* | `address`, `phone`, `emergency_contact` | `care_receivers.*` | 詳細ペ�Eジ�E�編雁E��のみ | admin/nurse | ❁E禁止 |
| **医療情報�E�最高制限！E* | `medical_care_detail` (JSONB) | `care_receivers.*` | 詳細ペ�Eジ�E�編雁E��のみ | nurse/admin | ❁E禁止 |

### 1.2 表示名！Eisplay_name�E��E役割

- **用送E*: リスト画面、日誌、ケース記録、A4シートなど、�Eペ�Eジで利用老E��識別
- **例示値**: "AT"、EUser-001"、E田中�E�匿名！E
- **変更時期**: 新規作�E時に設定、編雁E��能
- **ログ出劁E*: Console / Network タチE/ 監査ログで表示OK
- **本番運用**: 実名でも匿名でも可�E�施設の運用方針に従う�E�E
### 1.3 実名�E�Eull_name�E��E取り扱ぁE
- **用送E*: 利用老E��細ペ�Eジで「詳細惁E��編雁E��ダイアログにのみ表示
- **ログ出劁E*: **絶対禁止**�E�Eonsole, API Response Log, Network タブに出さなぁE��E- **開発環墁E*: 入力不要E��空欁E�Eまま�E�E- **本番環墁E*: 忁E��に応じて入力（佁E��ログには一刁E�EさなぁE��E- **Supabase RLS**: Staff/Nurse/Admin ロール以外�E SELECT 不可

---

## 2. RLS�E�Eow Level Security�E�による権限管琁E
### 2.1 ロール定義と権限�Eトリクス

| ロール吁E| Supabase Role | 説昁E| display_name | full_name | medical_detail | 監査ログ |
|---------|---------------|------|-------------|----------|----------------|---------|
| **anon** | anon | 認証未実施 | ❁E| ❁E| ❁E| ❁E|
| **staff** | authenticated+service_staff | 介護職員 | ✁E| ✁E読み取り | ✁E読み取り | ✁E読み取り |
| **nurse** | authenticated+service_nurse | 看護師 | ✁E| ✁E読み取り/編雁E| ✁E読み取り/編雁E| ✁E読み取り/編雁E|
| **admin** | authenticated+service_admin | サービス責任老E| ✁E| ✁E読み取り/編雁E| ✁E読み取り/編雁E| ✁E読み取り/編雁E|

### 2.2 RLS ポリシー実裁E
```sql
-- ① anon: care_receivers を�Eて拒否
CREATE POLICY "anon_deny_all" ON public.care_receivers
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ② staff: 自刁E�Eサービスに属する利用老E�Eみ閲覧
--    �E�Eull_name などの個人惁E��は SELECT 対象外！ECREATE POLICY "staff_view_care_receivers" ON public.care_receivers
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

-- ③ nurse: 自刁E�Eサービスに属する利用老E�Eみ閲覧・編雁E--    �E�Eedical_care_detail は編雁E��能�E�ECREATE POLICY "nurse_update_care_receivers" ON public.care_receivers
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

-- ④ admin: サービス冁E�E全利用老E��読み取り・編雁ECREATE POLICY "admin_full_access_care_receivers" ON public.care_receivers
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

### 2.3 列レベルセキュリチE���E�Eolumn RLS�E�E
```sql
-- ① staff: full_name, address, phone は見えなぁE-- �E�Eupabase RLS では難しいため、API レスポンスレベルで実裁E��E
-- ② nurse: 全列見える（佁E��ログに出さなぁE��E
-- ③ admin: 全列見える（佁E��ログに出さなぁE��E```

**注**: Supabase の RLS は行レベルのため、�Eレベルの制限�E API レスポンスでサニタイズする、E
---

## 3. UI段階表示設訁E
### 3.1 リスト画面�E�Esers list�E�E
```
┌─ サービス詳細 ─────────────────────────────━E━E 利用老E��覧                                 ━E├──────────────────────────────────────────┤
━E ▢ display_name: "AT"          (匿名OK)  ━E ↁE全員表示
━E ▢ display_name: "User-001"             ━E ↁE全員表示
━E ▢ display_name: "田中太郁E             ━E ↁE表示名を実名にした侁E━E                                         ━E━E 👤: full_name/birthday/address は       ━E ↁE非表示
━E     非表示�E�詳細ペ�Eジで表示�E�E          ━E└──────────────────────────────────────────━E```

### 3.2 利用老E��細ペ�Eジ�E�Eser profile�E�E
```
┌─ 利用老E��細 ─────────────────────────────━E━E 表示名！Eisplay_name�E�E                  ━E ↁE常時表示
━E 🔒 詳細惁E��を編雁E[ボタン]               ━E ↁE権限チェチE��征E├──────────────────────────────────────────┤
━E 基本惁E��                                  ━E━E ━E生年月日: 2000-01-01    [staff/nurse] ━E ↁEダイアログ冁E�Eみ
━E ━E性別: 男性              [staff/nurse] ━E ↁEダイアログ冁E�Eみ
━E ━E実名: (非表示)          [staff/nurse] ━E ↁEダイアログ冁E�Eみ
━E                                         ━E━E 連絡先情報�E�管琁E��E�Eみ�E�E                ━E━E ━E住所: (非表示)          [admin only]  ━E ↁEダイアログ冁E�Eみ
━E ━E電話: (非表示)          [admin only]  ━E ↁEダイアログ冁E�Eみ
━E ━E緊急連絡允E (非表示)    [admin only]  ━E ↁEダイアログ冁E�Eみ
━E                                         ━E━E 医療情報�E�看護師のみ�E�E                  ━E━E ━E経管栁E��E ✁E            [nurse only]  ━E ↁEダイアログ冁E�Eみ
━E ━E吸引対忁E ✁E            [nurse only]  ━E ↁEダイアログ冁E�Eみ
└──────────────────────────────────────────━E```

### 3.3 編雁E��イアログ冁E��示フロー

```
ユーザーが「詳細惁E��を編雁E���EタンをクリチE��
    ↁEauth.uid() で権限取征E    ↁEservice_staff チE�Eブルから role を確誁E    ↁE┌─ role ぁE"staff" の場吁E━E ━Edisplay_name: ✁E編雁E��
━E ━Efull_name: ✁E表示・読み取り
━E ━Ebirthday: ✁E表示・読み取り
━E ━Egender: ✁E表示・読み取り
━E ━Eaddress, phone, medical_detail: ❁E非表示
━E├─ role ぁE"nurse" の場吁E━E ━Edisplay_name: ✁E編雁E��
━E ━Efull_name: ✁E編雁E��
━E ━Ebirthday: ✁E編雁E��
━E ━Egender: ✁E編雁E��
━E ━Emedical_care_detail: ✁E編雁E��
━E ━Eaddress, phone: ❁E非表示
━E└─ role ぁE"admin" の場吁E   ━E全フィールチE ✁E表示・編雁E��
   ━E�E�佁E��ログには出さなぁE��E```

---

## 4. 編雁E�E更新履歴方釁E
### 4.1 監査ログ�E�Eare_receiver_audits�E��E記録冁E��

```sql
INSERT INTO care_receiver_audits (
  care_receiver_id,
  action,
  changed_fields,  -- JSONB 配�E: ["display_name", "medical_care_detail"]
  actor
) VALUES (
  'care_receiver_uuid',
  'update',
  '["display_name", "medical_care_detail"]'::jsonb,
  'editor_user_id'
)
```

**重要E*: `changed_fields` には**フィールド名のみ**記録し、変更されぁE*値は含めなぁE*、E
### 4.2 表示権限による監査ログ閲覧制陁E
| ロール | 監査ログ閲覧 | 備老E|
|--------|----------|------|
| anon | ❁E不可 | |
| staff | ❁E不可 | |
| nurse | ✁E可 | 同じサービス冁E�Eみ |
| admin | ✁E可 | 全サービス�E�又はサービス冁E��E|

### 4.3 更新履歴の表示UI

```
┌─ 更新履歴タチE───────────────────────────━E━E 2026-01-28 14:30  admin: display_name 更新
━E 2026-01-28 13:15  nurse: medical_detail 更新
━E 2026-01-27 09:00  staff: (表示権限なぁE
━E━E ⓁE個人惁E��の変更冁E��は、セキュリチE��丁E━E   表示されません
└──────────────────────────────────────────━E```

---

## 5. 技術実裁E�E詳細

### 5.1 DB層�E�Eupabase�E�E
#### スキーチE```sql
-- care_receivers チE�Eブル
CREATE TABLE public.care_receivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  code text NOT NULL,  -- 利用老ED�E�侁E "AT", "User-001"�E�E  
  -- 匿名表示�E�常時可視！E  display_name text NOT NULL DEFAULT '',
  
  -- 個人識別惁E��
  full_name text,      -- 実名
  birthday date,       -- 生年月日
  gender text,         -- 性別
  
  -- 連絡先情報
  address text,        -- 住所
  phone text,          -- 電話番号
  emergency_contact text,  -- 緊急連絡允E  
  -- 医療情報
  medical_care_detail jsonb,  -- {tube_feeding: true, suctioning: true, ...}
  
  -- メタチE�Eタ
  notes text,
  version int NOT NULL DEFAULT 1,  -- 楽観ロチE��用
  updated_by uuid,     -- 最終編雁E��E  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (service_id, code)
);

-- care_receiver_audits チE�Eブル
CREATE TABLE public.care_receiver_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_receiver_id uuid NOT NULL REFERENCES public.care_receivers(id),
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_fields jsonb,  -- ["display_name", "medical_care_detail"]
  actor uuid,            -- auth.uid()
  created_at timestamptz NOT NULL DEFAULT now()
);

-- service_staff チE�Eブル�E�権限管琁E��ECREATE TABLE public.service_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('staff', 'nurse', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, user_id)
);
```

### 5.2 API層�E�Eext.js�E�E
#### GET `/api/care-receivers/[id]`
```typescript
// ✁E権限チェチE��後に、role に応じたフィールド�Eみ返す
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

// ⚠�E�Eログに出す場合�E、個人惁E��を除夁Econst sanitizedResponse = {
  id: response.id,
  display_name: response.display_name,
  version: careReceiver.version,
}
console.log('Fetched care receiver:', sanitizedResponse)  // ✁EOKログ
```

#### PUT `/api/care-receivers/[id]`
```typescript
// ✁E権限チェチE��後に、role に応じた編雁E��許可
const userRole = await getUserRole(auth.uid(), careReceiver.service_id)

if (userRole === 'staff') {
  // display_name のみ編雁E��
  allowedFields = ['display_name']
} else if (userRole === 'nurse') {
  // 個人惁E�� + 医療情報は編雁E��
  allowedFields = ['display_name', 'full_name', 'birthday', 'gender', 'medical_care_detail', 'notes']
} else if (userRole === 'admin') {
  // 全フィールド編雁E��
  allowedFields = ['display_name', 'full_name', 'birthday', 'gender', 'address', 'phone', 'emergency_contact', 'medical_care_detail', 'notes']
}

// ⚠�E�E監査ログ記録時�E、値は含めず、フィールド名のみ
const changedFields = Object.keys(payload).filter(key => allowedFields.includes(key))
```

### 5.3 UI層�E�Eeact�E�E
#### EditCareReceiverDialog コンポ�EネンチE```typescript
export function EditCareReceiverDialog({ careReceiver, userRole, isOpen, onClose, onSuccess }: Props) {
  // ① 権限に応じたフィールド表示制御
  const canEditPersonalInfo = ['staff', 'nurse', 'admin'].includes(userRole)
  const canEditMedicalInfo = ['nurse', 'admin'].includes(userRole)
  const canEditContactInfo = userRole === 'admin'
  
  // ② フォームレンダリング時に権限チェチE��
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* display_name は常時表示・編雁E�� */}
        <Field
          label="表示吁E
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
            <Checkbox label="経管栁E��E checked={medicalTubeFeed} onChange={setMedicalTubeFeed} />
            <Checkbox label="吸引対忁E checked={medicalSuctioning} onChange={setMedicalSuctioning} />
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

### 6.1 禁止事頁E
| ❁E禁止 | 琁E�� | 侁E|
|---------|------|-----|
| Console.log に個人惁E��を�EぁE| GitHub めEChat に漏れめE| `console.log('User:', careReceiver)` |
| API Response に個人惁E��を含める | Network タブで見えめE| `res.json({ full_name, address })` |
| Migration めESeed に実名を�Eれる | コミット履歴に残る | `INSERT INTO care_receivers (full_name) VALUES ('山田太郁E)` |
| エラーメチE��ージに個人惁E��を含める | ユーザーに見えめE| `"User 太郁Ealready exists"` |

### 6.2 推奨ルール

| ✁E推奨 | 侁E|
|--------|-----|
| Sanitized response をログに出ぁE| `console.log('Updated:', { id, version, display_name })` |
| エラーメチE��ージは一般皁E�� | `"User already exists"` |
| 個人惁E��は Supabase に保存�Eみ | DB には記録、Console には出さなぁE|
| 監査ログには変更されたフィールド名のみ | `['full_name', 'medical_care_detail']` |

---

## 7. 本番環墁E��の運用

### 7.1 環墁E��ポリシー

| 環墁E| display_name | full_name 入劁E| 監査ログ取征E|
|-----|------------|------------|-----------|
| **ローカル開発** | 匿名OK�E�EUser-001"など�E�E| **空欁E��奨** | 自由 |
| **Preview** | 匿名OK�E�EUser-001"など�E�E| **空欁E��奨** | 自由 |
| **本番** | 実名OK | **実名入力推奨** | 権限チェチE���E�Eurse/admin�E�E|

### 7.2 本番チE�Eロイ直前チェチE��

```bash
# 1. RLS ポリシー確誁Enpx supabase link --project-ref <project-id>
npx supabase db pull

# 2. migration 適用確誁ESELECT * FROM information_schema.columns 
WHERE table_name = 'care_receivers' AND column_name IN ('full_name', 'medical_care_detail');

# 3. RLS チE��ト！Enon ロールで full_name が見えなぁE��と�E�ESET ROLE anon;
SELECT full_name FROM care_receivers LIMIT 1;  -- 期征E 0件

# 4. ログ出力確認！Eonsole に個人惁E��が�EてぁE��ぁE��と�E�E# ↁEブラウザの DevTools で確誁E```

---

## 8. トラブルシューチE��ング

| 問顁E| 原因 | 対処 |
|-----|------|------|
| Console に full_name が�EてぁE�� | API の sanitizeResponse が未実裁E| API の PUT/GET で sanitizedResponse を使用 |
| staff ぁEmedical_detail を見られる | RLS ポリシーが不完�E | RLS で nurse/admin のみに制陁E|
| 開発環墁E��実名が保存されてぁE�� | 運用ポリシーが未周知 | 開発老E��「開発環墁E��は display_name のみ」を徹庁E|
| 409 Conflict が頻発する | version カラムがなぁE| migration を実行して version を追加 |

---

## まとめE
1. **display_name�E�匿名表示�E�E* ↁE常時可視、ログ出力OK
2. **full_name + medical_detail�E�個人惁E���E�E* ↁE権限制限、ログ出力禁止
3. **RLS ポリシー** ↁEstaff/nurse/admin で段階的に制陁E4. **監査ログ** ↁEフィールド名のみ記録、値は含めなぁE5. **本番運用** ↁE実名は本番のみ、ログには一刁E�EさなぁE
こ�Eポリシーを�E守することで、医療機関として求められるセキュリチE��と利便性のバランスを実現できます、E
