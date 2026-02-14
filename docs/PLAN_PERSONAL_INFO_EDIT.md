# PLAN: 蛟倶ｺｺ諠・ｱ邱ｨ髮・・霑ｽ蜉繝ｻ菫晏ｭ俶ｩ溯・縺ｮ螳溯｣・

## 搭 讎りｦ・

**閭梧勹**:
- 迴ｾ蝨ｨ縲∝茜逕ｨ閠・錐縺ｯ繝励Λ繧､繝舌す繝ｼ菫晁ｭｷ縺ｮ縺溘ａ `display_name`・医い繝ｫ繝輔ぃ繝吶ャ繝郁｡ｨ遉ｺ: "A繝ｻT", "I繝ｻK" 縺ｪ縺ｩ・峨・縺ｿ縺ｧ陦ｨ遉ｺ
- 縺溘□縺励∝ｮ滄°逕ｨ縺ｧ縺ｯ縲梧悽蜷阪・菴乗園繝ｻ騾｣邨｡蜈医・蛹ｻ逋よュ蝣ｱ縺ｮ霑ｽ蜉譖ｴ譁ｰ縲阪′蠢・ｻ郢√↓逋ｺ逕・
- **隕∽ｻｶ**: 繧｢繝励Μ蜀・〒蛟倶ｺｺ諠・ｱ繧貞ｮ牙・縺ｫ邱ｨ髮・・霑ｽ蜉繝ｻ菫晏ｭ倥〒縺阪ｋ繧医≧縺ｫ縺励◆縺・

**逶ｮ逧・*:
- DB 縺ｫ `full_name`・域悽蜷搾ｼ峨ｒ蜷ｫ繧蛟倶ｺｺ諠・ｱ繧ｫ繝ｩ繝繧定ｿｽ蜉
- 逕ｻ髱｢陦ｨ遉ｺ縺ｯ蠑輔″邯壹″ `display_name` 繧貞渕譛ｬ縺ｫ縲∬ｩｳ邏ｰ逕ｻ髱｢縺ｧ `full_name` 遲峨ｒ髢ｲ隕ｧ繝ｻ邱ｨ髮・庄閭ｽ縺ｫ
- Role・・dmin/nurse/staff/anon・峨↓蠢懊§縺溯｡ｨ遉ｺ繝ｻ邱ｨ髮・ｨｩ髯舌・蛻・屬
- 逶｣譟ｻ繝ｭ繧ｰ讖溯・縺ｮ貅門ｙ・郁ｪｰ縺後＞縺､螟画峩縺励◆縺玖ｨ倬鹸・・

---

## 識 螳溯｣・ヵ繧ｧ繝ｼ繧ｺ

### Phase 1: DB + API・亥ｿ・茨ｼ・

#### 1.1 Supabase Migration: care_receivers 繝・・繝悶Ν諡｡蠑ｵ

```sql
-- 20260202_add_personal_info_columns.sql
ALTER TABLE care_receivers
ADD COLUMN IF NOT EXISTS full_name TEXT,         -- 譛ｬ蜷搾ｼ亥倶ｺｺ諠・ｱ・・
ADD COLUMN IF NOT EXISTS birthday DATE,          -- 逕溷ｹｴ譛域律
ADD COLUMN IF NOT EXISTS address TEXT,           -- 菴乗園
ADD COLUMN IF NOT EXISTS phone TEXT,             -- 髮ｻ隧ｱ逡ｪ蜿ｷ
ADD COLUMN IF NOT EXISTS emergency_contact TEXT, -- 邱頑･騾｣邨｡蜈・
ADD COLUMN IF NOT EXISTS notes TEXT,             -- 閾ｪ逕ｱ險倩ｿｰ繝｡繝｢
ADD COLUMN IF NOT EXISTS medical_care_detail JSONB, -- 蛹ｻ逋ら噪繧ｱ繧｢隧ｳ邏ｰ
ADD COLUMN IF NOT EXISTS updated_by UUID,       -- 邱ｨ髮・・ｼ・LS逕ｨ・・
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 繧､繝ｳ繝・ャ繧ｯ繧ｹ菴懈・・域､懃ｴ｢諤ｧ閭ｽ蜷台ｸ奇ｼ・
CREATE INDEX IF NOT EXISTS idx_care_receivers_updated_at 
  ON care_receivers(updated_at DESC);
```

#### 1.2 RLS・郁｡後Ξ繝吶Ν繧ｻ繧ｭ繝･繝ｪ繝・ぅ・峨・繝ｪ繧ｷ繝ｼ

```sql
-- 20260203_add_personal_info_rls.sql

-- 蝓ｺ譛ｬ: 蜈ｨ蜩｡縺・display_name 繧帝夢隕ｧ蜿ｯ閭ｽ・域里蟄倥・繝ｪ繧ｷ繝ｼ邯咏ｶ夲ｼ・
-- 譁ｰ隕・ full_name 遲峨・ role 縺ｫ蠢懊§縺滄夢隕ｧ蛻ｶ髯・

-- Policy 1: anon 縺ｯ display_name 縺ｮ縺ｿ隱ｭ縺ｿ蜿悶ｊ蜿ｯ閭ｽ
CREATE POLICY "anon_view_display_name" ON public.care_receivers
  FOR SELECT
  TO anon
  USING (true);
  -- SELECT 縺ｧ縺ｯ display_name 縺ｮ縺ｿ霑斐☆・・IEW 縺・SELECT 縺ｧ蛻怜宛髯撰ｼ・

-- Policy 2: staff 縺ｯ display_name + medical_care_detail 隱ｭ縺ｿ蜿悶ｊ蜿ｯ閭ｽ縲∫ｷｨ髮・ｸ榊庄
CREATE POLICY "staff_view_care_details" ON public.care_receivers
  FOR SELECT
  TO staff
  USING (facility_id IN (
    SELECT facility_id FROM public.staff_profiles 
    WHERE id = auth.uid()
  ));

-- Policy 3: nurse/admin 縺ｯ蜈ｨ繧ｫ繝ｩ繝隱ｭ縺ｿ蜿悶ｊ蜿ｯ閭ｽ縲∫ｷｨ髮・庄閭ｽ
CREATE POLICY "nurse_admin_edit_personal_info" ON public.care_receivers
  FOR UPDATE
  TO authenticated
  USING (
    -- UPDATE 蜑肴署譚｡莉ｶ: nurse 縺ｾ縺溘・ admin role
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('nurse', 'admin')
    AND facility_id IN (
      SELECT facility_id FROM public.staff_profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- UPDATE 蠕後・蛟､繧ょ酔縺俶擅莉ｶ縺ｧ繝√ぉ繝・け
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('nurse', 'admin')
  );

-- Policy 4: 隱ｰ縺檎ｷｨ髮・＠縺溘°險倬鹸・医ヨ繝ｪ繧ｬ繝ｼ・・
CREATE OR REPLACE FUNCTION update_care_receiver_audit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trig_care_receiver_audit
  BEFORE UPDATE ON care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION update_care_receiver_audit();
```

#### 1.3 API 繧ｨ繝ｳ繝峨・繧､繝ｳ繝・

**譌｢蟄・*:
- `PATCH /api/care-receivers/[id]` 縺ｧ `display_name` 譖ｴ譁ｰ貂医∩

**諡｡蠑ｵ**:
```typescript
// api/care-receivers/[id]/route.ts (PATCH)

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req); // auth check
  const { id } = await context.params;

  // role check: nurse/admin 縺ｮ縺ｿ蜈ｨ鬆・岼譖ｴ譁ｰ蜿ｯ
  if (!['nurse', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: personal info edit requires nurse/admin role' },
      { status: 403 }
    );
  }

  const body = await req.json();
  
  // Validate (Zod)
  const schema = z.object({
    display_name: z.string().optional(),
    full_name: z.string().optional(),
    birthday: z.string().date().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    emergency_contact: z.string().optional(),
    notes: z.string().optional(),
    medical_care_detail: z.record(z.any()).optional(),
  });

  const validated = schema.parse(body);

  // Supabase 縺ｧ譖ｴ譁ｰ・・LS 縺瑚・蜍輔メ繧ｧ繝・け・・
  const { data, error } = await supabase
    .from('care_receivers')
    .update(validated)
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, careReceiver: data[0] });
}
```

---

### Phase 2: UI・医い繧ｯ繧ｻ繧ｷ繝薙Μ繝・ぅ・・

#### 2.1 EditCareReceiverDialog 繧ｳ繝ｳ繝昴・繝阪Φ繝域僑蠑ｵ

```tsx
// components/edit-care-receiver-dialog.tsx

type Props = {
  careReceiver: CareReceiverData;
  userRole?: 'staff' | 'nurse' | 'admin' | 'anon';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditCareReceiverDialog({ 
  careReceiver, 
  userRole = 'staff',
  isOpen, 
  onClose, 
  onSuccess 
}: Props) {
  const [formData, setFormData] = useState({
    display_name: careReceiver.display_name || '',
    full_name: careReceiver.full_name || '',      // 竊・譁ｰ隕・
    birthday: careReceiver.birthday || '',         // 竊・譁ｰ隕・
    address: careReceiver.address || '',           // 竊・譁ｰ隕・
    phone: careReceiver.phone || '',               // 竊・譁ｰ隕・
    emergency_contact: careReceiver.emergency_contact || '', // 竊・譁ｰ隕・
    notes: careReceiver.notes || '',
    medical_care_detail: careReceiver.medical_care_detail || {},
  });

  // 讓ｩ髯舌↓蠢懊§縺溯｡ｨ遉ｺ蛻ｶ蠕｡
  const canEditPersonalInfo = ['nurse', 'admin'].includes(userRole);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>蛻ｩ逕ｨ閠・ュ蝣ｱ繧堤ｷｨ髮・/DialogTitle>
        </DialogHeader>

        {/* 陦ｨ遉ｺ蜷搾ｼ亥・蜩｡陦ｨ遉ｺ蜿ｯ・・*/}
        <div>
          <Label htmlFor="display_name">陦ｨ遉ｺ蜷搾ｼ亥諺蜷崎｡ｨ遉ｺ逕ｨ・・/Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="萓・ A繝ｻT, User-001"
          />
        </div>

        {/* 譛ｬ蜷搾ｼ・urse/admin 縺ｮ縺ｿ陦ｨ遉ｺ繝ｻ邱ｨ髮・ｼ・*/}
        {canEditPersonalInfo && (
          <div>
            <Label htmlFor="full_name">譛ｬ蜷・/Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="萓・ 螻ｱ逕ｰ 螟ｪ驛・
              disabled={userRole === 'staff'} // staff 縺ｯ隱ｭ縺ｿ蜿悶ｊ蟆ら畑
            />
          </div>
        )}

        {/* 逕溷ｹｴ譛域律・・urse/admin 縺ｮ縺ｿ・・*/}
        {canEditPersonalInfo && (
          <div>
            <Label htmlFor="birthday">逕溷ｹｴ譛域律</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              disabled={userRole === 'staff'}
            />
          </div>
        )}

        {/* 菴乗園・・dmin 縺ｮ縺ｿ・・*/}
        {userRole === 'admin' && (
          <div>
            <Label htmlFor="address">菴乗園</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="譚ｱ莠ｬ驛ｽ貂玖ｰｷ蛹ｺ..."
            />
          </div>
        )}

        {/* 髮ｻ隧ｱ繝ｻ邱頑･騾｣邨｡蜈茨ｼ・dmin 縺ｮ縺ｿ・・*/}
        {userRole === 'admin' && (
          <>
            <div>
              <Label htmlFor="phone">髮ｻ隧ｱ逡ｪ蜿ｷ</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact">邱頑･騾｣邨｡蜈・/Label>
              <Textarea
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              />
            </div>
          </>
        )}

        {/* 繝｡繝｢繝ｻ蛹ｻ逋よュ蝣ｱ縺ｯ蜈ｨ蜩｡陦ｨ遉ｺ */}
        <div>
          <Label htmlFor="notes">繝｡繝｢</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* 菫晏ｭ倥・繧ｿ繝ｳ */}
        <Button onClick={handleSubmit} disabled={!canEditPersonalInfo}>
          {canEditPersonalInfo ? '菫晏ｭ・ : '陦ｨ遉ｺ縺ｮ縺ｿ'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.2 蛻ｩ逕ｨ閠・ｩｳ邏ｰ繝壹・繧ｸ縺ｸ縺ｮ繝ｪ繝ｳ繧ｯ

```tsx
// app/services/[serviceId]/users/[userId]/page.tsx

// 隧ｳ邏ｰ諠・ｱ邱ｨ髮・・繧ｿ繝ｳ繧定ｿｽ蜉
<Button onClick={() => setIsEditDialogOpen(true)}>
  隧ｳ邏ｰ諠・ｱ繧堤ｷｨ髮・
</Button>
```

---

### Phase 3: 繝・せ繝茨ｼ域､懆ｨｼ・・

#### 3.1 Unit 繝・せ繝・

```typescript
// tests/unit/personal-info-edit.spec.ts

describe('EditCareReceiverDialog', () => {
  it('anon/staff 縺ｯ full_name 繝輔ぅ繝ｼ繝ｫ繝峨ｒ隕九∴縺ｪ縺・, () => {
    // render with userRole='staff'
    // expect full_name input to not be visible
  });

  it('nurse/admin 縺ｯ full_name 繧堤ｷｨ髮・庄閭ｽ', () => {
    // render with userRole='admin'
    // expect full_name input to be enabled
    // expect handleSubmit to include full_name in request
  });

  it('admin 縺ｮ縺ｿ address/phone 繧堤ｷｨ髮・庄閭ｽ', () => {
    // userRole='nurse' 竊・address hidden
    // userRole='admin' 竊・address visible & editable
  });
});
```

#### 3.2 E2E 繝・せ繝茨ｼ・laywright・・

```typescript
// tests/e2e/personal-info-edit.spec.ts

test('admin 縺悟茜逕ｨ閠・・譛ｬ蜷阪・菴乗園繧堤ｷｨ髮・・菫晏ｭ倥〒縺阪ｋ', async ({ page }) => {
  // 1. admin 縺ｧ繝ｭ繧ｰ繧､繝ｳ
  await login(page, 'admin@example.com', 'password');

  // 2. 蛻ｩ逕ｨ閠・ｩｳ邏ｰ繝壹・繧ｸ縺ｸ遘ｻ蜍・
  await page.goto('/services/life-care/users/AT');

  // 3. 縲瑚ｩｳ邏ｰ諠・ｱ繧堤ｷｨ髮・阪・繧ｿ繝ｳ繧偵け繝ｪ繝・け
  await page.click('button:has-text("隧ｳ邏ｰ諠・ｱ繧堤ｷｨ髮・)');

  // 4. full_name 繧貞・蜉・
  await page.fill('#full_name', '螻ｱ逕ｰ螟ｪ驛・);

  // 5. address 繧貞・蜉・
  await page.fill('#address', '譚ｱ莠ｬ驛ｽ貂玖ｰｷ蛹ｺ');

  // 6. 菫晏ｭ倥・繧ｿ繝ｳ繧偵け繝ｪ繝・け
  await page.click('button:has-text("菫晏ｭ・)');

  // 7. 謌仙粥繝｡繝・そ繝ｼ繧ｸ繧堤｢ｺ隱・
  await expect(page.getByText('菫晏ｭ倥＠縺ｾ縺励◆')).toBeVisible();

  // 8. Supabase 縺ｫ螳滄圀縺ｫ菫晏ｭ倥＆繧後◆縺狗｢ｺ隱・
  // SELECT full_name, address FROM care_receivers WHERE id = '...'
});
```

---

## 統 螳溯｣・メ繧ｧ繝・け繝ｪ繧ｹ繝・

### DB/API
- [ ] Supabase migration: care_receivers 縺ｫ full_name/birthday/address/phone/emergency_contact/notes/medical_care_detail 繧定ｿｽ蜉
- [ ] RLS 繝昴Μ繧ｷ繝ｼ: role 縺ｫ蠢懊§縺溯｡後ヵ繧｣繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ + 蛻励・繧ｹ繧ｭ繝ｳ繧ｰ
- [ ] 逶｣譟ｻ繝医Μ繧ｬ繝ｼ: updated_by/updated_at 繧定・蜍戊ｨ倬鹸
- [ ] API 繧ｨ繝ｳ繝峨・繧､繝ｳ繝・ PATCH /api/care-receivers/[id] 縺ｫ蛟倶ｺｺ諠・ｱ繧貞性繧√ｋ
- [ ] 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ: Zod 縺ｧ蝙九メ繧ｧ繝・け

### UI/UX
- [ ] EditCareReceiverDialog 縺ｫ new fields 繧定ｿｽ蜉
- [ ] 讓ｩ髯舌↓蠢懊§縺溯｡ｨ遉ｺ蛻ｶ蠕｡・・ole check・・
- [ ] 繧｢繧ｯ繧ｻ繧ｷ繝薙Μ繝・ぅ: `<label>` + `id` 縺ｧ a11y 蟇ｾ蠢・
- [ ] 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ: 403 Forbidden 繧堤判髱｢縺ｫ陦ｨ遉ｺ

### 繝・せ繝・
- [ ] Unit: form state management & role checks
- [ ] E2E: 螳滄圀縺ｮ菫晏ｭ倥・繝ｪ繝ｭ繝ｼ繝牙ｾ後・陦ｨ遉ｺ遒ｺ隱・
- [ ] RLS: Supabase 縺ｧ role 繧貞・繧頑崛縺医※讓ｩ髯舌ユ繧ｹ繝・

### 繧ｻ繧ｭ繝･繝ｪ繝・ぅ
- [ ] 蛟倶ｺｺ諠・ｱ繧偵Ο繧ｰ縺ｫ蜃ｺ蜉帙＠縺ｪ縺・ｼ・og sanitization・・
- [ ] RLS 繧剃ｿ｡鬆ｼ縺励、PI 縺ｧ縺ｯ role check 縺ｮ縺ｿ螳滓命
- [ ] Supabase JWT 縺ｮ role claim 繧剃ｿ｡鬆ｼ

---

## 噫 谺｡縺ｮ繝悶Λ繝ｳ繝√〒縺ｮ菴懈･ｭ繝輔Ο繝ｼ

```bash
# 1. 譁ｰ縺励＞繝悶Λ繝ｳ繝√ｒ菴懈・
git checkout -b feat/personal-info-edit

# 2. Phase 1: DB/API 繧貞ｮ溯｣・
# - migration 繝輔ぃ繧､繝ｫ菴懈・
# - RLS 繝昴Μ繧ｷ繝ｼ險ｭ螳・
# - API route 螳溯｣・
# - lint/build 繝・せ繝・

# 3. Phase 2: UI 繧貞ｮ溯｣・
# - EditCareReceiverDialog 繧呈僑蠑ｵ
# - role check 繧定ｿｽ蜉
# - lint/build 繝・せ繝・

# 4. Phase 3: 繝・せ繝・
# - Unit + E2E 繝・せ繝・
# - 繝ｭ繝ｼ繧ｫ繝ｫ讀懆ｨｼ

# 5. PR 菴懈・ & 繝槭・繧ｸ
git push origin feat/personal-info-edit
gh pr create --title "feat: personal info editing with role-based access"
```

---

## 投 蜆ｪ蜈亥ｺｦ繝ｻ髮｣譏灘ｺｦ

| 繧ｿ繧ｹ繧ｯ | 蜆ｪ蜈亥ｺｦ | 髮｣譏灘ｺｦ | 隕狗ｩ肴凾髢・|
| --- | --- | --- | --- |
| Migration + RLS | 閥 蠢・・| 箝絶ｭ絶ｭ・| 2-3h |
| API 諡｡蠑ｵ | 閥 蠢・・| 箝絶ｭ・| 1-2h |
| UI 諡｡蠑ｵ | 泛 鬮・| 箝絶ｭ・| 1-2h |
| 繝・せ繝・| 泛 鬮・| 箝絶ｭ絶ｭ・| 2-3h |
| **蜷郁ｨ・* | - | - | **6-10h** |

---

## 東 萓晏ｭ倬未菫・

- Supabase RLS 繝昴Μ繧ｷ繝ｼ縺梧ｭ｣縺励￥讖溯・縺励※縺・ｋ縺薙→
- staff_profiles 縺ｫ role 諠・ｱ縺梧ｭ｣縺励￥險ｭ螳壹＆繧後※縺・ｋ縺薙→
- 譌｢蟄倥・ care-receivers CRUD API 縺梧ｭ｣蟶ｸ縺ｫ蜍穂ｽ懊＠縺ｦ縺・ｋ縺薙→

---

**譛邨よ峩譁ｰ**: 2026-01-29
**菴懈・閠・*: GitHub Copilot

