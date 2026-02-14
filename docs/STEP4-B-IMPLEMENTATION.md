# STEP4-B 螳溯｣・ｮ御ｺ・ラ繧ｭ繝･繝｡繝ｳ繝・
螳御ｺ・律: 2026蟷ｴ1譛・5譌･

## 螳溯｣・・螳ｹ・亥・5繧ｹ繝・ャ繝暦ｼ・
### 笨・STEP4-B-1・咼B繧ｹ繧ｭ繝ｼ繝樊紛蜷茨ｼ・ervice_id 500繧ｨ繝ｩ繝ｼ隗｣豎ｺ・・**繝輔ぃ繧､繝ｫ**: `app/api/care-receivers/list/route.ts`

**螟画峩蜀・ｮｹ**:
- service_id (uuid FK) 縺ｧ縺ｯ縺ｪ縺・service_code (text) 縺ｧ filter
- 荳崎ｦ√↑ services 繝・・繝悶Ν join 繧貞炎髯､
- display_name, age, gender, care_level, condition, medical_care 繧・response 縺ｫ蜷ｫ繧√ｋ
- 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ: ok: false 繧・200 縺ｧ霑斐☆

**蜍穂ｽ・*: `GET /api/care-receivers/list?serviceCode=life-care` 縺ｧ 200 OK縲「sers 驟榊・繧定ｿ斐☆

---

### 笨・STEP4-B-2・壼茜逕ｨ閠・ｮ｡逅・判髱｢・・繧ｫ繝・ざ繝ｪ陦ｨ遉ｺ・・**繝輔ぃ繧､繝ｫ**: `app/services/[serviceId]/users/page.tsx`

**螟画峩蜀・ｮｹ**:
- 蜊倅ｸ繧ｵ繝ｼ繝薙せ繝・・繝悶Ν UI 竊・2繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ・育函豢ｻ莉玖ｭｷ/謾ｾ繝・う・峨き繝ｼ繝牙梛 UI 縺ｫ螟画峩
- 荳｡繧ｵ繝ｼ繝薙せ繧剃ｸｦ蛻・fetch・・romise.all・・- 蜷・そ繧ｯ繧ｷ繝ｧ繝ｳ: loading/error/empty/users 繧ｰ繝ｪ繝・ラ陦ｨ遉ｺ
- 繧ｫ繝ｼ繝・click 縺ｧ隧ｳ邏ｰ繝壹・繧ｸ縺ｸ驕ｷ遘ｻ・・/services/[serviceCode]/users/[id]`・・
**陦ｨ遉ｺ繝輔ぅ繝ｼ繝ｫ繝・*: code, name, age, gender, care_level, condition

---

### 笨・STEP4-B-3・咾RUD API螳溯｣・**繝輔ぃ繧､繝ｫ**: 
- `app/api/care-receivers/[id]/route.ts` (GET/PUT/DELETE)
- `app/api/care-receivers/list/route.ts` (POST霑ｽ蜉)

**API 繧ｨ繝ｳ繝峨・繧､繝ｳ繝・*:
- `GET /api/care-receivers/[id]` - 蜊倅ｸ蜿門ｾ・- `PUT /api/care-receivers/[id]` - 譖ｴ譁ｰ・・isplay_name 繧・name 縺ｫ繝槭ャ繝暦ｼ・- `DELETE /api/care-receivers/[id]` - 蜑企勁
- `POST /api/care-receivers/list` - 菴懈・・・ode 驥崎､・メ繧ｧ繝・け莉倥″・・
**蜈ｨAPI縺ｮ霑泌唆蠖｢蠑・*: `{ ok: true/false, user?: {...}, error?: "..." }`

---

### 笨・STEP4-B-4・壹ョ繝ｼ繧ｿ蜿肴丐菫晁ｨｼ・・erver actions + revalidatePath・・**繝輔ぃ繧､繝ｫ**:
- `lib/actions/care-receivers.ts` (server actions)
- `components/edit-care-receiver-modal.tsx` (邱ｨ髮・I)

**server actions**:
- `revalidateCareReceiversData()` - 蜈ｨ髢｢騾｣繝壹・繧ｸ繧貞・讀懆ｨｼ
- `createCareReceiverAction()` - POST + revalidate
- `updateCareReceiverAction()` - PUT + revalidate
- `deleteCareReceiverAction()` - DELETE + revalidate

**蜀肴､懆ｨｼ遽・峇**: `/services/[serviceId]/users`, `/dashboard`, tag: `care-receivers-*`

**邱ｨ髮・UI**:
- 繝｢繝ｼ繝繝ｫ蝙九ヵ繧ｩ繝ｼ繝・亥・繝輔ぅ繝ｼ繝ｫ繝会ｼ・- 菫晏ｭ・竊・server action + router.refresh()
- 蜑企勁 竊・遒ｺ隱・竊・server action + 荳隕ｧ縺ｸ謌ｻ縺・- 繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ・・oast/alert・・
---

### 笨・STEP4-B-5・夐幕逋ｺ謇矩・ｨ呎ｺ門喧・域里螳溯｣・ｼ・**蟇ｾ蠢・*:
- README 縺ｫ "謗ｨ螂ｨ繧ｹ繧ｿ繝ｼ繝医い繝・・" 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ霑ｽ蜉
- `pnpm run reboot` 繧ｳ繝槭Φ繝臥｢ｺ遶具ｼ・ort free 竊・cache 蜑企勁 竊・襍ｷ蜍包ｼ・- `pnpm run check-server` 縺ｧ襍ｷ蜍慕｢ｺ隱・- 繝医Λ繝悶Ν蟇ｾ蠢懊そ繧ｯ繧ｷ繝ｧ繝ｳ謨ｴ蛯・- PowerShell 繝励Ο繝輔ぃ繧､繝ｫ險ｭ螳壹ぎ繧､繝画署萓・
---

## 繝・せ繝域焔鬆・
```powershell
# 1. 繧ｭ繝｣繝・す繝･蜑企勁繝ｻ襍ｷ蜍・pnpm run reboot

# 2. 繧ｵ繝ｼ繝舌・遒ｺ隱・pnpm run check-server

# 3. 繝悶Λ繧ｦ繧ｶ縺ｧ遒ｺ隱・# - http://dev-app.local:3000
# - 繧ｵ繝ｼ繝薙せ縺ｸ遘ｻ蜍・竊・"蛻ｩ逕ｨ閠・ｮ｡逅・ 繝懊ち繝ｳ
# - 2繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ・育函豢ｻ莉玖ｭｷ/謾ｾ繝・う・峨′陦ｨ遉ｺ縺輔ｌ縺ｦ縺・ｋ
# - 蛻ｩ逕ｨ閠・き繝ｼ繝・click 竊・隧ｳ邏ｰ繝壹・繧ｸ
# - "邱ｨ髮・ 繝懊ち繝ｳ 竊・繝｢繝ｼ繝繝ｫ縺ｧ豌丞錐繝ｻ蟷ｴ鮨｢縺ｪ縺ｩ譖ｴ譁ｰ蜿ｯ閭ｽ

# 4. TypeScript/Lint 繝√ぉ繝・け
pnpm typecheck
pnpm lint
```

---

## 霑ｽ蜉螳溯｣・′蠢・ｦ√↑蝣ｴ蜷・
### 縲梧眠隕丞茜逕ｨ閠・ｿｽ蜉縲咲判髱｢
`app/services/[serviceId]/users/page.tsx` 縺ｫ "譁ｰ隕剰ｿｽ蜉" 繝懊ち繝ｳ繧定ｿｽ蜉縺励・POST /api/care-receivers/list 繧貞他縺ｳ蜃ｺ縺吶ヵ繧ｩ繝ｼ繝繧貞ｮ溯｣・＠縺ｦ縺上□縺輔＞縲・server action: `createCareReceiverAction()` 繧剃ｽｿ逕ｨ縺励※縺上□縺輔＞縲・
### 繧ｱ繝ｼ繧ｹ險倬鹸縺ｨ縺ｮ騾｣謳ｺ
蛻ｩ逕ｨ閠・炎髯､譎ゅ↓繧ｱ繝ｼ繧ｹ險倬鹸繧ょ炎髯､縺吶ｋ縺九｛rphaned record 繧貞・逅・☆繧倶ｻ墓ｧ倥ｒ豎ｺ螳壹＠縺ｦ縺上□縺輔＞縲・迴ｾ蝨ｨ縺ｯ cascade delete 縺ｪ縺励・
### RLS・・ow Level Security・・髢狗匱迺ｰ蠅・〒縺ｯ RLS 繝昴Μ繧ｷ繝ｼ縺碁幕謾ｾ逧・〒縺吶よ悽逡ｪ繝・・繝ｭ繧､蜑阪↓ Supabase RLS 繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞縲・
---

## 髢｢騾｣ commit log

```
7ffa2d7 feat(STEP4-B-4): server actions + automatic data revalidation
359ba60 feat(STEP4-B-3): complete CRUD API (GET/PUT/DELETE/POST)
6c4266d feat(STEP4-B-2): dual-category user management page
afd5275 fix(STEP4-B-1): resolve service_id 500 error
```

---

## 雉ｪ蝠上・遒ｺ隱堺ｺ矩・
- [ ] 蛻ｩ逕ｨ閠・・縲梧眠隕剰ｿｽ蜉縲阪ヵ繧ｩ繝ｼ繝 UI 縺ｯ蛻･繧ｿ繧ｹ繧ｯ縺・
- [ ] 繧ｱ繝ｼ繧ｹ險倬鹸縺ｨ縺ｮ蛻ｩ逕ｨ閠・FK 蛻ｶ邏・・險ｭ螳壽ｸ医∩縺具ｼ・- [ ] Supabase RLS 繝昴Μ繧ｷ繝ｼ縺ｮ譛ｬ逡ｪ蛹悶せ繧ｱ繧ｸ繝･繝ｼ繝ｫ縺ｯ・・

