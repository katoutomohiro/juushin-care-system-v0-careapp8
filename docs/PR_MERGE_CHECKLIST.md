# PR 繝槭・繧ｸ蛻､螳壹メ繧ｧ繝・け繝ｪ繧ｹ繝・

> **繝槭・繧ｸ縺ｮ譚｡莉ｶ**: GitHub 縺ｮ Checks 縺後☆縺ｹ縺ｦ green 縺ｫ縺ｪ繧九％縺ｨ

## 1・鞘Ε 繝ｭ繝ｼ繧ｫ繝ｫ遒ｺ隱搾ｼ亥ｿ・茨ｼ・

PR 繧偵・繝ｼ繧ｸ縺吶ｋ蜑阪↓縲√Ο繝ｼ繧ｫ繝ｫ縺ｧ蠢・★莉･荳九ｒ螳溯｡後＠縺ｦ縺上□縺輔＞縲・

```powershell
# 繧ｹ繝・ャ繝・1: 譛譁ｰ commit 繧偵Ο繝ｼ繧ｫ繝ｫ縺ｧ遒ｺ隱・
git log --oneline -1

# 繧ｹ繝・ャ繝・2: 蝙九メ繧ｧ繝・け
pnpm typecheck
# 譛溷ｾ・ exit code 0・医お繝ｩ繝ｼ縺ｪ縺暦ｼ・

# 繧ｹ繝・ャ繝・3: Lint
pnpm lint
# 譛溷ｾ・ exit code 0・医お繝ｩ繝ｼ縺ｪ縺暦ｼ・

# 繧ｹ繝・ャ繝・4: Build
pnpm build
# 譛溷ｾ・ exit code 0縲√☆縺ｹ縺ｦ縺ｮ繝壹・繧ｸ逕滓・謌仙粥
```

**縺ｩ繧後° 1 縺､縺ｧ繧ょ､ｱ謨励＠縺溷ｴ蜷・*:
- 笶・繝槭・繧ｸ縺励↑縺・
- PR 縺ｫ蝠城｡後・縺ゅｋ繧ｳ繝溘ャ繝医ｒ謖・遭縺励※繝ｪ繧ｯ繧ｨ繧ｹ繝井ｿｮ豁｣

## 2・鞘Ε GitHub Checks 遒ｺ隱搾ｼ亥ｿ・茨ｼ・

PR 繝壹・繧ｸ縺ｮ **Checks** 繧ｿ繝悶ｒ遒ｺ隱搾ｼ・

```
笨・Vercel        竊・SUCCESS
笨・SonarCloud    竊・SUCCESS・・uality Gate PASS・・
笨・CodeQL        竊・SUCCESS
笨・Lint & Type   竊・SUCCESS
笨・Build Test    竊・SUCCESS
```

**關ｽ縺｡繧・☆縺・ｂ縺ｮ**:
1. **Vercel**: 繝・・繝ｭ繧､縺悟､ｱ謨励☆繧句ｴ蜷医・縲∵悽逡ｪ迺ｰ蠅・・ env vars 繧堤｢ｺ隱・
2. **SonarCloud**: New Code 縺ｮ雉ｪ縺悟渕貅悶ｒ荳句屓繧句ｴ蜷医・縲∬ｩｲ蠖薙ヵ繧｡繧､繝ｫ縺ｮ issues 繧剃ｿｮ豁｣

## 3・鞘Ε 繝槭・繧ｸ螳溯｡・

縺吶∋縺ｦ縺ｮ Checks 縺・green 縺ｪ繧峨∽ｻ･荳九ｒ螳溯｡鯉ｼ・

```powershell
# 繝ｭ繝ｼ繧ｫ繝ｫ縺ｧ遒ｺ隱肴ｸ医∩縺ｪ繧・GitHub UI 縺ｧ繝槭・繧ｸ
# 縺ｾ縺溘・ CLI 縺ｧ:
gh pr merge <PR逡ｪ蜿ｷ> --squash

# 縺ｾ縺溘・
git merge <branch> && git push origin main
```

## 4・鞘Ε Post-merge 遒ｺ隱搾ｼ域耳螂ｨ・・

繝槭・繧ｸ蠕後∽ｻ･荳九ｒ遒ｺ隱搾ｼ・

```powershell
# 繝ｭ繝ｼ繧ｫ繝ｫ main 繝悶Λ繝ｳ繝√ｒ譖ｴ譁ｰ
git checkout main
git pull origin main

# 譛ｬ逡ｪ迺ｰ蠅・ｼ・ercel・峨・繝・・繝ｭ繧､螳御ｺ・ｒ遒ｺ隱・
# https://vercel.com 竊・Deployments 竊・Status 縺・SUCCESS
```

---

## 繧医￥縺ゅｋ螟ｱ謨励ヱ繧ｿ繝ｼ繝ｳ縺ｨ蟇ｾ蠢・

| 螟ｱ謨・| 蜴溷屏 | 蟇ｾ蠢・|
| --- | --- | --- |
| Lint 繧ｨ繝ｩ繝ｼ | ESLint 縺悟ｼ輔▲縺九°縺｣縺・| `pnpm lint` 縺ｮ output 繧堤｢ｺ隱阪＠縺ｦ菫ｮ豁｣ |
| Build 繧ｨ繝ｩ繝ｼ | Next.js 縺後さ繝ｳ繝代う繝ｫ螟ｱ謨・| `pnpm build` 縺ｮ log 繧定ｪｭ繧薙〒蝙九ｄ繝代せ菫ｮ豁｣ |
| SonarCloud 關ｽ縺｡繧・| Quality Gate 蝓ｺ貅紋ｸ埼＃謌・| SonarCloud 縺ｮ Issues tab 縺ｧ New Code 繧堤｢ｺ隱阪∽ｿｮ豁｣ |
| Vercel 螟ｱ謨・| 譛ｬ逡ｪ迺ｰ蠅・・ env vars 荳崎ｶｳ | Vercel Project Settings 竊・Environment Variables 繧堤｢ｺ隱・|

---

**譛邨よ峩譁ｰ**: 2026-01-29

