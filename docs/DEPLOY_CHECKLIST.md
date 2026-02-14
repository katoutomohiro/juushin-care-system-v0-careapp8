# Vercel 譛ｬ逡ｪ繝・・繝ｭ繧､ 繝√ぉ繝・け繝ｪ繧ｹ繝・

> **東 蟇ｾ雎｡隱ｭ閠・*: 繝・・繝ｭ繧､諡・ｽ楢・・°逕ｨ諡・ｽ楢・ 
> **蜑肴署**: `docs/PLAN_DEPLOY.md` 繧堤｢ｺ隱肴ｸ医∩縺ｧ縺ゅｋ縺薙→  
> **驥崎ｦ・*: 繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ・・PI 繧ｭ繝ｼ・峨ｒ GitHub 縺ｫ繧ｳ繝溘ャ繝医＠縺ｪ縺・％縺ｨ

---

## A. 繝・・繝ｭ繧､蜑搾ｼ医Ο繝ｼ繧ｫ繝ｫ・・

### 繧ｳ繝ｼ繝牙刀雉ｪ遒ｺ隱・

- [ ] `pnpm build` 縺後Ο繝ｼ繧ｫ繝ｫ縺ｧ謌仙粥縺吶ｋ
- [ ] `pnpm lint` 縺ｧ繧ｨ繝ｩ繝ｼ縺・0 莉ｶ
- [ ] `pnpm typecheck` 縺ｧ繧ｨ繝ｩ繝ｼ縺・0 莉ｶ
- [ ] `.env.local` 縺・`.gitignore` 縺ｫ蜷ｫ縺ｾ繧後※縺・ｋ
- [ ] 繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ・・PI 繧ｭ繝ｼ・峨′繧ｳ繝ｼ繝牙・縺ｫ繝上・繝峨さ繝ｼ繝峨＆繧後※縺・↑縺・

**遒ｺ隱阪さ繝槭Φ繝・*:
```bash
pnpm build
pnpm lint
pnpm typecheck
grep -E "(SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY)" src/**/*.ts app/**/*.ts
# 竊・繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ縺檎峩謗･譖ｸ縺九ｌ縺ｦ縺・↑縺・％縺ｨ遒ｺ隱・
```

---

## B. Supabase・域悽逡ｪ・画ｺ門ｙ

### 譛ｬ逡ｪ繝励Ο繧ｸ繧ｧ繧ｯ繝域ｧ狗ｯ・

- [ ] 譛ｬ逡ｪ逕ｨ Supabase 繝励Ο繧ｸ繧ｧ繧ｯ繝井ｽ懈・貂医∩
- [ ] `case_records` 繝・・繝悶Ν縺ｫ `version` 繧ｫ繝ｩ繝霑ｽ蜉貂医∩・・igration 驕ｩ逕ｨ貂医∩・・
- [ ] RLS 繝昴Μ繧ｷ繝ｼ縺梧怏蜉ｹ蛹悶＆繧後※縺・ｋ
- [ ] 髢狗匱逕ｨ繧ｷ繝ｼ繝峨ョ繝ｼ繧ｿ・・T縺輔ｓ繝ｻ蛹ｿ蜷搾ｼ画兜蜈･貂医∩

**遒ｺ隱肴婿豕・*:
```bash
# 譛ｬ逡ｪ Supabase 縺ｫ繝ｪ繝ｳ繧ｯ
npx supabase link --project-ref <your-project-id>

# case_records 繝・・繝悶Ν遒ｺ隱・
# Supabase Dashboard 竊・Table Editor 竊・case_records 竊・Columns 縺ｧ version 蛻礼｢ｺ隱・
```

---

## C. Vercel 貅門ｙ・育腸蠅・､画焚・・

### 繧｢繧ｫ繧ｦ繝ｳ繝医・繝ｪ繝昴ず繝医Μ騾｣謳ｺ

- [ ] Vercel 繧｢繧ｫ繧ｦ繝ｳ繝井ｽ懈・貂医∩
- [ ] GitHub 繝ｪ繝昴ず繝医Μ縺ｨ騾｣謳ｺ貂医∩
- [ ] 繝ｪ繝昴ず繝医Μ縺・Vercel Project 縺ｨ縺励※逋ｻ骭ｲ貂医∩

### 迺ｰ蠅・､画焚險ｭ螳・

莉･荳九ｒ **Production / Preview / Development 蜈ｨ縺ｦ縺ｫ險ｭ螳壽ｸ医∩**:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - 蛟､: `https://xxx.supabase.co`
  - 蜿門ｾ怜・: Supabase Dashboard 竊・Project Settings 竊・API 竊・Project URL

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - 蛟､: `eyJhbGciOi...`・・non 繧ｭ繝ｼ・・
  - 蜿門ｾ怜・: Supabase Dashboard 竊・Project Settings 竊・API 竊・anon public

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - 蛟､: `eyJhbGciOi...`・・ervice_role 繧ｭ繝ｼ・・
  - 蜿門ｾ怜・: Supabase Dashboard 竊・Project Settings 竊・API 竊・service_role
  - 笞・・**邨ｶ蟇ｾ縺ｫ蜈ｬ髢九＠縺ｪ縺・％縺ｨ**

- [ ] `NEXT_PUBLIC_APP_URL`・・roduction 縺ｮ縺ｿ謗ｨ螂ｨ・・
  - 蛟､: `https://juushin-care-xxx.vercel.app`・医ョ繝励Ο繧､蠕後↓遒ｺ螳夲ｼ・
  - 逕ｨ騾・ 邨ｶ蟇ｾ URL 逕滓・縲＾GP 繧ｿ繧ｰ縲√Γ繝ｼ繝ｫ遒ｺ隱阪Μ繝ｳ繧ｯ

**遒ｺ隱肴婿豕・*:
```bash
# CLI 縺ｧ險ｭ螳夂｢ｺ隱・
vercel env ls

# 譛溷ｾ・ｵ先棡:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_APP_URL
```

---

## D. 繝・・繝ｭ繧､・・ercel CLI 謗ｨ螂ｨ・・

### 譁ｹ豕・: Vercel CLI・域耳螂ｨ・・

```bash
# 1. Vercel CLI 繧､繝ｳ繧ｹ繝医・繝ｫ
npm install -g vercel

# 2. Vercel 縺ｫ繝ｭ繧ｰ繧､繝ｳ
vercel login

# 3. 繝励Ο繧ｸ繧ｧ繧ｯ繝医Μ繝ｳ繧ｯ・亥・蝗槭・縺ｿ・・
cd c:\dev\juushin-care-system-v0-careapp8
vercel link

# 4. 譛ｬ逡ｪ繝・・繝ｭ繧､
vercel --prod
```

**繝√ぉ繝・け繝ｪ繧ｹ繝・*:
- [ ] Vercel CLI 縺梧ｭ｣蟶ｸ縺ｫ繧､繝ｳ繧ｹ繝医・繝ｫ縺輔ｌ縺ｦ縺・ｋ
- [ ] Vercel 縺ｫ繝ｭ繧ｰ繧､繝ｳ貂医∩
- [ ] 繝励Ο繧ｸ繧ｧ繧ｯ繝医Μ繝ｳ繧ｯ螳御ｺ・
- [ ] 繝・・繝ｭ繧､謌仙粥・・RL 縺瑚｡ｨ遉ｺ縺輔ｌ繧具ｼ・

### 譁ｹ豕・: GitHub 騾｣謳ｺ繝・・繝ｭ繧､・井ｻ｣譖ｿ・・

- [ ] Vercel Dashboard 縺ｧ "Add New Project" 繧偵け繝ｪ繝・け
- [ ] GitHub 繝ｪ繝昴ず繝医Μ繧帝∈謚・
- [ ] Framework Preset 縺・"Next.js" 縺ｧ縺ゅｋ縺薙→繧堤｢ｺ隱・
- [ ] 迺ｰ蠅・､画焚繧貞・縺ｦ險ｭ螳夲ｼ・. 繧貞盾辣ｧ・・
- [ ] "Deploy" 繝懊ち繝ｳ繧偵け繝ｪ繝・け

---

## E. 譛ｬ逡ｪ Supabase 縺ｫ Migration 驕ｩ逕ｨ

### Migration 螳溯｡・

```bash
# 譛ｬ逡ｪ Supabase 縺ｫ繝ｪ繝ｳ繧ｯ
npx supabase link --project-ref <your-project-id>

# Migration 繧呈悽逡ｪ縺ｫ驕ｩ逕ｨ
npx supabase db push
```

**繝√ぉ繝・け繝ｪ繧ｹ繝・*:
- [ ] Migration 螳溯｡梧・蜉・
- [ ] 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺ｪ縺・
- [ ] Supabase Dashboard 縺ｧ `case_records.version` 繧ｫ繝ｩ繝遒ｺ隱肴ｸ医∩

---

## F. 繧ｻ繧ｭ繝･繝ｪ繝・ぅ遒ｺ隱搾ｼ亥倶ｺｺ諠・ｱ・・

### RLS 繝昴Μ繧ｷ繝ｼ遒ｺ隱・

Supabase SQL Editor 縺ｧ莉･荳九ｒ螳溯｡・

```sql
SET ROLE anon;
SELECT full_name, address, phone FROM care_receivers LIMIT 1;
```

**譛溷ｾ・ｵ先棡**:
- [ ] 0 莉ｶ霑泌唆・・LS 縺ｧ蛟倶ｺｺ諠・ｱ縺後・繧ｹ繧ｯ縺輔ｌ縺ｦ縺・ｋ・・
- [ ] 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺ｪ縺・

### 繝ｭ繧ｰ蜃ｺ蜉帷｢ｺ隱・

譛ｬ逡ｪ繝・・繝ｭ繧､蠕後∝茜逕ｨ閠・ュ蝣ｱ邱ｨ髮・判髱｢繧帝幕縺・

- [ ] 繝悶Λ繧ｦ繧ｶ Console 縺ｫ `full_name`, `address`, `phone` 縺悟・蜉帙＆繧後※縺・↑縺・
- [ ] API 繝ｬ繧ｹ繝昴Φ繧ｹ縺・sanitized 縺輔ｌ縺ｦ縺・ｋ
- [ ] 蛟倶ｺｺ諠・ｱ縺後Ο繧ｰ縺ｫ蜷ｫ縺ｾ繧後※縺・↑縺・

### 繧ｷ繝ｼ繝峨ョ繝ｼ繧ｿ遒ｺ隱・

- [ ] seed 繝輔ぃ繧､繝ｫ縺ｫ螳溷錐繝ｻ菴乗園繝ｻ髮ｻ隧ｱ逡ｪ蜿ｷ縺悟性縺ｾ繧後※縺・↑縺・
- [ ] 髢狗匱逕ｨ繧ｷ繝ｼ繝峨ョ繝ｼ繧ｿ縺ｯ蛹ｿ蜷阪・縺ｿ・井ｾ・ `display_name: AT`, `display_name: User-001`・・
- [ ] 譛ｬ逡ｪ迺ｰ蠅・〒縺ｮ縺ｿ螳溘ョ繝ｼ繧ｿ繧貞・蜉・

---

## G. 繝・・繝ｭ繧､蠕後・蜍穂ｽ懃｢ｺ隱搾ｼ域怙遏ｭ繝√ぉ繝・け・・

### 1. 繝医ャ繝励・繝ｼ繧ｸ陦ｨ遉ｺ

```
URL: https://juushin-care-xxx.vercel.app/
```

- [ ] 繝帙・繝逕ｻ髱｢縺瑚｡ｨ遉ｺ縺輔ｌ繧・
- [ ] 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繧ｨ繝ｩ繝ｼ縺ｪ縺・
- [ ] Tailwind CSS 縺碁←逕ｨ縺輔ｌ縺ｦ縺・ｋ

### 2. 繝ｭ繧ｰ繧､繝ｳ

```
URL: https://juushin-care-xxx.vercel.app/login
```

- [ ] 繝ｭ繧ｰ繧､繝ｳ繝輔か繝ｼ繝陦ｨ遉ｺ
- [ ] 繝・せ繝医い繧ｫ繧ｦ繝ｳ繝医〒繝ｭ繧ｰ繧､繝ｳ謌仙粥
- [ ] 繝ｭ繧ｰ繧､繝ｳ蠕後√・繝ｼ繝縺ｫ繝ｪ繝繧､繝ｬ繧ｯ繝・

### 3. AT縺輔ｓ繝壹・繧ｸ

```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT
```

- [ ] 繝励Ο繝輔ぅ繝ｼ繝ｫ陦ｨ遉ｺ
- [ ] "Case Records" 繝懊ち繝ｳ陦ｨ遉ｺ

### 4. 繧ｱ繝ｼ繧ｹ險倬鹸繝輔か繝ｼ繝

```
URL: https://juushin-care-xxx.vercel.app/services/life-care/users/AT/case-records
```

- [ ] 繧ｱ繝ｼ繧ｹ險倬鹸繝輔か繝ｼ繝陦ｨ遉ｺ
- [ ] 閨ｷ蜩｡驕ｸ謚槭ラ繝ｭ繝・・繝繧ｦ繝ｳ蜍穂ｽ・
- [ ] 繝輔か繝ｼ繝蜈･蜉帙・菫晏ｭ俶・蜉・

### 5. 蜷梧凾邱ｨ髮・宛蠕｡・・09 Conflict・・

**謇矩・*:
1. 蜷後§繧ｱ繝ｼ繧ｹ險倬鹸繧・2 縺､縺ｮ繧ｿ繝悶〒髢九￥
2. 繧ｿ繝・1 縺ｧ邱ｨ髮・・菫晏ｭ假ｼ・ersion: 1 竊・2・・
3. 繧ｿ繝・2 縺ｧ蜿､縺・version 縺ｮ縺ｾ縺ｾ菫晏ｭ倩ｩｦ陦・

**譛溷ｾ・虚菴・*:
- [ ] 409 Conflict 繝繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ
- [ ] "譛譁ｰ繝・・繧ｿ繧貞・隱ｭ縺ｿ霎ｼ縺ｿ" 繝懊ち繝ｳ縺ｧ譖ｴ譁ｰ
- [ ] 繧ｿ繝・2 縺ｮ繝輔か繝ｼ繝縺梧怙譁ｰ繝・・繧ｿ縺ｫ繝ｪ繝輔Ξ繝・す繝･

---

## H. 逶｣隕悶・繝ｭ繧ｰ

### Vercel 繝ｭ繧ｰ遒ｺ隱・

```bash
# 繝ｪ繧｢繝ｫ繧ｿ繧､繝繝ｭ繧ｰ
vercel logs --follow

# 譛霑代・繝ｭ繧ｰ
vercel logs
```

**繝√ぉ繝・け繝ｪ繧ｹ繝・*:
- [ ] 繧ｨ繝ｩ繝ｼ繝ｭ繧ｰ縺ｪ縺・
- [ ] 繝薙Ν繝画・蜉・
- [ ] 繝・・繝ｭ繧､螳御ｺ・

### Supabase 繝ｭ繧ｰ遒ｺ隱・

1. Supabase Dashboard 竊・Logs
2. 縲訓ostgres Logs縲阪〒繧ｯ繧ｨ繝ｪ繧ｨ繝ｩ繝ｼ遒ｺ隱・
3. 縲窟PI Logs縲阪〒繝ｪ繧ｯ繧ｨ繧ｹ繝医お繝ｩ繝ｼ遒ｺ隱・

**繝√ぉ繝・け繝ｪ繧ｹ繝・*:
- [ ] 繧ｯ繧ｨ繝ｪ繧ｨ繝ｩ繝ｼ縺ｪ縺・
- [ ] API 繧ｨ繝ｩ繝ｼ縺ｪ縺・
- [ ] RLS 繧ｨ繝ｩ繝ｼ縺ｪ縺・

---

## I. 繝医Λ繝悶Ν譎ゑｼ域怙蟆乗焔鬆・ｼ・

### 繧ｨ繝ｩ繝ｼ: "Supabase client error"

**遒ｺ隱・*:
```bash
vercel env ls
```

**菫ｮ豁｣**:
1. Vercel Dashboard 縺ｧ迺ｰ蠅・､画焚繧貞・遒ｺ隱・
2. 蛟､繧剃ｿｮ豁｣
3. `vercel --prod` 縺ｧ蜀阪ョ繝励Ο繧､

### 繧ｨ繝ｩ繝ｼ: "Table 'case_records' does not exist"

**菫ｮ豁｣**:
```bash
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

### 繧ｨ繝ｩ繝ｼ: "RLS policy violation"

**遒ｺ隱・*:
1. Supabase Dashboard 竊・Authentication 縺ｧ 繝・せ繝医Θ繝ｼ繧ｶ繝ｼ遒ｺ隱・
2. Table Editor 竊・Policies 縺ｧ RLS 繝昴Μ繧ｷ繝ｼ遒ｺ隱・

**隗｣豎ｺ**:
- 髢狗匱迺ｰ蠅・〒縺ｯ RLS 繧剃ｸ譎ら┌蜉ｹ蛹悶＠縺ｦ繝・せ繝・
- 譛ｬ逡ｪ縺ｧ縺ｯ驕ｩ蛻・↑ RLS 繝昴Μ繧ｷ繝ｼ繧定ｨｭ螳・

### 繧ｨ繝ｩ繝ｼ: "409 Conflict 縺悟ｸｸ縺ｫ逋ｺ逕溘☆繧・

**遒ｺ隱・*:
```sql
SELECT id, version, updated_at FROM case_records ORDER BY updated_at DESC LIMIT 10;
```

**菫ｮ豁｣**:
- 繝医Μ繧ｬ繝ｼ `increment_version()` 縺梧ｭ｣縺励￥菴懈・縺輔ｌ縺ｦ縺・ｋ縺狗｢ｺ隱・
- migration 繝輔ぃ繧､繝ｫ繧貞・螳溯｡・

---

## J. 繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ・育ｷ頑･譎ゅ・縺ｿ・・

### Vercel 繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ

```bash
# 譛霑代・繝・・繝ｭ繧､荳隕ｧ
vercel ls

# 蜑阪・繝・・繝ｭ繧､縺ｫ謌ｻ縺・
vercel rollback <deployment-url>
```

**繝√ぉ繝・け繝ｪ繧ｹ繝・*:
- [ ] 繝・・繝ｭ繧､荳隕ｧ陦ｨ遉ｺ謌仙粥
- [ ] 繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ螳溯｡梧・蜉・
- [ ] 蜑阪・ URL 縺ｧ蜍穂ｽ懃｢ｺ隱・

### Supabase 繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ・域・驥阪↓・・

```bash
# 繝ｭ繝ｼ繧ｫ繝ｫ縺ｧ migration 繧貞炎髯､蠕後∝・蠎ｦ push
npx supabase db reset
```

**繝√ぉ繝・け繝ｪ繧ｹ繝・*:
- [ ] 繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ螳溯｡悟燕縺ｫ繝舌ャ繧ｯ繧｢繝・・遒ｺ隱・
- [ ] 譛ｬ逡ｪ繝・・繧ｿ縺ｸ縺ｮ蠖ｱ髻ｿ繧呈怙蟆丞喧

---

## 統 譛邨ゅメ繧ｧ繝・け

- [ ] 縺吶∋縺ｦ縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ A・曷 縺悟ｮ御ｺ・
- [ ] 譛ｬ逡ｪ迺ｰ蠅・〒譛溷ｾ・虚菴懊ｒ遒ｺ隱・
- [ ] 繝ｭ繧ｰ縺ｫ繧ｨ繝ｩ繝ｼ縺後↑縺・
- [ ] 繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ縺・GitHub 縺ｫ繧ｳ繝溘ャ繝医＆繧後※縺・↑縺・

---

**繝・・繝ｭ繧､螳御ｺ・律**: _______________  
**繝・・繝ｭ繧､諡・ｽ楢・*: _______________  
**URL**: https://_______________  

---

髢｢騾｣繝峨く繝･繝｡繝ｳ繝・
- [PLAN_DEPLOY.md](PLAN_DEPLOY.md)
- [API_ROUTE_EXAMPLE_RLS.md](API_ROUTE_EXAMPLE_RLS.md)
- [SETUP_LOCAL.md](../SETUP_LOCAL.md)

