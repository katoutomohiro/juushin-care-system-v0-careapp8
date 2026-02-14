# 譛ｬ逡ｪ迺ｰ蠅・ｯｾ蠢懊メ繧ｧ繝・け繝ｪ繧ｹ繝・
> **螳御ｺ・擅莉ｶ**:
> - localhost 繧剃ｽｿ繧上★繝悶Λ繧ｦ繧ｶ縺九ｉ譛ｬ逡ｪ URL 縺ｧ豁｣蟶ｸ蜍穂ｽ・> - 蛻ｩ逕ｨ閠・ｮ｡逅・↓蜈ｨ 24 蜷阪′陦ｨ遉ｺ
> - 邱ｨ髮・・霑ｽ蜉繝ｻ蜑企勁縺悟叉譎ょ渚譏
> - 謗･邯壹お繝ｩ繝ｼ縺檎匱逕溘＠縺ｪ縺・
## 笨・Phase 1: 繝ｭ繝ｼ繧ｫ繝ｫ讀懆ｨｼ (dev 繧ｵ繝ｼ繝舌・)

### 1.1 隱崎ｨｼ繝溘ラ繝ｫ繧ｦ繧ｧ繧｢繝・せ繝・
```bash
# Step 1: dev 繧ｵ繝ｼ繝舌・繧偵Μ繧ｻ繝・ヨ
pnpm run reboot

# Step 2: 繝悶Λ繧ｦ繧ｶ縺ｧ http://dev-app.local:3000 縺ｫ繧｢繧ｯ繧ｻ繧ｹ
# 譛溷ｾ・ｵ先棡: /login 繝壹・繧ｸ縺ｸ閾ｪ蜍輔Μ繝繧､繝ｬ繧ｯ繝・
# Step 3: 辟｡蜉ｹ縺ｪ隱崎ｨｼ諠・ｱ縺ｧ繝ｭ繧ｰ繧､繝ｳ隧ｦ陦・# Email: invalid@example.com
# Password: wrongpassword
# 譛溷ｾ・ｵ先棡: 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縲後Ο繧ｰ繧､繝ｳ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲崎｡ｨ遉ｺ
```

### 1.2 繝ｭ繧ｰ繧､繝ｳ 竊・繧ｹ繧ｿ繝・ヵ繝励Ο繝輔ぅ繝ｼ繝ｫ讀懆ｨｼ

```bash
# Step 1: 譛牙柑縺ｪ繝・せ繝医い繧ｫ繧ｦ繝ｳ繝医〒繝ｭ繧ｰ繧､繝ｳ
# Email: staff.lifecare@example.com
# Password: [seed.sql 縺ｫ螳夂ｾｩ縺輔ｌ縺溘ヱ繧ｹ繝ｯ繝ｼ繝云

# Step 2: 繝ｭ繧ｰ繧､繝ｳ蠕後・繝ｪ繝繧､繝ｬ繧ｯ繝・# 譛溷ｾ・ｵ先棡: /services/life-care/users 繝壹・繧ｸ縺ｸ閾ｪ蜍暮・遘ｻ

# Step 3: 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ縺ｧ繧ｨ繝ｩ繝ｼ遒ｺ隱・# 譛溷ｾ・ｵ先棡: CORS 繧ｨ繝ｩ繝ｼ縺ｪ縺励ヾupabase API 繧ｨ繝ｩ繝ｼ縺ｪ縺・```

### 1.3 蛻ｩ逕ｨ閠・ｸ隕ｧ陦ｨ遉ｺ (RLS 繝輔ぅ繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ)

```bash
# Step 1: 繝悶Λ繧ｦ繧ｶ縺ｧ /services/life-care/users 繝壹・繧ｸ陦ｨ遉ｺ
# 譛溷ｾ・ｵ先棡:
#   - 縲檎函豢ｻ莉玖ｭｷ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ陦ｨ遉ｺ
#   - 蛻ｩ逕ｨ閠・焚: 14 蜷搾ｼ・ife-care facility 縺ｮ users 縺ｮ縺ｿ・・#   - 繧ｳ繝ｳ繝昴・繝阪Φ繝郁｡ｨ遉ｺ: CreateCareReceiverModal, refresh button

# Step 2: 縲梧叛隱ｲ蠕檎ｭ峨ョ繧､繧ｵ繝ｼ繝薙せ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ遒ｺ隱・# 譛溷ｾ・ｵ先棡:
#   - 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ陦ｨ遉ｺ
#   - 蛻ｩ逕ｨ閠・焚: 10 蜷搾ｼ・fter-school facility 縺ｮ users 縺ｮ縺ｿ・・
# Step 3: 蜷郁ｨ育｢ｺ隱・# 譛溷ｾ・ｵ先棡: 14 + 10 = 24 蜷阪′陦ｨ遉ｺ
```

### 1.4 API 隱崎ｨｼ繝・せ繝・
```bash
# Step 1: 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ縺ｧ API 逶ｴ謗･蜻ｼ縺ｳ蜃ｺ縺・fetch('/api/care-receivers/list?serviceCode=life-care', { cache: 'no-store' })
  .then(r => r.json())
  .then(d => console.log(d))

# 譛溷ｾ・ｵ先棡:
# {
#   ok: true,
#   users: [...14 users...],
#   count: 14
# }

# Step 2: 隱崎ｨｼ縺ｪ縺励い繧ｯ繧ｻ繧ｹ繝・せ繝・# 繝悶Λ繧ｦ繧ｶ縺ｧ譁ｰ隕上す繝ｼ繧ｯ繝ｬ繝・ヨ遯薙ｒ髢九￥ 竊・dev-app.local:3000 竊・/login 縺ｸ繝ｪ繝繧､繝ｬ繧ｯ繝育｢ｺ隱・# 譛溷ｾ・ｵ先棡: 繧ｻ繝・す繝ｧ繝ｳ蛻・ｌ縺ｧ /login 縺ｸ蠑ｷ蛻ｶ驕ｷ遘ｻ
```

### 1.5 RLS 蠑ｷ蛻ｶ繝・せ繝・
```bash
# Step 1: 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ縺ｧ縲∝挨 facility 縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ蜑企勁繧定ｩｦ陦・const facilityId = 'after-school-facility-id'
const careReceiverId = 'life-care-user-id'
fetch(`/api/care-receivers/[${careReceiverId}]`, {
  method: 'DELETE',
  cache: 'no-store'
})
.then(r => r.json())
.then(d => console.log(d))

# 譛溷ｾ・ｵ先棡:
# {
#   ok: false,
#   error: "Not found or access denied",
#   status: 404 (RLS 縺ｫ繧医ｊ蜑企勁讓ｩ髯舌↑縺・
# }
```

### 1.6 Realtime 蜷梧悄繝・せ繝・
```bash
# Step 1: 繝悶Λ繧ｦ繧ｶ縺ｧ 2 縺､縺ｮ遯薙ｒ髢九￥
# Window 1: 繝ｭ繧ｰ繧､繝ｳ 竊・/services/life-care/users
# Window 2: 繝ｭ繧ｰ繧､繝ｳ 竊・/services/life-care/users

# Step 2: Window 1 縺ｧ蛻ｩ逕ｨ閠・ｿｽ蜉
# CreateCareReceiverModal 縺ｧ譁ｰ隕丞茜逕ｨ閠・ｿｽ蜉 竊・"菫晏ｭ・ 繧ｯ繝ｪ繝・け

# Step 3: Window 2 縺ｧ縺ｮ蜿肴丐遒ｺ隱・# 譛溷ｾ・ｵ先棡: 謇句虚繝ｪ繝輔Ξ繝・す繝･縺ｪ縺励↓譁ｰ隕丞茜逕ｨ閠・′蜊ｳ蠎ｧ縺ｫ陦ｨ遉ｺ縺輔ｌ繧・# 螳溯｣・ useRealtimeCareReceivers() 竊・router.refresh() 閾ｪ蜍募ｮ溯｡・```

### 1.7 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ遒ｺ隱・
```bash
# Step 1: 繝阪ャ繝医Ρ繝ｼ繧ｯ驕ｮ譁ｭ繝・せ繝・# DevTools 竊・Network 竊・Offline 縺ｫ險ｭ螳・竊・繝壹・繧ｸ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ

# 譛溷ｾ・ｵ先棡:
# - 繝ｭ繝ｼ繧ｫ繝ｫ cache 縺ｾ縺溘・ IndexedDB 縺九ｉ繝・・繧ｿ陦ｨ遉ｺ・医ヵ繧ｩ繝ｼ繝ｫ繝舌ャ繧ｯ・・# - 縺ｾ縺溘・譏守｢ｺ縺ｪ繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ陦ｨ遉ｺ・磯壻ｿ｡繧ｨ繝ｩ繝ｼ・・
# Step 2: Supabase 繝繧ｦ繝ｳ繧ｷ繝溘Η繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ
# .env.local 縺ｮ NEXT_PUBLIC_SUPABASE_URL 繧堤┌蜉ｹ縺ｪ蛟､縺ｫ螟画峩
# 繝壹・繧ｸ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ

# 譛溷ｾ・ｵ先棡:
# - HTTP 500 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ陦ｨ遉ｺ
# - 繧ｨ繝ｩ繝ｼ繝ｭ繧ｰ: "[GET /api/care-receivers] Supabase query error"
```

## 笨・Phase 2: Vercel 繝・・繝ｭ繧､蜑肴ｺ門ｙ

### 2.1 迺ｰ蠅・､画焚遒ｺ隱・
```bash
# Step 1: .env.local 繝輔ぃ繧､繝ｫ繧堤｢ｺ隱・cat .env.local

# 蠢・亥､画焚:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY (繧ｪ繝励す繝ｧ繝ｳ, admin API 逕ｨ)

# Step 2: localhost 蜿ら・繧貞炎髯､
grep -r "dev-app.local:3000" --include="*.ts" --include="*.tsx" --include="*.js"

# 譛溷ｾ・ｵ先棡: 繝薙Ν繝峨せ繧ｯ繝ｪ繝励ヨ莉･螟悶↓繝槭ャ繝√↑縺・```

### 2.2 繝薙Ν繝画､懆ｨｼ

```bash
pnpm run build

# 譛溷ｾ・ｵ先棡:
# 笨・Built successfully
# 笨・No errors
# 笨・Page files: 45+
# 笨・Static assets: 120+
```

### 2.3 蝙九メ繧ｧ繝・け + Lint 讀懆ｨｼ

```bash
pnpm typecheck
pnpm lint

# 譛溷ｾ・ｵ先棡:
# 笨・TypeScript types valid
# 笨・ESLint: 0 errors
# 笨・ESLint: warnings acceptable (non-critical)
```

### 2.4 繝・せ繝亥ｮ溯｡・
```bash
pnpm test:unit   # Vitest
pnpm test:e2e    # Playwright

# 譛溷ｾ・ｵ先棡: 縺吶∋縺ｦ縺ｮ繝・せ繝医′ PASS
# 縺ｾ縺溘・譌｢遏･縺ｮ skip 繝・せ繝医・縺ｿ SKIP
```

## 笨・Phase 3: Vercel 縺ｫ繝・・繝ｭ繧､

### 3.1 Vercel CLI 縺ｧ繝励Ξ繝薙Η繝ｼ

```bash
pnpm install -g vercel
vercel

# 蟇ｾ隧ｱ逧・↓:
# ? Set up and deploy ~/path/to/juushin-care-system-v0-careapp8? yes
# ? Which scope? (your-org)
# ? Link to existing project? no
# ? What's your project name? juushin-care-system
# ? In which directory is your code? .
# ? Want to modify these settings before deploying? no

# 譛溷ｾ・ｵ先棡: Preview URL 縺檎函謌舌＆繧後ｋ (e.g., https://juushin-care-system-abc123.vercel.app)
```

### 3.2 Vercel 繝励Ξ繝薙Η繝ｼ迺ｰ蠅・､画焚險ｭ螳・
```bash
# Step 1: Vercel Dashboard 竊・Settings 竊・Environment Variables

# 迺ｰ蠅・､画焚繧定ｨｭ螳・
NEXT_PUBLIC_SUPABASE_URL = [your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key] (SENSITIVE)

# Step 2: Redeploy
vercel --prod

# Step 3: Preview URL 縺ｧ荳願ｨ倥ユ繧ｹ繝・(Phase 1.1 ~ 1.7) 繧貞・螳溯｡・```

### 3.3 譛ｬ逡ｪ繝峨Γ繧､繝ｳ險ｭ螳・(繧ｫ繧ｹ繧ｿ繝 URL)

```bash
# Step 1: Vercel Dashboard 竊・Domains 竊・Add
# 繝峨Γ繧､繝ｳ萓・ care-system.example.com

# Step 2: DNS 險ｭ螳・(繝峨Γ繧､繝ｳ繝ｬ繧ｸ繧ｹ繝医Λ縺ｧ)
# CNAME record:
# care-system.example.com 竊・cname.vercel.sh

# Step 3: Vercel 縺ｧ遒ｺ隱・# ? Domain connected? yes

# Step 4: HTTPS 縺瑚・蜍墓怏蜉ｹ蛹悶＆繧後ｋ (Let's Encrypt)
# 譛溷ｾ・ｵ先棡: https://care-system.example.com 縺ｧ謗･邯壼庄閭ｽ
```

## 笨・Phase 4: 譛ｬ逡ｪ遒ｺ隱・
### 4.1 譛ｬ逡ｪ迺ｰ蠅・〒縺ｮ繝ｭ繧ｰ繧､繝ｳ繝・せ繝・
```bash
# Step 1: 繝悶Λ繧ｦ繧ｶ縺ｧ https://care-system.example.com (譛ｬ逡ｪ URL) 縺ｫ繧｢繧ｯ繧ｻ繧ｹ
# 譛溷ｾ・ｵ先棡: /login 縺ｫ繝ｪ繝繧､繝ｬ繧ｯ繝・
# Step 2: 繧ｹ繧ｿ繝・ヵ繧｢繧ｫ繧ｦ繝ｳ繝医〒繝ｭ繧ｰ繧､繝ｳ
# Email: staff.lifecare@example.com
# Password: [password]
# 譛溷ｾ・ｵ先棡: /services/life-care/users 繝壹・繧ｸ縺ｸ驕ｷ遘ｻ

# Step 3: 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ縺ｧ API 繝・せ繝・fetch('/api/care-receivers/list?serviceCode=life-care')
  .then(r => r.json())
  .then(d => console.log(d.count))

# 譛溷ｾ・ｵ先棡: 14
```

### 4.2 繝槭Ν繝√Θ繝ｼ繧ｶ繝ｼ蜷梧凾謗･邯壹ユ繧ｹ繝・
```bash
# Step 1: 2 縺､縺ｮ繝悶Λ繧ｦ繧ｶ (or 蛻･繝ｦ繝ｼ繧ｶ繝ｼ) 縺ｧ蜷梧凾繝ｭ繧ｰ繧､繝ｳ
# Browser A: staff.lifecare@example.com 竊・life-care facility
# Browser B: staff.afterschool@example.com 竊・after-school facility

# Step 2: Browser A 縺ｧ繝ｦ繝ｼ繧ｶ繝ｼ邱ｨ髮・# 繝ｦ繝ｼ繧ｶ繝ｼ "螟ｪ驛・ 竊・"螟ｪ驛・(邱ｨ髮・ｸ医∩)" 縺ｫ螟画峩 竊・菫晏ｭ・
# Step 3: Browser A 縺ｧ縺ｮ蜿肴丐遒ｺ隱・# 譛溷ｾ・ｵ先棡: 繝ｪ繧｢繝ｫ繧ｿ繧､繝縺ｧ螟画峩縺瑚｡ｨ遉ｺ縺輔ｌ繧・(Realtime subscription)

# Step 4: Browser B 縺ｧ縺ｮ遒ｺ隱・# 譛溷ｾ・ｵ先棡: Browser B 縺ｧ縺ｯ after-school facility 縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ縺ｿ陦ｨ遉ｺ
# Browser A 縺ｮ life-care 繝ｦ繝ｼ繧ｶ繝ｼ螟画峩縺ｯ Browser B 縺ｫ蠖ｱ髻ｿ縺励↑縺・```

### 4.3 繧ｻ繧ｭ繝･繝ｪ繝・ぅ遒ｺ隱・
```bash
# Step 1: RLS 繝昴Μ繧ｷ繝ｼ遒ｺ隱・# Supabase Dashboard 竊・Authentication 竊・Users
# 2 縺､縺ｮ繝・せ繝医い繧ｫ繧ｦ繝ｳ繝医・ facility_id 縺檎焚縺ｪ繧九％縺ｨ繧堤｢ｺ隱・
# Step 2: 繧ｹ繝昴・繝輔ぅ繝ｳ繧ｰ隧ｦ陦・# Browser A 縺ｧ API 逶ｴ謗･蜻ｼ縺ｳ蜃ｺ縺・
fetch('/api/care-receivers/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'HACKER-001',
    name: 'Hacker',
    service_code: 'after-school',  // Browser A 縺ｯ life-care facility
    facility_id: 'after-school-facility-id'  // 蛻･ facility 縺ｫ蜈･蜉・  })
})

# 譛溷ｾ・ｵ先棡: HTTP 201 縺縺後’acility_id 縺ｯ閾ｪ蜍慕噪縺ｫ life-care 縺ｫ荳頑嶌縺阪＆繧後ｋ
# (server side 縺ｧ profile.facility_id 繧貞ｼｷ蛻ｶ)
```

### 4.4 髫懷ｮｳ譎ょｯｾ蠢懃｢ｺ隱・
```bash
# Step 1: Supabase 繧剃ｸ譎ら噪縺ｫ蛛懈ｭ｢ (or Vercel 縺ｮ Network offline)
# 竊・繝壹・繧ｸ繧｢繧ｯ繧ｻ繧ｹ譎ゅ↓繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺瑚｡ｨ遉ｺ縺輔ｌ繧・# 譛溷ｾ・ｵ先棡:
# - 騾壻ｿ｡繧ｨ繝ｩ繝ｼ: "騾壻ｿ｡繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆"
# - Clear error messages with no stack traces exposed

# Step 2: Supabase 繧貞・髢・# 竊・繝壹・繧ｸ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ or 譖ｴ譁ｰ繝懊ち繝ｳ 竊・豁｣蟶ｸ蠕ｩ蟶ｰ
# 譛溷ｾ・ｵ先棡: 繝・・繧ｿ縺悟・蠎ｦ隱ｭ縺ｿ霎ｼ縺ｾ繧後ｋ
```

## 笨・Phase 5: 逶｣隕・+ 繝ｭ繧ｮ繝ｳ繧ｰ

### 5.1 Vercel Analytics

```bash
# Step 1: Vercel Dashboard 竊・Analytics
# 遒ｺ隱埼・岼:
#   - Page Load Time
#   - First Contentful Paint (FCP)
#   - Cumulative Layout Shift (CLS)

# 譛溷ｾ・ｵ先棡:
#   - FCP: < 2 sec
#   - LCP: < 3 sec
#   - CLS: < 0.1
```

### 5.2 Supabase Realtime 繝ｭ繧ｰ

```bash
# Supabase Dashboard 竊・Realtime
# 謗･邯壽焚縲√Γ繝・そ繝ｼ繧ｸ謨ｰ繧堤｢ｺ隱・
# 譛溷ｾ・ｵ先棡:
#   - Active connections: 蛻ｩ逕ｨ荳ｭ縺ｮ遶ｯ譛ｫ謨ｰ縺ｫ蠢懊§縺ｦ 1~10+
#   - No errors in logs
```

### 5.3 API 繧ｨ繝ｩ繝ｼ繝ｭ繧ｰ

```bash
# Vercel Dashboard 竊・Functions (or Logs)
# API route 縺ｮ蜻ｼ縺ｳ蜃ｺ縺礼ｵ先棡繧堤｢ｺ隱・
# 譛溷ｾ・ｵ先棡:
#   - GET /api/care-receivers/list: 200 responses
#   - POST /api/care-receivers/list: 201 (create) or 400 (validation)
#   - DELETE requests: 200 (success) or 404 (RLS blocked)
```

## 笨・Phase 6: 譛ｬ逡ｪ驕狗畑繝上Φ繝峨ヶ繝・け

### 6.1 繝ｦ繝ｼ繧ｶ繝ｼ霑ｽ蜉謇矩・
```bash
# Supabase Dashboard 竊・Authentication 竊・Add user
# Step 1: Email: new-staff@example.com
# Step 2: Auto-generate password or set manual password
# Step 3: Supabase Dashboard 竊・Staff Profiles 繝・・繝悶Ν 竊・Insert
# {
#   id: [auth user id],
#   facility_id: [facility id],  # "life-care" or "after-school"
#   role: "staff",                # "admin" | "staff" | "viewer"
#   created_at: now()
# }

# Step 4: 繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ繝｡繝ｼ繝ｫ騾夂衍・域焔蜍包ｼ・```

### 6.2 繝舌ャ繧ｯ繧｢繝・・謇矩・
```bash
# Supabase Dashboard 竊・Database 竊・Backups
# Weekly automatic backups are enabled by default

# 謇句虚繝舌ャ繧ｯ繧｢繝・・:
# 1. Supabase Dashboard 竊・Database 竊・Backups 竊・"Backup Now"
# 2. 繝繧ｦ繝ｳ繝ｭ繝ｼ繝牙庄閭ｽ迥ｶ諷九↓縺ｪ繧九∪縺ｧ蠕・ｩ滂ｼ・~5 蛻・ｼ・# 3. CSV export: care_receivers, case_records 繝・・繝悶Ν縺ｮ繧ｨ繧ｯ繧ｹ繝昴・繝・```

### 6.3 繝｢繝九ち繝ｪ繝ｳ繧ｰ+ 繧｢繝ｩ繝ｼ繝郁ｨｭ螳・
```bash
# Supabase Dashboard 竊・SQL Editor
# 莉･荳九・逶｣隕悶け繧ｨ繝ｪ繧貞ｮ壽悄螳溯｡・(daily):

-- 1. 繝ｦ繝ｼ繧ｶ繝ｼ逋ｻ骭ｲ謨ｰ
SELECT COUNT(*) as total_users FROM care_receivers WHERE is_active = TRUE;

-- 2. 譛ｬ譌･縺ｮ繧ｱ繧｢險倬鹸謨ｰ
SELECT COUNT(*) as records_today 
FROM case_records 
WHERE DATE(created_at) = CURRENT_DATE;

-- 3. API 繧ｨ繝ｩ繝ｼ莉ｶ謨ｰ
SELECT COUNT(*) FROM logs 
WHERE level = 'error' AND created_at > NOW() - INTERVAL '1 hour';
```

## 繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

### Q: 繝ｭ繧ｰ繧､繝ｳ蠕後・/login 繝壹・繧ｸ縺瑚｡ｨ遉ｺ縺輔ｌ邯壹￠繧・

**A:** 
- Supabase 繧ｻ繝・す繝ｧ繝ｳ譛牙柑譛滄剞繧堤｢ｺ隱・ Dashboard 竊・Authentication 竊・Policies
- Middleware 縺悟ｮ溯｡後＆繧後※縺・ｋ縺狗｢ｺ隱・ DevTools 竊・Network 竊・middleware.js/js
- .env.local 縺ｮ NEXT_PUBLIC_SUPABASE_URL 縺梧ｭ｣縺励＞縺狗｢ｺ隱・
### Q: "RLS policy violation" 繧ｨ繝ｩ繝ｼ縺悟・繧・
**A:**
- User 縺ｮ staff_profiles 縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱・
  ```sql
  SELECT * FROM staff_profiles WHERE id = 'user-id';
  ```
- facility_id 縺梧ｭ｣縺励￥險ｭ螳壹＆繧後※縺・ｋ縺狗｢ｺ隱・- RLS 繝昴Μ繧ｷ繝ｼ繧堤｢ｺ隱・ Dashboard 竊・SQL Editor 竊・Policies

### Q: Realtime 譖ｴ譁ｰ縺悟渚譏縺輔ｌ縺ｪ縺・
**A:**
- Supabase Realtime 縺梧怏蜉ｹ縺狗｢ｺ隱・ Dashboard 竊・Realtime
- 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ: `[useRealtimeCareReceivers] Subscription error` 繧堤｢ｺ隱・- Supabase 繧ｹ繝・・繧ｿ繧ｹ繝壹・繧ｸ繧堤｢ｺ隱・ https://status.supabase.com

### Q: "謗･邯壹お繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆" 繝｡繝・そ繝ｼ繧ｸ縺悟・繧・
**A:**
- Network 繧ｿ繝悶〒 API 蜻ｼ縺ｳ蜃ｺ縺励・ status code 繧堤｢ｺ隱・  - 401: 隱崎ｨｼ螟ｱ謨・竊・繝ｭ繧ｰ繧､繝ｳ縺礼峩縺・  - 403: 讓ｩ髯舌↑縺・竊・RLS 繝昴Μ繧ｷ繝ｼ繧堤｢ｺ隱・  - 500: 繧ｵ繝ｼ繝舌・繧ｨ繝ｩ繝ｼ 竊・Supabase 繝ｭ繧ｰ繧堤｢ｺ隱・- Supabase Status: https://status.supabase.com 縺ｧ髫懷ｮｳ繧堤｢ｺ隱・
## 繝√ぉ繝・け繝ｪ繧ｹ繝域怙邨ら｢ｺ隱・
- [ ] Phase 1.1~1.7: 繝ｭ繝ｼ繧ｫ繝ｫ讀懆ｨｼ螳御ｺ・- [ ] Phase 2.1~2.4: 繝薙Ν繝・+ 蝙九メ繧ｧ繝・け + Lint + 繝・せ繝域・蜉・- [ ] Phase 3.1~3.3: Vercel 繝・・繝ｭ繧､ + 繝峨Γ繧､繝ｳ險ｭ螳壼ｮ御ｺ・- [ ] Phase 4.1~4.4: 譛ｬ逡ｪ迺ｰ蠅・〒縺ｮ蜈ｨ繝・せ繝域・蜉・- [ ] Phase 5.1~5.3: 逶｣隕・+ 繝ｭ繧ｮ繝ｳ繧ｰ遒ｺ隱・- [ ] Phase 6.1~6.3: 驕狗畑繝上Φ繝峨ヶ繝・け貅門ｙ螳御ｺ・
**蜈ｨ繝√ぉ繝・け繝槭・繧ｯ螳御ｺ・凾轤ｹ縺ｧ譛ｬ逡ｪ驕狗畑蜿ｯ閭ｽ**

---

譛邨よ峩譁ｰ: 2025-02-17  
諡・ｽ・ GitHub Copilot + ChatGPT  
谺｡遒ｺ隱肴律: 豈朱ｱ譛域屆 09:00 JST

