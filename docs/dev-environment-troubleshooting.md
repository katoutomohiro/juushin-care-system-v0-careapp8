# 髢狗匱迺ｰ蠅・ヨ繝ｩ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

## 髢狗匱繧ｵ繝ｼ繝舌・襍ｷ蜍墓焔鬆・
### 騾壼ｸｸ襍ｷ蜍・```powershell
pnpm dev
```

### 繧ｯ繝ｪ繝ｼ繝ｳ襍ｷ蜍包ｼ域耳螂ｨ・咾hunkLoadError/Invalid token 縺碁ｻ逋ｺ縺吶ｋ蝣ｴ蜷茨ｼ・```powershell
pnpm dev:clean
```

### 繝昴・繝・000縺御ｽｿ逕ｨ荳ｭ縺ｮ蝣ｴ蜷・```powershell
# 繝昴・繝・000繧貞ｼｷ蛻ｶ邨ゆｺ・＠縺ｦ縺九ｉ襍ｷ蜍・npx kill-port 3000
pnpm dev
```

縺ｾ縺溘・縲∝挨縺ｮ繝昴・繝医〒襍ｷ蜍包ｼ・```powershell
pnpm dev -- -p 3001
```

## 繧医￥縺ゅｋ繧ｨ繝ｩ繝ｼ縺ｨ蟇ｾ蜃ｦ豕・
### 1. ChunkLoadError
**逞・憾**: 繝悶Λ繧ｦ繧ｶ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ縺ｫ `ChunkLoadError: Loading chunk xxx failed` 縺瑚｡ｨ遉ｺ縺輔ｌ繧・
**蟇ｾ蜃ｦ豕・*:
1. **Ctrl+F5** 縺ｧ繝悶Λ繧ｦ繧ｶ縺ｮ繝上・繝峨Μ繝輔Ξ繝・す繝･
2. 縺昴ｌ縺ｧ繧りｧ｣豎ｺ縺励↑縺・ｴ蜷医・ `.next` 繧貞炎髯､縺励※蜀崎ｵｷ蜍包ｼ・   ```powershell
   pnpm dev:clean
   ```

### 2. Invalid token / Unexpected token 繧ｨ繝ｩ繝ｼ
**逞・憾**: 繧ｿ繝ｼ繝溘リ繝ｫ縺ｫ `SyntaxError: Invalid or unexpected token` 縺瑚｡ｨ遉ｺ縺輔ｌ繧・
**蟇ｾ蜃ｦ豕・*:
1. 繧ｿ繝ｼ繝溘リ繝ｫ縺ｮ繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺ｧ隧ｲ蠖薙ヵ繧｡繧､繝ｫ・井ｾ・ `layout.tsx`・峨ｒ遒ｺ隱・2. 隧ｲ蠖薙ヵ繧｡繧､繝ｫ縺ｮ讒区枚繧ｨ繝ｩ繝ｼ繧剃ｿｮ豁｣
3. 菫晏ｭ倥☆繧九→閾ｪ蜍慕噪縺ｫ蜀阪さ繝ｳ繝代う繝ｫ縺輔ｌ繧・
### 3. Port already in use (EADDRINUSE)
**逞・憾**: `Error: listen EADDRINUSE: address already in use :::3000`

**蟇ｾ蜃ｦ豕・*:
```powershell
# 譁ｹ豕・: 繝昴・繝医ｒ蠑ｷ蛻ｶ邨ゆｺ・npx kill-port 3000

# 譁ｹ豕・: 繝励Ο繧ｻ繧ｹID繧堤｢ｺ隱阪＠縺ｦ邨ゆｺ・netstat -ano | findstr :3000
taskkill /F /PID <繝励Ο繧ｻ繧ｹID>

# 譁ｹ豕・: 蛻･縺ｮ繝昴・繝医〒襍ｷ蜍・pnpm dev -- -p 3001
```

### 4. webpack cache 繧ｨ繝ｩ繝ｼ
**逞・憾**: `incorrect header check` 縺ｪ縺ｩ縺ｮ繧ｭ繝｣繝・す繝･髢｢騾｣繧ｨ繝ｩ繝ｼ

**蟇ｾ蜃ｦ豕・*:
```powershell
# .next 繝・ぅ繝ｬ繧ｯ繝医Μ繧貞炎髯､縺励※繧ｯ繝ｪ繝ｼ繝ｳ襍ｷ蜍・pnpm dev:clean
```

## 髢狗匱繧ｵ繝ｼ繝舌・驕狗畑縺ｮ繝吶せ繝医・繝ｩ繧ｯ繝・ぅ繧ｹ

### 謗ｨ螂ｨ襍ｷ蜍墓焔鬆・```powershell
# 1. 譌｢蟄倥・繝昴・繝・000繝励Ο繧ｻ繧ｹ繧堤ｵゆｺ・npx kill-port 3000

# 2. 繧ｯ繝ｪ繝ｼ繝ｳ襍ｷ蜍・pnpm dev:clean
```

### 繧ｳ繝ｼ繝牙､画峩譎ゅ・豕ｨ諢冗せ
- **螟ｧ隕乗ｨ｡縺ｪ螟画峩蠕・*: `.next` 繧貞炎髯､縺励※縺九ｉ襍ｷ蜍包ｼ・pnpm dev:clean`・・- **萓晏ｭ倬未菫ゅ・螟画峩**: `pnpm install` 蠕後↓蠢・★ `.next` 繧貞炎髯､
- **繧ｨ繝ｩ繝ｼ縺悟・縺溷ｴ蜷・*: 縺ｾ縺・Ctrl+F5 縺ｧ繝悶Λ繧ｦ繧ｶ繝ｪ繝輔Ξ繝・す繝･縲∵ｬ｡縺ｫ `pnpm dev:clean`

### TypeScript/ESLint 繧ｨ繝ｩ繝ｼ縺ｮ遒ｺ隱・```powershell
# 蝙九メ繧ｧ繝・け
pnpm typecheck

# Lint 繝√ぉ繝・け
pnpm lint --max-warnings=0

# 繝薙Ν繝臥｢ｺ隱・pnpm build
```

## 邱頑･譎ゅ・螳悟・繝ｪ繧ｻ繝・ヨ謇矩・
縺吶∋縺ｦ縺後≧縺ｾ縺上＞縺九↑縺・ｴ蜷茨ｼ・
```powershell
# 1. 髢狗匱繧ｵ繝ｼ繝舌・繧貞●豁｢・・trl+C・・
# 2. 繝薙Ν繝峨く繝｣繝・す繝･縺ｨnode_modules繧貞炎髯､
Remove-Item -Recurse -Force .next, node_modules

# 3. 萓晏ｭ倬未菫ゅｒ蜀阪う繝ｳ繧ｹ繝医・繝ｫ
pnpm install

# 4. 繧ｯ繝ｪ繝ｼ繝ｳ襍ｷ蜍・pnpm dev:clean
```

## 蜿り・ュ蝣ｱ

- **Next.js 繧ｭ繝｣繝・す繝･**: `.next/cache` 縺ｫwebpack繧ｭ繝｣繝・す繝･縺御ｿ晏ｭ倥＆繧後ｋ
- **繝昴・繝亥､画峩**: 迺ｰ蠅・､画焚 `PORT=3001 pnpm dev` 縺ｧ繧ゅ・繝ｼ繝域欠螳壼庄閭ｽ
- **繝ｭ繧ｰ遒ｺ隱・*: 繧ｿ繝ｼ繝溘リ繝ｫ蜃ｺ蜉帙↓ `[webpack.cache]` 繧・`Compiling` 縺ｪ縺ｩ縺ｮ繝｡繝・そ繝ｼ繧ｸ繧堤｢ｺ隱・
