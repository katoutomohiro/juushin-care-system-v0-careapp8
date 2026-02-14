# Admin 讖溯・譛牙柑蛹冶ｨ育判

縺薙・繝峨く繝･繝｡繝ｳ繝医・縲∥dmin 繝代せ繝ｯ繝ｼ繝芽ｪ崎ｨｼ縺ｨ admin 險ｭ螳壹ヱ繝阪Ν繧呈悽逡ｪ迺ｰ蠅・〒譛牙柑縺ｫ縺吶ｋ縺溘ａ縺ｮ螳溯｣・焔鬆・ｒ遉ｺ縺励∪縺吶・
## 投 迴ｾ蝨ｨ縺ｮ迥ｶ諷・
### Admin 繧ｳ繝ｳ繝昴・繝阪Φ繝・- **admin-password-auth.tsx**: 笨・蟄伜惠・・34 陦鯉ｼ・  - 繝・ヵ繧ｩ繝ｫ繝医ヱ繧ｹ繝ｯ繝ｼ繝・ `1122` (localStorage 縺ｫ菫晏ｭ・
  - 讖溯・: 繝代せ繝ｯ繝ｼ繝牙・蜉・竊・admin 讓ｩ髯蝉ｻ倅ｸ・  - **迴ｾ蝨ｨ**: managementDisabled = true 縺ｧ辟｡蜉ｹ蛹・
- **admin-settings.tsx**: 笨・蟄伜惠・・00 陦鯉ｼ・  - 讖溯・: 繝ｦ繝ｼ繧ｶ繝ｼ蜷咲ｷｨ髮・√い繝励Μ繧ｿ繧､繝医Ν繝ｻ繧ｵ繝悶ち繧､繝医Ν邱ｨ髮・  - 豌ｸ邯壼喧: localStorage菴ｿ逕ｨ・・upabase 譛ｪ蟇ｾ蠢懶ｼ・  - **迴ｾ蝨ｨ**: 隕ｪ繧ｳ繝ｳ繝昴・繝阪Φ繝医°繧蛾撼陦ｨ遉ｺ

### Supabase RLS 繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ
- **staff_profiles**: admin 繧ｫ繝ｩ繝縺悟ｭ伜惠・・igrate 20260117・・- **RLS 繝昴Μ繧ｷ繝ｼ**: facility_id 繝吶・繧ｹ縺ｮ multi-tenant 髫秘屬
- **隱崎ｨｼ**: Supabase Auth + JWT
- **豕ｨ險・*: admin 繧ｫ繝ｩ繝縺ｮ蛟､縺ｯ譛ｪ螳溯｣・ｼ・/1 縺ｾ縺溘・ NULL・・
### 迺ｰ蠅・､画焚繝輔Ξ繝ｼ繝繝ｯ繝ｼ繧ｯ
- **lib/env.ts**: 笨・蟄伜惠・亥渕譛ｬ逧・↑ env vars・・- **FEATURES**: 笶・譛ｪ螳溯｣・ｼ・esign only・・- **ENABLE_ADMIN_FEATURES**: 笶・Vercel env vars 縺ｫ譛ｪ逋ｻ骭ｲ

---

## 識 螳溯｣・せ繝・ャ繝・
### Step 1: lib/features.ts 繧剃ｽ懈・

```typescript
// lib/features.ts
/**
 * Feature flags for Juushin Care System
 * Centralized feature control for all components
 */

export const FEATURES = {
  /**
   * Enable admin features (password auth, settings panel)
   * Set via ENABLE_ADMIN_FEATURES environment variable
   */
  ENABLE_ADMIN_FEATURES: process.env.ENABLE_ADMIN_FEATURES === 'true',
  
  /**
   * Enable staff management UI (add/edit/delete staff)
   */
  ENABLE_STAFF_MANAGEMENT: process.env.ENABLE_STAFF_MANAGEMENT === 'true',
  
  /**
   * Enable realtime sync with Supabase
   */
  ENABLE_REALTIME_SYNC: process.env.ENABLE_REALTIME_SYNC !== 'false', // default true
  
  /**
   * Enable A4 record PDF export
   */
  ENABLE_PDF_EXPORT: process.env.ENABLE_PDF_EXPORT !== 'false', // default true
  
  /**
   * Enable voice recording feature
   */
  ENABLE_VOICE_RECORDING: process.env.ENABLE_VOICE_RECORDING === 'true',
} as const

// Type safety: Ensure all features are boolean
type FeatureFlags = typeof FEATURES
type FeatureKey = keyof FeatureFlags
type FeatureValue = FeatureFlags[FeatureKey]
```

**繝輔ぃ繧､繝ｫ驟咲ｽｮ:**
```
lib/features.ts
```

**繝・せ繝・**
```bash
# 繝ｭ繝ｼ繧ｫ繝ｫ縺ｧ遒ｺ隱・echo "ENABLE_ADMIN_FEATURES=false" >> .env.local
pnpm dev
# Admin 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺碁撼陦ｨ遉ｺ縺ｫ縺ｪ繧九％縺ｨ遒ｺ隱・
echo "ENABLE_ADMIN_FEATURES=true" >> .env.local
pnpm dev
# Admin 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺瑚｡ｨ遉ｺ縺輔ｌ繧九％縺ｨ繧堤｢ｺ隱・```

---

### Step 2: admin-password-auth.tsx 繧剃ｿｮ豁｣

**螟画峩邂・園:**
```typescript
// components/admin-password-auth.tsx
import { FEATURES } from '@/lib/features'

export function AdminPasswordAuth({ children }: { children: React.ReactNode }) {
  // 笶・OLD:
  // const managementDisabled = true  // hardcoded
  
  // 笨・NEW:
  const managementDisabled = !FEATURES.ENABLE_ADMIN_FEATURES
  
  if (managementDisabled) return children
  
  // ... rest of component
}
```

**遒ｺ隱・**
```bash
# .env.local 縺ｫ ENABLE_ADMIN_FEATURES=true 繧定ｨｭ螳・pnpm dev
# http://dev-app.local:3000 縺ｧ admin-password-auth 縺瑚｡ｨ遉ｺ縺輔ｌ繧・```

---

### Step 3: Vercel 迺ｰ蠅・､画焚繧定ｨｭ螳・
**Vercel Dashboard:**
1. Settings 竊・Environment Variables
2. 譁ｰ隕剰ｿｽ蜉: `ENABLE_ADMIN_FEATURES`
   - Value: `false` (蛻晄悄迥ｶ諷・
   - Environments: Production, Preview, Development

**繧ｳ繝槭Φ繝会ｼ・PI 邨檎罰・・**
```bash
# Vercel CLI・医う繝ｳ繧ｹ繝医・繝ｫ貂医∩縺ｮ蝣ｴ蜷茨ｼ・vercel env add ENABLE_ADMIN_FEATURES
# Value: false 繧貞・蜉・```

**遒ｺ隱・**
```bash
vercel env ls
# ENABLE_ADMIN_FEATURES = false 縺ｨ陦ｨ遉ｺ縺輔ｌ繧・```

---

### Step 4: Initial Admin User 繧剃ｽ懈・・医が繝励す繝ｧ繝ｳ・・
#### 4a. Supabase 縺ｧ謇句虚菴懈・

```sql
-- Supabase Dashboard 竊・SQL Editor 縺ｧ螳溯｡・
-- 1. auth.users 縺ｫ譁ｰ隕上Θ繝ｼ繧ｶ繝ｼ繧剃ｽ懈・
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  last_sign_in_at, 
  raw_user_meta_data
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- UUID (荳諢上〒縺ゅｋ縺薙→)
  'admin@juushin.example.com',
  crypt('admin-secure-password-here', gen_salt('bf')),  -- bcrypt hash
  NOW(),
  NOW(),
  NOW(),
  NULL,
  '{"display_name":"System Admin"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 2. staff_profiles 縺ｫ邏蝉ｻ倥￠
INSERT INTO public.staff_profiles (
  id, 
  auth_id,
  facility_id,
  name, 
  role, 
  admin,
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '12345678-abcd-1234-abcd-1234567890ab',  -- 螳溷惠縺吶ｋ facility_id
  'System Admin',
  'admin',  -- 'admin' or 'user'
  1,  -- admin flag: 1 = true
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3. 遒ｺ隱・SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email = 'admin@juushin.example.com';
```

#### 4b. supabase/seed.sql 縺ｫ霑ｽ蜉・域耳螂ｨ・・
```sql
-- supabase/seed.sql 縺ｫ霑ｽ蜉

-- Initial admin user
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@example.com',
  crypt('initial-admin-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Link to staff_profiles
INSERT INTO public.staff_profiles (
  auth_id,
  facility_id,
  name,
  role,
  admin,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '[facility_id]',
  'Admin',
  'admin',
  1,
  NOW()
)
ON CONFLICT DO NOTHING;
```

螳溯｡・
```bash
supabase db push  # migrate + seed.sql 螳溯｡・```

---

### Step 5: 繝ｭ繝ｼ繧ｫ繝ｫ繝・せ繝・
```bash
# 髢狗匱迺ｰ蠅・〒 admin 讖溯・繧呈怏蜉ｹ蛹・echo "ENABLE_ADMIN_FEATURES=true" >> .env.local

# 繝ｭ繝ｼ繧ｫ繝ｫ繧ｵ繝ｼ繝舌・繧定ｵｷ蜍・pnpm dev

# 繝・せ繝域焔鬆・# 1. http://dev-app.local:3000 繧帝幕縺・# 2. Admin 繝代せ繝ｯ繝ｼ繝牙・蜉帙ヵ繧｣繝ｼ繝ｫ繝峨′陦ｨ遉ｺ縺輔ｌ繧・# 3. 繝・ヵ繧ｩ繝ｫ繝医ヱ繧ｹ繝ｯ繝ｼ繝・"1122" 繧貞・蜉・# 4. Admin Settings 繝代ロ繝ｫ縺瑚｡ｨ遉ｺ縺輔ｌ繧・# 5. 繝ｦ繝ｼ繧ｶ繝ｼ蜷阪ｄ繧｢繝励Μ繧ｿ繧､繝医Ν繧堤ｷｨ髮・＠縺ｦ縺ｿ繧・# 6. localStorage 縺ｫ螟画峩縺御ｿ晏ｭ倥＆繧後ｋ縺薙→繧堤｢ｺ隱・```

**繝・ヰ繝・げ:**
```bash
# localStorage 縺ｮ admin flag 繧堤｢ｺ隱・# DevTools 竊・Application 竊・Storage 竊・Local Storage
# "isAdmin" 繧ｭ繝ｼ縺・true 縺ｫ縺ｪ縺｣縺ｦ縺・ｋ縺・```

---

### Step 6: 譛ｬ逡ｪ迺ｰ蠅・↓繝・・繝ｭ繧､

#### 6a. Vercel 縺ｧ ENABLE_ADMIN_FEATURES 繧呈怏蜉ｹ蛹・
1. Vercel Dashboard 竊・Settings 竊・Environment Variables
2. `ENABLE_ADMIN_FEATURES` 竊・Value: `true` (Production 迺ｰ蠅・
3. 蜀阪ョ繝励Ο繧､

#### 6b. 繧ｳ繝ｼ繝牙､画峩繧偵さ繝溘ャ繝医・繝励ャ繧ｷ繝･

```bash
git add lib/features.ts components/admin-password-auth.tsx
git commit -m "feat: add feature flag for admin features"
git push origin main

# Vercel 縺瑚・蜍輔ョ繝励Ο繧､髢句ｧ・# Deployments 縺ｧ "Build success" 繧堤｢ｺ隱・```

#### 6c. 譛ｬ逡ｪ迺ｰ蠅・ｒ繝・せ繝・
```bash
# https://juushin-care-system-v0-careapp8.vercel.app/
# 1. Admin 繝代せ繝ｯ繝ｼ繝牙・蜉帙ヵ繧｣繝ｼ繝ｫ繝峨′陦ｨ遉ｺ縺輔ｌ繧・# 2. "1122" 繧貞・蜉帙＠縺ｦ Admin Settings 繧帝幕縺・# 3. 繝・せ繝育ｷｨ髮・ｒ陦後≧
# 4. LocalStorage 縺ｫ菫晏ｭ倥＆繧後ｋ縺薙→繧堤｢ｺ隱・```

---

## 白 繧ｻ繧ｭ繝･繝ｪ繝・ぅ縺ｫ髢｢縺吶ｋ豕ｨ險・
### 迴ｾ蝨ｨ縺ｮ螳溯｣・ｼ・ocalStorage 繝吶・繧ｹ・・- 笨・邁｡蜊倥↓繝・せ繝亥庄閭ｽ
- 笶・繧ｯ繝ｩ繧､繧｢繝ｳ繝亥・縺ｮ縺ｿ・医そ繧ｭ繝･繝ｪ繝・ぅ荳翫・諛ｸ蠢ｵ・・- 笶・繧ｵ繝ｼ繝舌・蛛ｴ縺ｧ讀懆ｨｼ縺輔ｌ縺ｪ縺・
### 蟆・擂縺ｮ謾ｹ蝟・｡茨ｼ・upabase RLS 繝吶・繧ｹ・・```typescript
// 蟆・擂螳溯｣・// 1. admin 蛻､螳壹ｒ Supabase RLS 縺ｧ陦後≧
// 2. staff_profiles.admin = 1 縺ｮ user 縺ｮ縺ｿ繧｢繧ｯ繧ｻ繧ｹ蜿ｯ閭ｽ
// 3. API routes 縺ｧ JWT 繧呈､懆ｨｼ
// 4. localStorage 縺ｧ縺ｯ縺ｪ縺・session cookie 繧剃ｽｿ逕ｨ

// 蜿り・ supabase/migrations/20260117_implement_facility_rls.sql
// CREATE POLICY "Admin can manage staff"
//   ON public.staff_profiles
//   FOR ALL
//   USING (
//     (
//       SELECT admin FROM public.staff_profiles 
//       WHERE auth_id = auth.uid()
//     ) = 1
//   );
```

---

## 搭 螳溯｣・メ繧ｧ繝・け繝ｪ繧ｹ繝・
### Step 1: lib/features.ts
- [ ] 繝輔ぃ繧､繝ｫ繧剃ｽ懈・
- [ ] FEATURES 繧ｪ繝悶ず繧ｧ繧ｯ繝医ｒ螳夂ｾｩ
- [ ] 蝙句ｮ夂ｾｩ繧定ｿｽ蜉
- [ ] pnpm typecheck: 笨・
### Step 2: admin-password-auth.tsx
- [ ] 繧､繝ｳ繝昴・繝・ `import { FEATURES } from '@/lib/features'`
- [ ] managementDisabled 繧剃ｿｮ豁｣
- [ ] pnpm typecheck: 笨・- [ ] pnpm lint: 笨・
### Step 3: Vercel 迺ｰ蠅・､画焚
- [ ] ENABLE_ADMIN_FEATURES 繧定ｿｽ蜉
- [ ] Value: false ・亥・譛溽憾諷具ｼ・- [ ] All environments 縺ｫ驕ｩ逕ｨ

### Step 4: Initial Admin User・医が繝励す繝ｧ繝ｳ・・- [ ] Supabase 縺ｧ auth.users 繧剃ｽ懈・・医∪縺溘・ seed.sql 縺ｫ霑ｽ蜉・・- [ ] staff_profiles 縺ｫ邏蝉ｻ倥￠
- [ ] admin = 1 繧定ｨｭ螳・
### Step 5: 繝ｭ繝ｼ繧ｫ繝ｫ繝・せ繝・- [ ] .env.local: ENABLE_ADMIN_FEATURES=true
- [ ] pnpm dev 縺ｧ繝帙・繝繝壹・繧ｸ繧帝幕縺・- [ ] Admin 繝代せ繝ｯ繝ｼ繝牙・蜉帙′陦ｨ遉ｺ縺輔ｌ繧・- [ ] 繝・ヵ繧ｩ繝ｫ繝医ヱ繧ｹ繝ｯ繝ｼ繝・"1122" 縺ｧ Admin Settings 縺碁幕縺・- [ ] 繝ｦ繝ｼ繧ｶ繝ｼ蜷阪ｒ邱ｨ髮・＠縺ｦ縺ｿ繧・- [ ] localStorage 縺ｫ菫晏ｭ倥＆繧後ｋ

### Step 6: 譛ｬ逡ｪ繝・・繝ｭ繧､
- [ ] git commit & push
- [ ] Vercel 繝繝・す繝･繝懊・繝峨〒 Build success 遒ｺ隱・- [ ] ENABLE_ADMIN_FEATURES = true 縺ｫ螟画峩・医∪縺溘・蠕後〒譛牙柑蛹厄ｼ・- [ ] https://juushin-care-system-v0-careapp8.vercel.app 縺ｧ遒ｺ隱・
---

## 噫 繝・・繝ｭ繧､蠕後・遒ｺ隱・
### 讖溯・繝・せ繝・```bash
# 1. Admin 繝代せ繝ｯ繝ｼ繝牙・蜉・# - http://dev-app.local:3000 繧帝幕縺・# - Admin settings 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺瑚ｦ九∴繧・# - "1122" 繧貞・蜉・
# 2. Admin Settings 繝代ロ繝ｫ
# - User 1 name, User 2 name ... 縺檎ｷｨ髮・庄閭ｽ
# - App Title, App Subtitle 縺檎ｷｨ髮・庄閭ｽ
# - 螟画峩縺・localStorage 縺ｫ菫晏ｭ倥＆繧後ｋ

# 3. 隍・焚繧ｻ繝・す繝ｧ繝ｳ 繝・せ繝・# - 蛻･繝悶Λ繧ｦ繧ｶ/繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ縺ｧ髢九￥
# - localStorage 縺・shared 縺ｧ縺ｪ縺上∝推繧ｻ繝・す繝ｧ繝ｳ迢ｬ遶九＠縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱・```

### 繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

**蝠城｡・ Admin 繝代せ繝ｯ繝ｫ蜈･蜉帙′陦ｨ遉ｺ縺輔ｌ縺ｪ縺・*
```bash
# 遒ｺ隱埼・岼
echo $ENABLE_ADMIN_FEATURES  # true 縺狗｢ｺ隱・grep "FEATURES.ENABLE_ADMIN_FEATURES" components/admin-password-auth.tsx  # 繧ｳ繝ｼ繝臥｢ｺ隱・pnpm typecheck  # 蝙九お繝ｩ繝ｼ遒ｺ隱・```

**蝠城｡・ 繝代せ繝ｯ繝ｼ繝峨′蜿励￠莉倥￠繧峨ｌ縺ｪ縺・*
```bash
# dev-app.local:3000/admin-password-auth.tsx 縺ｮ繝・ヵ繧ｩ繝ｫ繝・W遒ｺ隱・grep -n "1122\|password" components/admin-password-auth.tsx

# localStorage 縺ｫ菫晏ｭ倥＆繧後※縺・ｋ縺狗｢ｺ隱・# DevTools 竊・Application 竊・Storage 竊・Local Storage 竊・isAdmin 繧ｭ繝ｼ
```

**蝠城｡・ 險ｭ螳壹′菫晏ｭ倥＆繧後↑縺・*
```bash
# localStorage 縺梧怏蜉ｹ縺狗｢ｺ隱・# DevTools 竊・Application 竊・Storage 竊・Local Storage 縺瑚ｦ九∴繧・# isAdmin, userNames, appTitle 縺ｪ縺ｩ縺ｮ繧ｭ繝ｼ縺悟ｭ伜惠縺吶ｋ縺・```

---

## 答 蜿り・Μ繝ｳ繧ｯ

- **admin-password-auth.tsx**: [components/admin-password-auth.tsx](../../components/admin-password-auth.tsx#L28)
- **admin-settings.tsx**: [components/admin-settings.tsx](../../components/admin-settings.tsx)
- **Supabase RLS**: [supabase/migrations/20260117_implement_facility_rls.sql](../../supabase/migrations/20260117_implement_facility_rls.sql)
- **迺ｰ蠅・､画焚險ｭ螳・*: [lib/env.ts](../../lib/env.ts)

---

## 笨・螳御ｺ・凾縺ｮ迥ｶ諷・
### 笨・螳溯｣・ｮ御ｺ・ｾ・- [ ] Admin 繝代せ繝ｯ繝ｼ繝芽ｪ崎ｨｼ縺梧ｩ溯・
- [ ] Admin Settings 縺ｧ 繝ｦ繝ｼ繧ｶ繝ｼ蜷阪・繧ｿ繧､繝医Ν邱ｨ髮・庄閭ｽ
- [ ] localStorage 縺ｫ豌ｸ邯壼喧
- [ ] ENABLE_ADMIN_FEATURES 繝輔Λ繧ｰ縺ｧ螳悟・縺ｫ繧ｳ繝ｳ繝医Ο繝ｼ繝ｫ蜿ｯ閭ｽ
- [ ] 譛ｬ逡ｪ迺ｰ蠅・〒繧ょｿ・ｦ√↓蠢懊§縺ｦ譛牙柑蛹・辟｡蜉ｹ蛹門庄閭ｽ

### 醗 蟆・擂縺ｮ繧｢繝・・繧ｰ繝ｬ繝ｼ繝画｡・- [ ] Supabase RLS 繝吶・繧ｹ縺ｮ admin 讀懆ｨｼ
- [ ] Server actions 縺ｧ admin 讓ｩ髯舌ｒ繧ｵ繝ｼ繝舌・蛛ｴ縺ｧ讀懆ｨｼ
- [ ] audit log・・dmin 縺ｫ繧医ｋ螟画峩螻･豁ｴ・・- [ ] multi-admin 繧ｵ繝昴・繝・- [ ] Password strength 隕∽ｻｶ
- [ ] Session timeout

