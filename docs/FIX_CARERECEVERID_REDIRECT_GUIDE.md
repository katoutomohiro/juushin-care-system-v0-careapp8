# careReceiverId 閾ｪ蜍輔Μ繝繧､繝ｬ繧ｯ繝亥撫鬘・- 螳悟・菫ｮ豁｣繧ｬ繧､繝・
## 搭 蝠城｡後し繝槭Μ繝ｼ

### 逞・憾
- Vercel URL (https://juushin-care-system-v0-careapp8.vercel.app/) 縺ｫ `/` 縺ｧ繧｢繧ｯ繧ｻ繧ｹ縺励※繧ょ享謇九↓ `?careReceiverId=AT` 縺御ｻ倅ｸ弱＆繧後ｋ
- 蟶ｸ縺ｫ蛻ｩ逕ｨ閠・ｼ医こ繧｢繝ｬ繧ｷ繝ｼ繝撰ｼ臥判髱｢縺碁幕縺阪梧怙譁ｰ繧｢繝励Μ・医Ο繧ｰ繧､繝ｳ逕ｻ髱｢・峨阪′陦ｨ遉ｺ縺輔ｌ縺ｪ縺・- DevTools Network 縺ｧ縲√ラ繧ｭ繝･繝｡繝ｳ繝・`/` 縺・`/?careReceiverId=AT` 縺ｧ 200 OK 繧定ｿ斐＠縺ｦ縺・ｋ

---

## 剥 譬ｹ譛ｬ蜴溷屏縺ｮ蜆ｪ蜈磯・ｽ・
### 閥 繝ｬ繝吶Ν1: HomeClient 蜀・・ URL 繝ｪ繝繧､繝ｬ繧ｯ繝茨ｼ育｢ｺ螳壼次蝗・・
**繝輔ぃ繧､繝ｫ**: `app/home-client.tsx`  
**蝠城｡瑚｡・*: L104

```typescript
// 笶・蛻晏屓繝槭え繝ｳ繝域凾縺ｫ defaultId (AT) 繧・URL 縺ｫ蠑ｷ蛻ｶ莉倅ｸ・_router.replace(`${window.location.pathname}?careReceiverId=${encodeURIComponent(defaultId)}`, { scroll: false })
```

**縺ｪ縺懊％繧後′蝠城｡後°**:
- `/` 縺ｧ繧｢繧ｯ繧ｻ繧ｹ 竊・`initialCareReceiverId` 縺・`undefined` 竊・defaultId (AT) 繧・URL莉倅ｸ・- 繝ｦ繝ｼ繧ｶ繝ｼ縺・`/` 繧帝幕縺薙≧縺ｨ縺励※繧ゅ∝叉蠎ｧ縺ｫ `/?careReceiverId=AT` 縺ｫ譖ｸ縺肴鋤繧上ｋ
- 莉･蠕後☆縺ｹ縺ｦ縺ｮ繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ縺ｧ `pushWithCareReceiverId()` 縺袈RL莉倅ｸ弱ｒ邯咏ｶ・
### 泯 繝ｬ繝吶Ν2: middleware 縺ｮ謖吝虚・郁ｨｭ螳夂｢ｺ隱搾ｼ・
**繝輔ぃ繧､繝ｫ**: `middleware.ts`

**迴ｾ迥ｶ**: 
- `/` 縺ｫ繧｢繧ｯ繧ｻ繧ｹ 竊・token 縺後↑縺・竊・`/login?redirect=/` 縺ｸ繝ｪ繝繧､繝ｬ繧ｯ繝・笨・(豁｣蟶ｸ)
- login蠕・`redirectPath` 縺ｯ `/services/life-care/users` 縺ｨ縺ｪ繧・
**蝠城｡・*: 
- `initialCareReceiverId` 縺梧ｸ｡縺輔ｌ繧九・縺ｯ **HomeClient 縺ｸ縺ｮprops**縺ｮ縺ｿ
- middleware谿ｵ髫弱〒縺ｯ `/` 縺・`/login` 縺ｫ鬟帙・縺溘ａ縲？omeClient 縺ｯ螳溯｡後＆繧後↑縺・
### 泛 繝ｬ繝吶Ν3: localStorage 蠕ｩ蜈・ｼ井ｽ守｢ｺ蠎ｦ・・
**遒ｺ隱咲ｵ先棡**: `localStorage.getItem` 縺ｧ careReceiverId 繧貞ｾｩ蜈・☆繧狗ｮ・園縺ｯ**隕句ｽ薙◆繧峨↑縺・* 笨・
---

## 屏・・菫ｮ豁｣譯・
### **菫ｮ豁｣譯・: 譛蟆丞､画峩迚・- 繝・ヵ繧ｩ繝ｫ繝・ID 莉倅ｸ弱ｒ蟒・ｭ｢・域耳螂ｨ・・*

縺薙・菫ｮ豁｣縺ｫ繧医ｊ縲～/` 縺ｯ **URL 繝代Λ繝｡繝ｼ繧ｿ縺ｪ縺・*縺ｧ髢九°繧後∪縺吶・
#### **菫ｮ豁｣1: app/home-client.tsx (L95-115)**

**螟画峩蜑・**
```typescript
  useEffect(() => {
    const defaultId = lifeCareReceivers[0]?.id
    const isValid = typeof initialCareReceiverId === "string" && lifeCareReceivers.some(r => r.id === initialCareReceiverId)

    if (isValid) {
      setSelectedCareReceiverId(initialCareReceiverId!)
      const found = lifeCareReceivers.find(r => r.id === initialCareReceiverId)!
      setSelectedUser(found.label)
      return
    }

    if (defaultId) {
      setSelectedCareReceiverId(defaultId)
      setSelectedUser(lifeCareReceivers[0].label)
      _router.replace(`${window.location.pathname}?careReceiverId=${encodeURIComponent(defaultId)}`, { scroll: false })
    }
  }, [])
```

**螟画峩蠕・**
```typescript
  useEffect(() => {
    const defaultId = lifeCareReceivers[0]?.id
    const isValid = typeof initialCareReceiverId === "string" && lifeCareReceivers.some(r => r.id === initialCareReceiverId)

    if (isValid) {
      setSelectedCareReceiverId(initialCareReceiverId!)
      const found = lifeCareReceivers.find(r => r.id === initialCareReceiverId)!
      setSelectedUser(found.label)
      return
    }

    // URL 繝代Λ繝｡繝ｼ繧ｿ縺後↑縺・↑繧・state 縺ｮ縺ｿ繧ｻ繝・ヨ・・RL 譖ｸ縺肴鋤縺医＠縺ｪ縺・ｼ・    // 縺薙ｌ縺ｫ繧医ｊ縲・ 縺ｸ縺ｮ繧｢繧ｯ繧ｻ繧ｹ縺ｧ蜍晄焔縺ｫ ?careReceiverId=AT 縺御ｻ倥°縺ｪ縺上↑繧・    if (defaultId && !initialCareReceiverId) {
      setSelectedCareReceiverId(defaultId)
      setSelectedUser(lifeCareReceivers[0].label)
    }
  }, [])
```

#### **菫ｮ豁｣2: app/page.tsx・医が繝励す繝ｧ繝ｳ - 繧医ｊ繧ｯ繝ｪ繝ｼ繝ｳ・・*

**螟画峩蜑・**
```typescript
export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default async function Page({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = searchParams ? await searchParams : undefined
  const idParam = params?.careReceiverId
  const initialCareReceiverId = typeof idParam === "string" ? idParam : undefined
  return <HomeClient initialCareReceiverId={initialCareReceiverId} />
}
```

**螟画峩蠕・**
```typescript
export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams 繧定ｪｭ縺ｾ縺ｪ縺・ｼ医く繝｣繝・す繝･繧帝亟縺舌◆繧・ｼ・  // / 繝壹・繧ｸ縺ｧ縺ｯ initialCareReceiverId 繧呈ｸ｡縺輔↑縺・  // 蛻ｩ逕ｨ閠・∈謚槭・ UI 荳翫〒繝峨Ο繝・・繝繧ｦ繝ｳ縺九ｉ陦後≧
  return <HomeClient initialCareReceiverId={undefined} />
}
```

#### **讀懆ｨｼ隕ｳ轤ｹ**

```bash
# 1. 繝ｭ繝ｼ繧ｫ繝ｫ髢狗匱迺ｰ蠅・〒遒ｺ隱・pnpm dev
# 竊・http://dev-app.local:3000/ 繧帝幕縺・# 笨・譛溷ｾ・ ?careReceiverId=AT 縺御ｻ倥°縺ｪ縺・# 笨・繝帙・繝逕ｻ髱｢縺ｧ蛻ｩ逕ｨ閠・∈謚槭ラ繝ｭ繝・・繝繧ｦ繝ｳ縺瑚｡ｨ遉ｺ縺輔ｌ繧・
# 2. 譏守､ｺ逧・↓ ID 繧剃ｻ倥￠縺溷ｴ蜷・# 竊・http://dev-app.local:3000/?careReceiverId=AT 繧帝幕縺・# 笨・譛溷ｾ・ AT 縺碁∈謚槭＆繧後◆迥ｶ諷九〒陦ｨ遉ｺ縺輔ｌ繧・```

---

### **菫ｮ豁｣譯・: 譛ｬ譬ｼ迚・- 繝ｭ繧ｰ繧､繝ｳ逕ｻ髱｢縺九ｉ蟋九ａ繧・*

繧医ｊ螳牙・縺ｪ豬√ｌ・・*/ 竊・隱崎ｨｼ 竊・繝ｭ繧ｰ繧､繝ｳ 竊・/services/{serviceId} 竊・蛻ｩ逕ｨ閠・∈謚・*

縺薙・蝣ｴ蜷医［iddleware 縺・`/` 縺ｸ縺ｮ隱崎ｨｼ縺ｪ縺励い繧ｯ繧ｻ繧ｹ繧・`/login` 縺ｸ繝ｪ繝繧､繝ｬ繧ｯ繝医☆繧九◆繧√？omeClient 縺ｯ螳溯｡後＆繧後∪縺帙ｓ縲・
#### **繧ｹ繝・ャ繝・: app/page.tsx 繧堤ｰ｡貎斐↓**

```typescript
export const dynamic = "force-dynamic"
import HomeClient from "./home-client"

export default function Page() {
  // searchParams 繧定ｪｭ縺ｾ縺ｪ縺・ｼ医く繝｣繝・す繝･繧帝亟縺舌◆繧・ｼ・  return <HomeClient initialCareReceiverId={undefined} />
}
```

#### **繧ｹ繝・ャ繝・: HomeClient 繧・dashboard 蟆ら畑縺ｫ螟画峩**

```typescript
export default function HomeClient({ initialCareReceiverId }: Props) {
  // 蛻晄悄蛹悶ｒ蟒・ｭ｢
  // initialCareReceiverId 縺ｯ辟｡隕・  const [selectedCareReceiverId, setSelectedCareReceiverId] = useState<string | null>(null)
  
  // useEffect 縺ｮ L95-115 繧貞炎髯､
  // 竊・UI 縺ｯ縲悟茜逕ｨ閠・ｒ驕ｸ謚槭＠縺ｦ縺上□縺輔＞縲咲憾諷九〒陦ｨ遉ｺ
}
```

#### **繧ｹ繝・ャ繝・: middleware 繧堤｢ｺ隱・*

```typescript
// middleware.ts 縺ｯ譌｢縺ｫ豁｣縺励＞
// / 竊・/login?redirect=/ 竊・繝ｭ繧ｰ繧､繝ｳ 竊・/services/life-care/users 縺ｸ
```

---

## 博 讀懃ｴ｢謖・､ｺ・夊ｩｲ蠖鍋ｮ・園縺ｮ迚ｹ螳・
莉･荳九・繝代ち繝ｼ繝ｳ縺ｧ蜈ｨ讀懃ｴ｢繧貞ｮ滓命縺励∪縺呻ｼ・
```powershell
# PowerShell 縺ｧ繝ｪ繝昴ず繝医Μ蜀・､懃ｴ｢
cd c:\dev\juushin-care-system-v0-careapp8

# 1. careReceiverId 縺ｮ URL 莉倅ｸ守ｮ・園
grep -r "careReceiverId.*=" --include="*.tsx" --include="*.ts" | grep -E "(replace|push)"

# 2. router.replace / router.push 縺ｧ URL 譖ｸ縺肴鋤縺・grep -r "router\.\(replace\|push\).*careReceiverId" --include="*.tsx" --include="*.ts"

# 3. localStorage 縺ｧ縺ｮ蠕ｩ蜈・ｼ育｢ｺ隱搾ｼ・grep -r "localStorage.*careReceiverId" --include="*.tsx" --include="*.ts"

# 4. middleware / next.config 縺ｧ縺ｮ redirect
grep -r "redirect.*careReceiverId" middleware.ts next.config.* vercel.json 2>/dev/null
```

**螳溯｡檎ｵ先棡**: `home-client.tsx L104, L367, L585, L598` 縺ｫ髮・ｸｭ

---

## 統 菫ｮ豁｣繝輔ぃ繧､繝ｫ: 蟾ｮ蛻・ｽ｢蠑・
### **繝輔ぃ繧､繝ｫ1: app/home-client.tsx**

```diff
  useEffect(() => {
    const defaultId = lifeCareReceivers[0]?.id
    const isValid = typeof initialCareReceiverId === "string" && lifeCareReceivers.some(r => r.id === initialCareReceiverId)

    if (isValid) {
      setSelectedCareReceiverId(initialCareReceiverId!)
      const found = lifeCareReceivers.find(r => r.id === initialCareReceiverId)!
      setSelectedUser(found.label)
      return
    }

-   if (defaultId) {
-     setSelectedCareReceiverId(defaultId)
-     setSelectedUser(lifeCareReceivers[0].label)
-     _router.replace(`${window.location.pathname}?careReceiverId=${encodeURIComponent(defaultId)}`, { scroll: false })
-   }
+   // URL 繝代Λ繝｡繝ｼ繧ｿ縺後↑縺・↑繧・state 縺ｮ縺ｿ繧ｻ繝・ヨ・・RL 譖ｸ縺肴鋤縺医＠縺ｪ縺・ｼ・+   if (defaultId && !initialCareReceiverId) {
+     setSelectedCareReceiverId(defaultId)
+     setSelectedUser(lifeCareReceivers[0].label)
+   }
  }, [])
```

### **繝輔ぃ繧､繝ｫ2: app/page.tsx・医が繝励す繝ｧ繝ｳ - 繧医ｊ繧ｯ繝ｪ繝ｼ繝ｳ・・*

```diff
  export const dynamic = "force-dynamic"
  import HomeClient from "./home-client"
  
- export default async function Page({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
-   const params = searchParams ? await searchParams : undefined
-   const idParam = params?.careReceiverId
-   const initialCareReceiverId = typeof idParam === "string" ? idParam : undefined
-   return <HomeClient initialCareReceiverId={initialCareReceiverId} />
- }

+ export default function Page() {
+   // / 繝壹・繧ｸ縺ｧ縺ｯ initialCareReceiverId 繧呈ｸ｡縺輔↑縺・+   // 蛻ｩ逕ｨ閠・∈謚槭・ UI 荳翫〒陦後≧
+   return <HomeClient initialCareReceiverId={undefined} />
+ }
```

---

## 笞・・繝ｭ繧ｰ繧､繝ｳ逕ｻ髱｢繧ｨ繝ｩ繝ｼ縺ｮ蜴溷屏蛟呵｣・
蜑崎ｿｰ縲後Ο繧ｰ繧､繝ｳ譎ゅ↓繧ｨ繝ｩ繝ｼ縺悟・縺溘阪↓縺､縺・※縲∽ｻ･荳九ｒ遒ｺ隱阪＠縺ｾ縺呻ｼ・
### **蜴溷屏蛟呵｣・: Supabase Auth 蛻晄悄蛹悶お繝ｩ繝ｼ**

**繝輔ぃ繧､繝ｫ**: `app/login/page.tsx` (L20-30)

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 繧ｨ繝ｩ繝ｼ縺ｮ蝣ｴ蜷医‘nv縺檎ｩｺ縺ｮ蜿ｯ閭ｽ諤ｧ
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  // 竊・Vercel 縺ｮ Environment Variables 繧堤｢ｺ隱・}
```

**遒ｺ隱肴焔鬆・*:
```bash
# 1. Vercel Dashboard 竊・Settings 竊・Environment Variables
# 笨・NEXT_PUBLIC_SUPABASE_URL 縺悟ｭ伜惠縺吶ｋ縺・# 笨・NEXT_PUBLIC_SUPABASE_ANON_KEY 縺悟ｭ伜惠縺吶ｋ縺・
# 2. 繝ｭ繝ｼ繧ｫ繝ｫ .env.local 縺ｧ繧ょ酔縺倥°
cat .env.local | grep NEXT_PUBLIC_SUPABASE
```

### **蜴溷屏蛟呵｣・: RLS 繝昴Μ繧ｷ繝ｼ繧ｨ繝ｩ繝ｼ**

**繝輔ぃ繧､繝ｫ**: `supabase/migrations/20260117_implement_facility_rls.sql`

```sql
-- staff_profiles 繝・・繝悶Ν縺ｮ RLS 縺悟宍縺励☆縺弱ｋ蜿ｯ閭ｽ諤ｧ
CREATE POLICY "Allow read for authenticated users"
ON public.staff_profiles
FOR SELECT
TO authenticated
USING (true);  -- 髢区叛逧・笨・```

**遒ｺ隱肴焔鬆・*:
```sql
-- Supabase Dashboard 竊・SQL Editor 縺ｧ螳溯｡・SELECT * FROM pg_policies WHERE tablename = 'staff_profiles';
-- 笨・RLS Enabled 縺狗｢ｺ隱・
-- 繝・せ繝医Θ繝ｼ繧ｶ繝ｼ縺ｧ讀懃ｴ｢蜿ｯ閭ｽ縺・SET ROLE authenticated;
SET auth.uid = '[test-user-id]';
SELECT * FROM public.staff_profiles LIMIT 1;
-- 笨・邨先棡縺瑚ｿ斐ｋ縺・```

### **蜴溷屏蛟呵｣・: signInWithPassword 繧ｨ繝ｩ繝ｼ**

**繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺ｮ遒ｺ隱・*:
```typescript
// app/login/page.tsx L35-40
const { data, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (authError) {
  console.error('[login] Auth error:', authError)
  // 竊・繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ / Vercel 繝ｭ繧ｰ 縺ｧ隧ｳ邏ｰ遒ｺ隱・}
```

**遒ｺ隱肴焔鬆・*:
```bash
# 1. Vercel Logs 縺ｧ signInWithPassword 繧ｨ繝ｩ繝ｼ繧堤｢ｺ隱・# Vercel Dashboard 竊・Deployments 竊・[譛譁ｰ] 竊・Logs

# 2. 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ・・evTools・峨〒繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ
# 竊・F12 竊・Console 繧ｿ繝・
# 3. seed.sql 縺ｧ test user 縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱・# Supabase Dashboard 竊・SQL Editor
SELECT * FROM auth.users LIMIT 5;
```

---

## 噫 繝・・繝ｭ繧､螳溯｡梧焔鬆・
### **繧ｹ繝・ャ繝・: 繝ｭ繝ｼ繧ｫ繝ｫ讀懆ｨｼ**

```bash
cd c:\dev\juushin-care-system-v0-careapp8

# 1. 菫ｮ豁｣蜀・ｮｹ縺ｮ遒ｺ隱・git diff app/page.tsx app/home-client.tsx

# 2. 繝薙Ν繝画・蜉溘ｒ遒ｺ隱・pnpm install
pnpm typecheck    # 笨・No errors expected
pnpm lint         # 笨・No errors expected
pnpm build        # 笨・Should complete successfully
```

### **繧ｹ繝・ャ繝・: 繝ｭ繝ｼ繧ｫ繝ｫ縺ｧ蜍穂ｽ懃｢ｺ隱・*

```bash
pnpm dev
# 竊・http://dev-app.local:3000/ 繧帝幕縺・```

**遒ｺ隱埼・岼:**

| 鬆・岼 | 譛溷ｾ・､ | 讀懆ｨｼ譁ｹ豕・|
|------|--------|--------|
| **URL 繝代Λ繝｡繝ｼ繧ｿ縺ｪ縺・* | / ・茨ｼ歡areReceiverId=AT 縺ｪ縺暦ｼ・| 繧｢繝峨Ξ繧ｹ繝舌・繧堤｢ｺ隱・|
| **繝帙・繝逕ｻ髱｢陦ｨ遉ｺ** | 繝繝・す繝･繝懊・繝峨′陦ｨ遉ｺ縺輔ｌ繧・| 繝壹・繧ｸ縺瑚ｦ九∴繧・|
| **蛻ｩ逕ｨ閠・∈謚・* | 繝峨Ο繝・・繝繧ｦ繝ｳ縺梧ｩ溯・縺吶ｋ | 蛻ｩ逕ｨ閠・・杞繧帝∈謚槭〒縺阪ｋ |
| **DevTools Network** | 迥ｶ諷・00縺ｧ / 縺瑚ｿ斐ｋ | F12 竊・Network 竊・繝ｫ繝ｼ繝・RL |

### **繧ｹ繝・ャ繝・: Git 縺ｫ繧ｳ繝溘ャ繝茨ｼ・・繝・す繝･**

```bash
# 菫ｮ豁｣縺ｮ遒ｺ隱・git status
# On branch feat/at-case-records-render
# modified:   app/page.tsx
# modified:   app/home-client.tsx

# 繧ｹ繝・・繧ｸ繝ｳ繧ｰ
git add app/page.tsx app/home-client.tsx

# 繧ｳ繝溘ャ繝・git commit -m "fix: disable auto-redirect to careReceiverId on root page

- Removed _router.replace() that appended ?careReceiverId=AT on / load
- Now / stays clean without query params, user selects care receiver via dropdown
- app/page.tsx: Simplified to not await searchParams
- app/home-client.tsx: Only set state, don't modify URL on mount
- Fixes issue where ?careReceiverId=AT was automatically appended to root"

# 繝励ャ繧ｷ繝･
git push origin feat/at-case-records-render
```

縺ｾ縺溘・ **main 縺ｫ繝槭・繧ｸ縺吶ｋ蝣ｴ蜷・*:

```bash
git checkout main
git pull origin main
git merge feat/at-case-records-render
git push origin main
```

### **繧ｹ繝・ャ繝・: Vercel 繝・・繝ｭ繧､遒ｺ隱・*

1. **Vercel 繝繝・す繝･繝懊・繝・* (https://vercel.com/katoutomohiro/juushin-care-system-v0-careapp8)
   - Deployments 繧ｿ繝・竊・譁ｰ縺励＞繝・・繝ｭ繧､縺瑚・蜍暮幕蟋・   - 繧ｹ繝・・繧ｿ繧ｹ: Building 竊・Ready
   - Logs 繧堤｢ｺ隱阪＠縺ｦ縲√お繝ｩ繝ｼ縺後↑縺・°遒ｺ隱・
2. **Environment Variables 蜀咲｢ｺ隱・*
   - Settings 竊・Environment Variables
   - 笨・NEXT_PUBLIC_SUPABASE_URL
   - 笨・NEXT_PUBLIC_SUPABASE_ANON_KEY
   - 笨・SUPABASE_SERVICE_ROLE_KEY (Secret)

### **繧ｹ繝・ャ繝・: 譛ｬ逡ｪ迺ｰ蠅・〒縺ｮ蜍穂ｽ懃｢ｺ隱・*

**URL**: https://juushin-care-system-v0-careapp8.vercel.app/

| 繝√ぉ繝・け鬆・岼 | 遒ｺ隱肴婿豕・| 譛溷ｾ・､ |
|-------------|--------|--------|
| **URL** | 繧｢繝峨Ξ繧ｹ繝舌・繧定ｦ九ｋ | `https://juushin-care-system-v0-careapp8.vercel.app/` ・・careReceiverId 縺ｪ縺暦ｼ・|
| **繝壹・繧ｸ陦ｨ遉ｺ** | 逕ｻ髱｢蜀・ｮｹ | 繝繝・す繝･繝懊・繝・/ 蛻ｩ逕ｨ閠・∈謚槭′隕九∴繧・|
| **蛻ｩ逕ｨ閠・∈謚・* | 繝峨Ο繝・・繝繧ｦ繝ｳ謫堺ｽ・| 蛻ｩ逕ｨ閠・・杞繧帝∈謚槭〒縺阪ｋ |
| **Network** | F12 竊・Network 竊・Doc | / 縺ｸ縺ｮ GET 縺・200 縺ｧ霑斐ｋ縲〉edirect 縺瑚ｦ句ｽ薙◆繧峨↑縺・|

---

## 笨・螳御ｺ・
縺薙ｌ縺ｫ繧医ｊ・・1. 笨・**/ 縺ｫ ?careReceiverId=AT 縺瑚・蜍穂ｻ倅ｸ弱＆繧後↑縺上↑繧・*
2. 笨・**蛻ｩ逕ｨ閠・∈謚槭・ UI・医ラ繝ｭ繝・・繝繧ｦ繝ｳ・峨〒陦後≧**
3. 笨・**繝ｭ繧ｰ繧､繝ｳ逕ｻ髱｢縺ｸ縺ｮ驕ｷ遘ｻ縺梧ｭ｣蟶ｸ縺ｫ蜍穂ｽ懊☆繧・*
4. 笨・**譛ｬ逡ｪ迺ｰ蠅・ｼ・ercel・峨〒譛溷ｾ・☆繧句虚邱壹↓縺ｪ繧・*

