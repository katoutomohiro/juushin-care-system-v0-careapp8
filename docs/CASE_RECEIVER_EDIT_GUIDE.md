# 蛻ｩ逕ｨ閠・ュ蝣ｱ邱ｨ髮・ｩ溯・ - 螳溯｣・ぎ繧､繝・

## 讎りｦ・

縺薙・繝峨く繝･繝｡繝ｳ繝医・縲¨ext.js App Router + Supabase 繧剃ｽｿ逕ｨ縺励◆縲悟茜逕ｨ閠・ｼ・ase receiver・峨崎ｩｳ邏ｰ繝壹・繧ｸ縺ｮ**螳牙・縺ｪ邱ｨ髮・・譖ｴ譁ｰUI**縺ｮ螳溯｣・ｒ隱ｬ譏弱＠縺ｾ縺吶・

## 繧｢繝ｼ繧ｭ繝・け繝√Ε

### 1. **繝輔Ο繝ｳ繝医お繝ｳ繝会ｼ・eact 繧ｳ繝ｳ繝昴・繝阪Φ繝茨ｼ・*

#### 蛻ｩ逕ｨ閠・ｩｳ邏ｰ繝壹・繧ｸ
- **繝輔ぃ繧､繝ｫ**: `app/services/[serviceId]/users/[userId]/page.tsx`
- **讖溯・**:
  - 蛻ｩ逕ｨ閠・渕譛ｬ諠・ｱ縺ｮ陦ｨ遉ｺ
  - 縲檎ｷｨ髮・阪・繧ｿ繝ｳ・医・繝・ム繝ｼ蜿ｳ荳奇ｼ・
  - 邱ｨ髮・ム繧､繧｢繝ｭ繧ｰ縺ｮ蛻ｶ蠕｡

#### 邱ｨ髮・ム繧､繧｢繝ｭ繧ｰ繧ｳ繝ｳ繝昴・繝阪Φ繝・
- **繝輔ぃ繧､繝ｫ**: `components/edit-care-receiver-dialog.tsx`
- **讖溯・**:
  - 繝輔か繝ｼ繝蜈･蜉幢ｼ・ame, full_name, birthday, gender, address, phone, emergency_contact, notes・・
  - 讓ｩ髯舌・繝ｼ繧ｹ陦ｨ遉ｺ蛻ｶ蠕｡・・serRole: "staff" | "nurse" | "admin"・・
  - 螟画峩蜑榊ｾ後・蟾ｮ蛻・｡ｨ遉ｺ・育ｰ｡譏鍋沿・・
  - 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ・亥ｿ・医ヵ繧｣繝ｼ繝ｫ繝峨∵枚蟄玲焚繝√ぉ繝・け・・
  - 讌ｽ隕ｳ繝ｭ繝・け縺ｮ陦ｨ遉ｺ・・ersion 縺ｫ繧医ｋ遶ｶ蜷域､懷・・・

### 2. **繝舌ャ繧ｯ繧ｨ繝ｳ繝会ｼ・PI 繝ｫ繝ｼ繝茨ｼ・*

#### 蛻ｩ逕ｨ閠・峩譁ｰ API
- **繝輔ぃ繧､繝ｫ**: `app/api/care-receivers/[id]/route.ts`
- **繝｡繧ｽ繝・ラ**: `PUT /api/care-receivers/[id]`
- **讖溯・**:
  - Supabase 繧剃ｽｿ逕ｨ縺励◆譖ｴ譁ｰ
  - 柏 **讌ｽ隕ｳ繝ｭ繝・け**: `version` 繝輔ぅ繝ｼ繝ｫ繝峨ｒ菴ｿ逕ｨ縺励※縲∽ｻ悶・繝ｦ繝ｼ繧ｶ繝ｼ縺ｨ縺ｮ遶ｶ蜷医ｒ讀懷・
  - RLS・・ow Level Security・牙燕謠撰ｼ・upabase 繝昴Μ繧ｷ繝ｼ・・
  - 繧ｨ繝ｩ繝ｼ譎ゅ・驕ｩ蛻・↑繧ｹ繝・・繧ｿ繧ｹ繧ｳ繝ｼ繝芽ｿ泌唆・・09 Conflict, 400 Bad Request, 500 Internal Server Error・・

### 3. **繝・・繧ｿ繝吶・繧ｹ繧ｹ繧ｭ繝ｼ繝橸ｼ・upabase PostgreSQL・・*

繝・・繝悶Ν: `care_receivers`

```sql
CREATE TABLE care_receivers (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  display_name TEXT,
  full_name TEXT,           -- 蛟倶ｺｺ諠・ｱ・・taff 縺ｯ隱ｭ縺ｿ蜿悶ｊ蟆ら畑・・
  birthday DATE,            -- 蛟倶ｺｺ諠・ｱ・・taff 縺ｯ隱ｭ縺ｿ蜿悶ｊ蟆ら畑・・
  gender TEXT,
  address TEXT,             -- 蛟倶ｺｺ諠・ｱ・・dmin 縺ｮ縺ｿ・・
  phone TEXT,               -- 蛟倶ｺｺ諠・ｱ・・taff 縺ｯ隱ｭ縺ｿ蜿悶ｊ蟆ら畑・・
  emergency_contact TEXT,   -- 蛟倶ｺｺ諠・ｱ・・taff 縺ｯ隱ｭ縺ｿ蜿悶ｊ蟆ら畑・・
  notes TEXT,
  medical_care_detail JSONB,
  age INTEGER,
  care_level TEXT,
  condition TEXT,
  service_code TEXT,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1, -- 讌ｽ隕ｳ繝ｭ繝・け逕ｨ
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  updated_by TEXT,
  CONSTRAINT age_positive CHECK (age >= 0)
);
```

## 菴ｿ逕ｨ繝輔Ο繝ｼ

### 1. 蛻ｩ逕ｨ閠・ｩｳ邏ｰ繝壹・繧ｸ縺ｸ縺ｮ繧｢繧ｯ繧ｻ繧ｹ
```
/services/life-care/users/A%E3%83%BBT
```

### 2. 邱ｨ髮・・繧ｿ繝ｳ繧ｯ繝ｪ繝・け
- 繝壹・繧ｸ繝倥ャ繝繝ｼ蜿ｳ荳翫・縲檎ｷｨ髮・阪・繧ｿ繝ｳ繧偵け繝ｪ繝・け
- 蛻ｩ逕ｨ閠・・譛譁ｰ繝・・繧ｿ繧・Supabase 縺九ｉ蜿門ｾ・
- 邱ｨ髮・ム繧､繧｢繝ｭ繧ｰ繧帝幕縺・

### 3. 繝輔か繝ｼ繝邱ｨ髮・
- 陦ｨ遉ｺ蜷阪∝ｮ溷錐縲∫函蟷ｴ譛域律縲∵ｧ蛻･縲∽ｽ乗園縲・崕隧ｱ縲∫ｷ頑･騾｣邨｡蜈医√Γ繝｢繧堤ｷｨ髮・
- 讓ｩ髯舌↓蝓ｺ縺･縺・※陦ｨ遉ｺ/邱ｨ髮・庄閭ｽ縺ｪ繝輔ぅ繝ｼ繝ｫ繝峨′蛻ｶ髯舌＆繧後ｋ
  - **staff**: 陦ｨ遉ｺ蜷阪・縺ｿ邱ｨ髮・庄閭ｽ
  - **nurse**: 蝓ｺ譛ｬ諠・ｱ繧堤ｷｨ髮・庄閭ｽ
  - **admin**: 縺吶∋縺ｦ縺ｮ繝輔ぅ繝ｼ繝ｫ繝臥ｷｨ髮・庄閭ｽ

### 4. 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
- 蠢・医ヵ繧｣繝ｼ繝ｫ繝・ `display_name`・域怙蟆・譁・ｭ暦ｼ・
- 遨ｺ逋ｽ縺ｮ縺ｿ縺ｯ遖∵ｭ｢
- 蟷ｴ鮨｢: 0 莉･荳・

### 5. 菫晏ｭ・
- 縲御ｿ晏ｭ倥阪・繧ｿ繝ｳ繧偵け繝ｪ繝・け
- 繝ｪ繧ｯ繧ｨ繧ｹ繝医・繝・ぅ縺ｫ `version` 繧貞性繧√ｋ・域･ｽ隕ｳ繝ｭ繝・け逕ｨ・・
- API 繝ｬ繧ｹ繝昴Φ繧ｹ縺ｮ遒ｺ隱・
  - **謌仙粥 (200)**: 繝医・繧ｹ繝郁｡ｨ遉ｺ縲娯怛 蛻ｩ逕ｨ閠・ュ蝣ｱ繧呈峩譁ｰ縺励∪縺励◆縲・
  - **409 Conflict**: 縲娯國・・莉悶・繝ｦ繝ｼ繧ｶ繝ｼ縺悟・縺ｫ譖ｴ譁ｰ縺励※縺・∪縺吶・竊・繝壹・繧ｸ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ
  - **繧ｨ繝ｩ繝ｼ (400/500)**: 縲娯搆 菫晏ｭ倥お繝ｩ繝ｼ縲・+ 隧ｳ邏ｰ繝｡繝・そ繝ｼ繧ｸ

## 繧ｻ繧ｭ繝･繝ｪ繝・ぅ險ｭ險・

### 1. **RLS・・ow Level Security・・*
Supabase RLS 繝昴Μ繧ｷ繝ｼ縺ｧ莉･荳九ｒ螳溯｣・
```sql
-- 蛟倶ｺｺ諠・ｱ繝輔ぅ繝ｼ繝ｫ繝峨・繝槭せ繧ｭ繝ｳ繧ｰ・・taff 縺ｯ邱ｨ髮・ｸ榊庄・・
CREATE POLICY staff_readonly_on_full_name
  ON care_receivers
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM staff_roles))
  WITH CHECK (full_name = (SELECT full_name FROM care_receivers WHERE id = care_receivers.id));

-- admin 縺ｮ縺ｿ迚ｹ螳壹ヵ繧｣繝ｼ繝ｫ繝臥ｷｨ髮・庄
CREATE POLICY admin_can_edit_address
  ON care_receivers
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_roles))
  WITH CHECK (true);
```

### 2. **讌ｽ隕ｳ繝ｭ繝・け・・ptimistic Locking・・*
- `version` 繝輔ぅ繝ｼ繝ｫ繝峨ｒ菴ｿ逕ｨ縺励※遶ｶ蜷医ｒ讀懷・
- 譖ｴ譁ｰ譎ゅ↓蜿､縺・`version` 繧呈､懷・ 竊・409 Conflict 繧定ｿ斐☆
- DB 繝医Μ繧ｬ繝ｼ縺ｧ `version` 繧定・蜍輔う繝ｳ繧ｯ繝ｪ繝｡繝ｳ繝・

```sql
CREATE TRIGGER increment_version
AFTER UPDATE ON care_receivers
FOR EACH ROW
EXECUTE FUNCTION increment_version_column();
```

### 3. **蛟倶ｺｺ諠・ｱ縺ｮ蜿悶ｊ謇ｱ縺・*
- 繝ｭ繧ｰ縺ｫ縺ｯ `full_name`, `birthday`, `address`, `phone`, `emergency_contact` 繧貞性繧√↑縺・
- API 繝ｬ繧ｹ繝昴Φ繧ｹ縺九ｉ蛟倶ｺｺ諠・ｱ繧帝勁螟厄ｼ・sanitizedResponse`・・
- UI 縺ｧ縺ｯ讓ｩ髯舌・繝ｼ繧ｹ縺ｮ繝輔ぅ繝ｼ繝ｫ繝芽｡ｨ遉ｺ蛻ｶ蠕｡

### 4. **逶｣譟ｻ繝ｭ繧ｰ**
- `updated_at`: 譖ｴ譁ｰ譎ょ綾
- `updated_by`: 譖ｴ譁ｰ閠・ID・医ヨ繝ｪ繧ｬ繝ｼ縺ｧ閾ｪ蜍戊ｨｭ螳夲ｼ・

## 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ

| 繧ｹ繝・・繧ｿ繧ｹ | 繧ｨ繝ｩ繝ｼ | 蟇ｾ蠢・|
|-----------|--------|-----|
| 200 | 謌仙粥 | 繝医・繧ｹ繝郁｡ｨ遉ｺ縲√ム繧､繧｢繝ｭ繧ｰ髢峨§繧・|
| 400 | 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ螟ｱ謨・| 隧ｳ邏ｰ繝｡繝・そ繝ｼ繧ｸ陦ｨ遉ｺ |
| 409 | 遶ｶ蜷茨ｼ井ｻ冶・′譖ｴ譁ｰ貂医∩・・| 縲梧怙譁ｰ縺ｮ繝・・繧ｿ繧貞・隱ｭ縺ｿ霎ｼ縺ｿ縺励※縺上□縺輔＞縲・|
| 500 | 繧ｵ繝ｼ繝舌・繧ｨ繝ｩ繝ｼ | 縲栗nternal server error縲・|

## 螳溯｣・メ繧ｧ繝・け繝ｪ繧ｹ繝・

- [x] EditCareReceiverDialog 繧ｳ繝ｳ繝昴・繝阪Φ繝亥ｮ溯｣・
- [x] API 繝ｫ繝ｼ繝茨ｼ・UT・牙ｮ溯｣・
- [x] RLS 繝昴Μ繧ｷ繝ｼ・・TODO: DB 蛛ｴ縺ｧ螳溯｣・｢ｺ隱搾ｼ・
- [x] 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ
- [x] 繝医・繧ｹ繝磯夂衍
- [x] 讌ｽ隕ｳ繝ｭ繝・け・・ersion 繝√ぉ繝・け・・
- [x] 讓ｩ髯舌・繝ｼ繧ｹ陦ｨ遉ｺ蛻ｶ蠕｡
- [x] TypeScript 蝙句ｮ牙・諤ｧ
- [x] ESLint 騾夐℃
- [x] Build 謌仙粥

## 繝・せ繝域焔鬆・

### 1. 蜊倅ｸ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ邱ｨ髮・
```bash
pnpm dev
# 繝悶Λ繧ｦ繧ｶ: http://dev-app.local:3000/services/life-care/users/A%E3%83%BBT
# 邱ｨ髮・・繧ｿ繝ｳ 竊・繝輔か繝ｼ繝邱ｨ髮・竊・菫晏ｭ・竊・遒ｺ隱・
```

### 2. 讓ｩ髯舌・繝ｼ繧ｹ陦ｨ遉ｺ蛻ｶ蠕｡
```typescript
// components/edit-care-receiver-dialog.tsx 縺ｧ userRole 繧貞､画峩
userRole="staff"   // 陦ｨ遉ｺ蜷阪・縺ｿ
userRole="nurse"   // 蝓ｺ譛ｬ諠・ｱ
userRole="admin"   // 縺吶∋縺ｦ
```

### 3. 遶ｶ蜷域､懷・繝・せ繝・
```bash
# 蜷梧凾縺ｫ2縺､縺ｮ繧ｦ繧｣繝ｳ繝峨え縺ｧ邱ｨ髮・竊・version 遶ｶ蜷医ｒ遒ｺ隱・
```

## 莉雁ｾ後・謾ｹ蝟・

- [ ] 蟾ｮ蛻・・繝ｬ繝薙Η繝ｼ・・efore/After・峨・陦ｨ遉ｺ
- [ ] Undo/Redo 讖溯・
- [ ] 繝舌ャ繝∵峩譁ｰ・郁､・焚蛻ｩ逕ｨ閠・ｼ・
- [ ] 螟画峩螻･豁ｴ縺ｮ繝薙Η繝ｼ
- [ ] RLS 繝昴Μ繧ｷ繝ｼ縺ｮ螳悟・螳溯｣・→讀懆ｨｼ

