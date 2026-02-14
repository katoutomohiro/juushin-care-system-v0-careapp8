# Vercel 繝・・繝ｭ繧､繝｡繝ｳ繝亥ｮ悟・繝√ぉ繝・け繝ｪ繧ｹ繝・
## 搭 繝・・繝ｭ繧､蜑阪メ繧ｧ繝・け

### 1. 繝ｪ繝昴ず繝医Μ遒ｺ隱・- [ ] 豁｣縺励＞繝ｪ繝昴ず繝医Μ: katoutomohiro/juushin-care-system-v0-careapp8
- [ ] 豁｣縺励＞繝悶Λ繝ｳ繝・ main or feat/at-case-records-render
- [ ] GitHub 縺ｫ push 貂医∩: `git log --oneline -1`

### 2. 繝ｭ繝ｼ繧ｫ繝ｫ繝薙Ν繝臥｢ｺ隱・```bash
pnpm install
pnpm typecheck   # 笨・繧ｨ繝ｩ繝ｼ縺ｪ縺・pnpm lint        # 笨・繧ｨ繝ｩ繝ｼ縺ｪ縺・pnpm build       # 笨・Build success
pnpm dev         # 笨・http://dev-app.local:3000 縺ｧ / 繧帝幕縺・# 譛溷ｾ・ ?careReceiverId=AT 縺御ｻ倥°縺ｪ縺・```

### 3. Vercel Dashboard 遒ｺ隱・- [ ] Project: juushin-care-system-v0-careapp8
- [ ] Settings 竊・Git 竊・Connected Repository = katoutomohiro/juushin-care-system-v0-careapp8
- [ ] Settings 竊・Branches 竊・Production = main
- [ ] Settings 竊・Environment Variables 繧堤｢ｺ隱・
  - [ ] NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_...
  - [ ] SUPABASE_SERVICE_ROLE_KEY = sb_secret_... (Secret 縺ｨ縺励※)

### 4. Vercel 繝・・繝ｭ繧､螳溯｡・- [ ] git push origin main
- [ ] Vercel 繝繝・す繝･繝懊・繝峨〒閾ｪ蜍輔ョ繝励Ο繧､髢句ｧ狗｢ｺ隱・- [ ] Deployments 竊・[譛譁ｰ] 竊・Logs 縺ｧ Build Success 遒ｺ隱・
### 5. 譛ｬ逡ｪ迺ｰ蠅・〒縺ｮ蜍穂ｽ懃｢ｺ隱・- [ ] https://juushin-care-system-v0-careapp8.vercel.app/ 縺ｸ繧｢繧ｯ繧ｻ繧ｹ
- [ ] 繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ繧ｦ繧｣繝ｳ繝峨え縺ｧ遒ｺ隱搾ｼ医く繝｣繝・す繝･縺ｪ縺暦ｼ・- [ ] DevTools 竊・Network 縺ｧ縲・ 縺ｸ縺ｮ繝ｪ繧ｯ繧ｨ繧ｹ繝医′ 200 OK 縺ｧ霑斐ｋ
- [ ] URL 繝舌・縺ｫ ?careReceiverId=AT 縺御ｻ倥＞縺ｦ縺・↑縺・- [ ] 繝帙・繝逕ｻ髱｢縺瑚｡ｨ遉ｺ縺輔ｌ繧・- [ ] 蛻ｩ逕ｨ閠・∈謚槭ラ繝ｭ繝・・繝繧ｦ繝ｳ縺梧ｩ溯・縺吶ｋ

### 6. 繧ｭ繝｣繝・す繝･繧ｯ繝ｪ繧｢・亥ｿ・ｦ√↓蠢懊§縺ｦ・・```bash
# Vercel Dashboard 竊・Deployments 竊・[譛譁ｰ] 竊・More 竊・Redeploy
# 竊・"Redeploy without cache" 繧帝∈謚・```

### 7. HTTP 繝倥ャ繝遒ｺ隱搾ｼ亥撫鬘梧凾縺ｮ繝・ヰ繝・げ・・```bash
curl -I https://juushin-care-system-v0-careapp8.vercel.app/
# 遒ｺ隱埼・岼:
# - x-vercel-id: [id] (繝・・繝ｭ繧､ID)
# - x-vercel-cache: HIT / MISS (繧ｭ繝｣繝・す繝･迥ｶ諷・
# - cache-control: (繧ｭ繝｣繝・す繝･蛻ｶ蠕｡)
```

---

## 肌 蝠城｡後′逋ｺ逕溘＠縺溷ｴ蜷医・繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・
### 蝠城｡・ 縺昴ｌ縺ｧ繧・?careReceiverId=AT 縺御ｻ倥￥

**遒ｺ隱埼・岼:**

```bash
# 1. 繧ｭ繝｣繝・す繝･繧偵け繝ｪ繧｢
#    Vercel Dashboard 竊・Deployments 竊・[譛譁ｰ] 竊・More 竊・"Redeploy (no cache)"

# 2. 繝ｭ繝ｼ繧ｫ繝ｫ繝薙Ν繝峨〒遒ｺ隱・pnpm clean  # 繧ｭ繝｣繝・す繝･蜑企勁
pnpm build
pnpm start

# 3. browser cache 繧偵け繝ｪ繧｢
#    DevTools 竊・Application 竊・Storage 竊・Clear site data

# 4. 蛻･繝悶Λ繧ｦ繧ｶ縺ｾ縺溘・繧ｷ繝ｼ繧ｯ繝ｬ繝・ヨ縺ｧ遒ｺ隱・```

### 蝠城｡・ 繝ｭ繧ｰ繧､繝ｳ逕ｻ髱｢縺ｧ繧ｨ繝ｩ繝ｼ

**遒ｺ隱埼・岼:**

```bash
# 1. Supabase 隱崎ｨｼ諠・ｱ繧堤｢ｺ隱・#    .env.local 縺梧ｭ｣縺励＞縺・#    Vercel Environment Variables 縺瑚ｨｭ螳壹＆繧後※縺・ｋ縺・
cat .env.local | grep SUPABASE

# 2. Supabase seed 繝・・繧ｿ繧堤｢ｺ隱・#    Supabase Dashboard 竊・SQL Editor
SELECT COUNT(*) FROM auth.users;  -- 0 縺ｪ繧・seed 螳溯｡後′蠢・ｦ・
# 3. 繝ｭ繧ｰ繧堤｢ｺ隱・#    Vercel Dashboard 竊・Deployments 竊・[譛譁ｰ] 竊・Logs
#    "error" 縺ｧ讀懃ｴ｢
```

### 蝠城｡・ 蛻ｩ逕ｨ閠・∈謚槭ラ繝ｭ繝・・繝繧ｦ繝ｳ縺悟虚菴懊＠縺ｪ縺・
**遒ｺ隱埼・岼:**

```bash
# 1. lifeCareReceivers 縺悟ｮ夂ｾｩ縺輔ｌ縺ｦ縺・ｋ縺狗｢ｺ隱・grep -n "lifeCareReceivers" app/home-client.tsx

# 2. CareReceiverSelect 繧ｳ繝ｳ繝昴・繝阪Φ繝医ｒ遒ｺ隱・grep -rn "CareReceiverSelect" app/

# 3. DevTools Console 縺ｧ繧ｨ繝ｩ繝ｼ繧堤｢ｺ隱・#    F12 竊・Console 繧ｿ繝悶〒 JavaScript 繧ｨ繝ｩ繝ｼ繧定ｦ九ｋ
```

---

## 柏 繝ｭ繧ｰ繧､繝ｳ 繧ｨ繝ｩ繝ｼ險ｺ譁ｭ

### A. Supabase 謗･邯夂｢ｺ隱・
- [ ] NEXT_PUBLIC_SUPABASE_URL 縺梧怏蜉ｹ縺ｪSupabase URL縺・  ```bash
  echo $NEXT_PUBLIC_SUPABASE_URL
  # 譛溷ｾ・ https://xxxxx.supabase.co (xxxx 縺ｯ16譁・ｭ励・闍ｱ謨ｰ蟄・
  ```

- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 縺梧怏蜉ｹ縺・  ```bash
  # Supabase Dashboard 竊・Settings 竊・API 竊・anon public key
  # Vercel Environment Variables 縺ｨ荳閾ｴ縺吶ｋ縺・  ```

### B. Seed 繝・・繧ｿ遒ｺ隱・
- [ ] auth.users 縺ｫ繝・せ繝医Θ繝ｼ繧ｶ繝ｼ縺後＞繧九°
  ```sql
  -- Supabase Dashboard 竊・SQL Editor
  SELECT COUNT(*) FROM auth.users;
  -- 邨先棡縺・0 縺ｪ繧・ supabase/seed.sql 繧貞ｮ溯｡・  ```

- [ ] staff_profiles 縺ｫ繝ｬ繧ｳ繝ｼ繝峨′縺ゅｋ縺・  ```sql
  SELECT * FROM public.staff_profiles LIMIT 5;
  -- role 縺・'admin' 縺ｾ縺溘・ 'user' 縺ｧ縺ゅｋ縺薙→
  ```

### C. RLS 繝昴Μ繧ｷ繝ｼ遒ｺ隱・
- [ ] RLS 縺・enabled 縺・  ```sql
  SELECT tablename FROM pg_tables 
  WHERE schemaname = 'public' AND tablename IN ('auth.users', 'staff_profiles');
  ```

- [ ] RLS 繝昴Μ繧ｷ繝ｼ縺後お繝ｩ繝ｼ繧定ｿ斐＠縺ｦ縺・↑縺・°
  ```sql
  -- Supabase Dashboard 竊・SQL Editor
  -- 繝・せ繝医Θ繝ｼ繧ｶ繝ｼ縺ｧ讀懃ｴ｢蜿ｯ閭ｽ縺・  SET ROLE authenticated;
  SET auth.uid = '[test-user-id-uuid]';
  SELECT * FROM public.staff_profiles LIMIT 1;
  ```

### D. 繝ｭ繧ｰ繧､繝ｳ繝輔Ο繝ｼ遒ｺ隱・
- [ ] app/login/page.tsx 縺ｧ signInWithPassword 縺悟他縺ｰ繧後※縺・ｋ縺・- [ ] 豁｣縺励＞ email/password 縺ｧ繝ｭ繧ｰ繧､繝ｳ繝・せ繝・  ```
  Email: [seed.sql 縺ｫ險倩ｼ峨・繝｡繝ｼ繝ｫ]
  Password: [seed.sql 縺ｫ險倩ｼ峨・繝代せ繝ｯ繝ｼ繝云
  ```

- [ ] 繧ｨ繝ｩ繝ｼ縺悟・繧句ｴ蜷医．evTools Console 縺ｧ隧ｳ邏ｰ繧堤｢ｺ隱・  ```
  F12 竊・Console 竊・Error 繝｡繝・そ繝ｼ繧ｸ繧偵さ繝斐・
  Vercel Logs 縺ｨ蟇ｾ辣ｧ
  ```

### E. 迺ｰ蠅・､画焚縺ｮ final 遒ｺ隱・
- [ ] Vercel Dashboard 縺ｧ莉･荳九′險ｭ螳壹＆繧後※縺・ｋ縺・
  - NEXT_PUBLIC_SUPABASE_URL 笨・  - NEXT_PUBLIC_SUPABASE_ANON_KEY 笨・  - SUPABASE_SERVICE_ROLE_KEY 笨・(Secret 縺ｨ縺励※)

- [ ] .env.local・磯幕逋ｺ迺ｰ蠅・ｼ峨→荳閾ｴ縺励※縺・ｋ縺・
### F. 繧ｭ繝｣繝・す繝･繧ｯ繝ｪ繧｢

- [ ] Vercel: Redeploy without cache
- [ ] 繝悶Λ繧ｦ繧ｶ: Ctrl+Shift+Delete 縺ｧ蜈ｨ繧ｭ繝｣繝・す繝･蜑企勁
- [ ] Supabase: SQL Editor 縺ｧ VACUUM 繧貞ｮ溯｡鯉ｼ医が繝励す繝ｧ繝ｳ・・
### G. 繝ｭ繧ｰ遒ｺ隱・
- [ ] Vercel 繝繝・す繝･繝懊・繝・竊・Deployments 竊・[譛譁ｰ] 竊・Logs
  - "error", "Auth", "signup" 縺ｧ讀懃ｴ｢
  
- [ ] Supabase Dashboard 竊・Logs
  - API calls, Auth, Database errors 繧堤｢ｺ隱・
### H. 譛蠕後・謇区ｮｵ

- [ ] seed.sql 繧貞・螳溯｡・- [ ] Supabase 繝励Ο繧ｸ繧ｧ繧ｯ繝医ｒ繝ｪ繧ｻ繝・ヨ・磯幕逋ｺ迺ｰ蠅・・縺ｿ・・- [ ] Vercel 繧呈眠隕上ョ繝励Ο繧､

---

## 笨・譛邨ら｢ｺ隱阪メ繧ｧ繝・け繝ｪ繧ｹ繝・
### Before Deploy
- [ ] app/page.tsx 縺・async 縺ｧ縺ｪ縺・(changed to sync)
- [ ] app/home-client.tsx 縺ｮ L104 _router.replace 縺悟炎髯､縺輔ｌ縺ｦ縺・ｋ
- [ ] pnpm typecheck: 笨・No errors
- [ ] pnpm lint: 笨・No errors
- [ ] pnpm build: 笨・Build success
- [ ] 繝ｭ繝ｼ繧ｫ繝ｫ pnpm dev 縺ｧ / 縺・?careReceiverId=AT 莉倥°縺ｪ縺・
### Deploy
- [ ] git push origin [branch]
- [ ] Vercel 繝繝・す繝･繝懊・繝・ Deployments 縺ｫ譁ｰ縺励＞繝・・繝ｭ繧､
- [ ] Build & Deployment: Ready

### After Deploy
- [ ] https://juushin-care-system-v0-careapp8.vercel.app/ 繧帝幕縺・- [ ] 縲宣㍾隕√・/ 縺ｫ ?careReceiverId=AT 縺御ｻ倥＞縺ｦ縺・↑縺・- [ ] 繝繝・す繝･繝懊・繝芽｡ｨ遉ｺ・亥茜逕ｨ閠・∈謚槭ラ繝ｭ繝・・繝繧ｦ繝ｳ縺瑚ｦ九∴繧具ｼ・- [ ] 蛻ｩ逕ｨ閠・∈謚槭ラ繝ｭ繝・・繝繧ｦ繝ｳ縺ｧ A・杞 繧帝∈謚槭〒縺阪ｋ
- [ ] DevTools Network 縺ｧ:
  - Status 200
  - x-vercel-id: [id]
  - Query String: 遨ｺ
- [ ] 繝ｭ繧ｰ繧､繝ｳ讖溯・繝・せ繝茨ｼ亥ｿ・ｦ√↓蠢懊§縺ｦ・・
### If Any Issue
1. Vercel Redeploy without cache
2. Browser cache clear (Ctrl+Shift+Delete)
3. 繝悶Λ繧ｦ繧ｶ蜀崎ｵｷ蜍・4. 荳願ｨ倥・"繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ繧貞盾辣ｧ

---

## 識 譛遏ｭ繝・・繝ｭ繧､繧ｳ繝槭Φ繝会ｼ医∪縺ｨ繧・ｼ・
```bash
# 繝ｭ繝ｼ繧ｫ繝ｫ譛邨ら｢ｺ隱・pnpm typecheck && pnpm lint && pnpm build

# Git謫堺ｽ・git add app/page.tsx app/home-client.tsx
git commit -m "fix: remove auto-redirect to careReceiverId on root page"

# Vercel 縺ｸ閾ｪ蜍輔ョ繝励Ο繧､
git push origin main

# 譛ｬ逡ｪ迺ｰ蠅・〒遒ｺ隱・# https://juushin-care-system-v0-careapp8.vercel.app/ 繧帝幕縺・# 笨・/ 縺ｫ ?careReceiverId=AT 縺御ｻ倥°縺ｪ縺・％縺ｨ繧堤｢ｺ隱・```

