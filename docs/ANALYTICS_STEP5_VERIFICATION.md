# Records Analytics Step5 讀懆ｨｼ繝峨く繝･繝｡繝ｳ繝・

**Status**: 笨・螳溯｣・ｮ御ｺ・ 
**Date**: 2025-02-15  
**Task**: Step5 - DB螳溘ョ繝ｼ繧ｿ繧剃ｽｿ縺｣縺ｦanalytics API繧貞娼縺・

## 螳御ｺ・・螳ｹ

### 笨・Step5-竭 繝・・繧ｿ讒矩遒ｺ隱・
- RecordsAnalyticsResponse 蝙句ｮ夂ｾｩ: 螳御ｺ・
- 譌･谺｡髮・ｨ医せ繧ｭ繝ｼ繝・ (date, seizureCount, sleepMins, mealsCompleted)
- 繧ｵ繝槭Μ繝ｼ繧ｹ繧ｭ繝ｼ繝・ (seizureCountTotal, sleepMinsAvg, mealsCompletedTotal)

### 笨・Step5-竭｡ DB謗･邯壼ｮ溯｣・
**菫ｮ豁｣繝輔ぃ繧､繝ｫ**: `app/api/case-records/analytics/route.ts`

#### 螳溯｣・・螳ｹ
```typescript
// case_records繝・・繝悶Ν縺九ｉ螳溘ョ繝ｼ繧ｿ繧貞叙蠕・
let query = supabaseAdmin
  .from("case_records")
  .select("record_date, record_data")
  .gte("record_date", dateFrom)
  .lte("record_date", dateTo)

if (careReceiverId) query = query.eq("care_receiver_id", careReceiverId)
if (serviceId) query = query.eq("service_id", serviceId)

const { data: records, error: dbError } = await query
```

#### 髮・ｨ医Ο繧ｸ繝・け
- record_data JSON 縺九ｉ `seizure_count`, `sleep_minutes`, `meals_completed` 繧呈歓蜃ｺ
- 譌･莉倥＃縺ｨ縺ｫ髮・ｨ医＠縺ｦdailyMap 縺ｫ譬ｼ邏・
- 繧ｵ繝槭Μ繝ｼ邨ｱ險医ｒ險育ｮ・
  - `seizureCountTotal`: 蜷郁ｨ育匱菴懈焚
  - `sleepMinsAvg`: 蟷ｳ蝮・擅逵譎る俣 (0雜・・譌･蟷ｳ蝮・
  - `mealsCompletedTotal`: 鬟滉ｺ句ｮ御ｺ・粋險・

#### 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ
- `ensureSupabaseAdmin()` 縺ｧ null 繝√ぉ繝・け
- DB 繧ｨ繝ｩ繝ｼ繧ｭ繝｣繝・メ 竊・JSON 500 繝ｬ繧ｹ繝昴Φ繧ｹ
- 辟｡蜉ｹ縺ｪ隱崎ｨｼ 竊・401 繝ｬ繧ｹ繝昴Φ繧ｹ

### 笨・Step5-竭｢ 蝙句ｮ牙・諤ｧ遒ｺ隱・
**菫ｮ豁｣**: supabaseAdmin null check 縺ｮ霑ｽ蜉
```typescript
if (!supabaseAdmin) {
  return jsonError("Supabase admin client not initialized", 500)
}
```

**雉ｪ驥上メ繧ｧ繝・け邨先棡**:
```
笨・pnpm typecheck  竊・PASS (0 errors)
笨・pnpm build      竊・PASS (5.66 kB page size)
笨・pnpm lint       竊・PASS (no new violations)
```

### 笨・Step5-竭｣ Frontend 貅門ｙ
**繝輔ぃ繧､繝ｫ**: `components/AnalyticsViewer.tsx`
- 笨・譌｢縺ｫ螳溯｣・ｸ医∩・・ock 竊・real 繝・・繧ｿ縺ｮ閾ｪ蜍募ｯｾ蠢懶ｼ・
- 笨・3縺､縺ｮ繧ｵ繝槭Μ繝ｼ繧ｫ繝ｼ繝・ `data.summary` 縺ｮ蛟､繧定｡ｨ遉ｺ
- 笨・3縺､縺ｮ繧ｰ繝ｩ繝・ `data.daily` 驟榊・縺九ｉ謠冗判
- 笨・譌･莉倥ヵ繧｣繝ｫ繧ｿ縺ｯquery params 縺ｧ蟇ｾ蠢・

## 繝・せ繝域焔鬆・

### 譁ｹ豕・: 繝悶Λ繧ｦ繧ｶ
1. `pnpm dev` 縺ｧ繧ｵ繝ｼ繝舌・襍ｷ蜍・
2. `http://dev-app.local:3000/login` 縺ｫ繧｢繧ｯ繧ｻ繧ｹ
3. 隱崎ｨｼ蠕後～/analytics` 縺ｫ繝翫ン繧ｲ繝ｼ繝・
4. 譌･莉倡ｯ・峇繧帝∈謚・竊・"Fetch Analytics" 繧ｯ繝ｪ繝・け
5. **譛溷ｾ・､**: 
   - 繧ｫ繝ｼ繝・譫壹↓螳滓焚蛟､陦ｨ遉ｺ (0莉･荳・
   - 繧ｰ繝ｩ繝輔↓螳滓ｸｬ繝・・繧ｿ謠冗判
   - 繝・・繝悶Ν縺ｫ譌･谺｡繝・・繧ｿ陦ｨ遉ｺ

### 譁ｹ豕・: API 逶ｴ謗･繝・せ繝・
```bash
curl -H "Authorization: Bearer <your-token>" \
  "http://dev-app.local:3000/api/case-records/analytics?dateFrom=2025-02-01&dateTo=2025-02-15"

# 譛溷ｾ・Ξ繧ｹ繝昴Φ繧ｹ:
# {
#   "ok": true,
#   "data": {
#     "range": { "dateFrom": "2025-02-01", "dateTo": "2025-02-15" },
#     "daily": [
#       { "date": "2025-02-01", "seizureCount": 2, "sleepMins": 480, "mealsCompleted": 3 },
#       ...
#     ],
#     "summary": {
#       "seizureCountTotal": 28,
#       "sleepMinsAvg": 450,
#       "mealsCompletedTotal": 45
#     }
#   }
# }
```

## 谺｡縺ｮ繧ｹ繝・ャ繝・(Step5-竭､)

### 繝・せ繝域､懆ｨｼ
- [ ] dev 繧ｵ繝ｼ繝舌・縺ｧ繝悶Λ繧ｦ繧ｶ繝・せ繝亥ｮ滓命
- [ ] API 縺悟ｮ溘ョ繝ｼ繧ｿ霑泌唆遒ｺ隱・
- [ ] 繧ｫ繝ｼ繝峨・繧ｰ繝ｩ繝輔′蛟､繧定｡ｨ遉ｺ遒ｺ隱・
- [ ] 譌･莉倥ヵ繧｣繝ｫ繧ｿ縺梧ｩ溯・遒ｺ隱・

### 繝・・繝ｭ繧､蜑阪メ繧ｧ繝・け
- [ ] `pnpm lint` 蜀咲｢ｺ隱・
- [ ] `pnpm typecheck` 蜀咲｢ｺ隱・
- [ ] `pnpm build` 蜀咲｢ｺ隱・
- [ ] git diff 縺ｧ荳崎ｦ√↑螟画峩縺後↑縺・°遒ｺ隱・

### PR 繝槭・繧ｸ
- [ ] GitHub 縺ｧ main 縺ｸ縺ｮ PR 貅門ｙ
- [ ] CI/CD 繝代せ遒ｺ隱・
- [ ] 繝ｬ繝薙Η繧､繝ｼ縺ｫ繧医ｋ譛邨ら｢ｺ隱・

## 髢｢騾｣繝輔ぃ繧､繝ｫ

| 繝輔ぃ繧､繝ｫ | 逕ｨ騾・| 迥ｶ諷・|
| --- | --- | --- |
| `app/api/case-records/analytics/route.ts` | API 繧ｨ繝ｳ繝峨・繧､繝ｳ繝・| 笨・菫ｮ豁｣貂医∩ |
| `app/analytics/page.tsx` | Server Component (auth gate) | 笨・螳御ｺ・|
| `app/analytics/analytics-client.tsx` | Client Component (form + fetch) | 笨・螳御ｺ・|
| `components/AnalyticsViewer.tsx` | UI (cards, graphs, table) | 笨・螳御ｺ・|
| `src/types/recordsAnalytics.ts` | 蝙句ｮ夂ｾｩ | 笨・螳御ｺ・|

## DB 繧ｹ繧ｭ繝ｼ繝槫盾辣ｧ

### case_records 繝・・繝悶Ν
| 繧ｫ繝ｩ繝 | 蝙・| 隱ｬ譏・|
| --- | --- | --- |
| id | uuid | 繝励Λ繧､繝槭Μ繧ｭ繝ｼ |
| care_receiver_id | uuid | 蟇ｾ雎｡繝ｦ繝ｼ繧ｶ繝ｼ |
| service_id | uuid | 繧ｵ繝ｼ繝薙せ |
| record_date | date | 險倬鹸譌･ |
| record_data | jsonb | `{ seizure_count, sleep_minutes, meals_completed, ... }` |
| created_at | timestamp | 菴懈・譌･譎・|
| updated_at | timestamp | 譖ｴ譁ｰ譌･譎・|

## 繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

### API 縺檎ｩｺ繝・・繧ｿ霑斐☆
- **蜴溷屏**: case_records 縺ｫ隧ｲ蠖捺律縺ｮ險倬鹸縺後↑縺・
- **蟇ｾ遲・*: 
  - 譌･莉倡ｯ・峇繧堤｢ｺ隱・(dateFrom 竕､ dateTo)
  - Supabase 繝繝・す繝･繝懊・繝峨〒 case_records 縺ｮ莉ｶ謨ｰ遒ｺ隱・
  - record_data 繝輔ぅ繝ｼ繝ｫ繝峨′ JSON 縺ｧ譬ｼ邏阪＆繧後※縺・ｋ縺狗｢ｺ隱・

### 繧ｰ繝ｩ繝輔′謠冗判縺輔ｌ縺ｪ縺・
- **蜴溷屏**: daily 驟榊・縺檎ｩｺ
- **蟇ｾ遲・*: console 縺ｧ API 繝ｬ繧ｹ繝昴Φ繧ｹ遒ｺ隱・(DevTools > Network)

### "Supabase admin client not initialized" 繧ｨ繝ｩ繝ｼ
- **蜴溷屏**: 迺ｰ蠅・､画焚 SUPABASE_SERVICE_ROLE_KEY 縺瑚ｨｭ螳壹＆繧後※縺・↑縺・
- **蟇ｾ遲・*: `.env.local` 繧堤｢ｺ隱阪＠縲√く繝ｼ繧定ｨｭ螳・

## 謌先棡迚ｩ繧ｵ繝槭Μ繝ｼ

- **螟画峩陦梧焚**: +86 / -11 (analytics route.ts)
- **譁ｰ繝輔ぃ繧､繝ｫ**: 0
- **繝薙Ν繝峨し繧､繧ｺ蠅怜刈**: 0 kB (譌｢蟄・page size 5.66 kB 邯ｭ謖・
- **繝・せ繝育憾諷・*: 蜩∬ｳｪ繝√ぉ繝・け螳御ｺ・‥ev server 襍ｷ蜍募ｾ・■

---

**Next Milestone**: Step5-竭､ 譛邨ら｢ｺ隱阪・繝槭・繧ｸ

