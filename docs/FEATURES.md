# 驥榊ｿ・こ繧｢謾ｯ謠ｴ繧｢繝励Μ・懈ｩ溯・荳隕ｧ・域｣壼査縺礼ｵ先棡・・
**譖ｴ譁ｰ譌･**: 2026蟷ｴ1譛・8譌･  
**譽壼査縺玲婿豕・*: App Router 繝ｫ繝ｼ繝亥・邯ｲ鄒・+ 繝ｪ繝ｳ繧ｯ辣ｧ蜷・+ API荳隕ｧ  
**逶ｮ逧・*: 螳溯｣・ｸ域ｩ溯・繝ｻ404蛟呵｣懊・譛ｪ螳溯｣・ｩ溯・繧剃ｸ隕ｧ蛹悶＠縲∵ｬ｡縺ｮ謾ｹ菫ｮ縺ｮ蜆ｪ蜈亥ｺｦ繧呈ｱｺ螳・
---

## 搭 譁ｹ豕戊ｫ・
1. **繝ｫ繝ｼ繝域歓蜃ｺ**: `app/` 驟堺ｸ九・蜈ｨ `page.tsx` + `route.ts` 繧貞・謖・2. **繝ｪ繝ｳ繧ｯ辣ｧ蜷・*: 繧｢繝励Μ蜀・・繝ｪ繝ｳ繧ｯ譁・ｭ怜・・・繧ｱ繝ｼ繧ｹ險倬鹸"縺ｪ縺ｩ・俄・ 蟇ｾ蠢懊Ν繝ｼ繝医・譛臥┌遒ｺ隱・3. **API遒ｺ隱・*: `/api/**` 莉･荳九・ route.ts 繧貞・謖吶＠縲√ヵ繝ｭ繝ｳ繝磯・遘ｻ縺ｨ縺ｮ邏蝉ｻ倥￠
4. **迥ｶ諷句愛螳・*: 
   - 笨・螳溯｣・ｸ・ 繝ｫ繝ｼ繝亥ｭ伜惠 + 繝ｪ繝ｳ繧ｯ蟄伜惠 + UI螳溯｣・   - 迫 繝ｪ繝ｳ繧ｯ蟄伜惠・九Ν繝ｼ繝育┌: **404蛟呵｣・* 竊・谺｡縺ｮ蜆ｪ蜈亥ｺｦ A
   - 笶・譛ｪ螳溯｣・ 繝ｪ繝ｳ繧ｯ/繝ｫ繝ｼ繝亥・縺ｫ辟｡

---

## 桃 App Router 繝ｫ繝ｼ繝井ｸ隕ｧ・亥・32繝ｫ繝ｼ繝茨ｼ・
### 繝ｫ繝ｼ繝亥・鬘槭→ URL 繝代ち繝ｼ繝ｳ

| 繝ｫ繝ｼ繝・| URL 繝代ち繝ｼ繝ｳ | 隱ｬ譏・| 迥ｶ諷・|
|--------|------------|------|------|
| **繝帙・繝** | | | |
| home-client | `/` | 繝｡繧､繝ｳ繝繝・す繝･繝懊・繝会ｼ・ome逕ｻ髱｢・・| 笨・螳溯｣・ｸ・|
| **繝ｭ繧ｰ繧､繝ｳ繝ｻ隱崎ｨｼ** | | | |
| login/page | `/login` | 繝ｭ繧ｰ繧､繝ｳ逕ｻ髱｢ | 笨・螳溯｣・ｸ・|
| reset-password/page | `/reset-password` | 繝代せ繝ｯ繝ｼ繝峨Μ繧ｻ繝・ヨ | 笨・螳溯｣・ｸ・|
| **繧ｵ繝ｼ繝薙せ邂｡逅・* | | | |
| services/[serviceId]/page | `/services/{serviceId}` | 繧ｵ繝ｼ繝薙せ隧ｳ邏ｰ繝壹・繧ｸ | 笨・螳溯｣・ｸ・|
| services/[serviceId]/staff/page | `/services/{serviceId}/staff` | 繧ｹ繧ｿ繝・ヵ荳隕ｧ | 笨・螳溯｣・ｸ・|
| services/[serviceId]/users/page | `/services/{serviceId}/users` | 蛻ｩ逕ｨ閠・ｸ隕ｧ | 笨・螳溯｣・ｸ・|
| **蛻ｩ逕ｨ閠・ｮ｡逅・* | | | |
| services/[serviceId]/users/[userId]/page | `/services/{serviceId}/users/{userId}` | 蛻ｩ逕ｨ閠・ｩｳ邏ｰ・医・繝ｭ繝輔ぅ繝ｼ繝ｫ・・| 笨・螳溯｣・ｸ・|
| services/[serviceId]/users/[userId]/case-records/page | `/services/{serviceId}/users/{userId}/case-records` | **繧ｱ繝ｼ繧ｹ險倬鹸** | 笨・螳溯｣・ｸ・|
| services/[serviceId]/users/[userId]/daily-logs/page | `/services/{serviceId}/users/{userId}/daily-logs` | 譌･隱御ｸ隕ｧ | 笨・螳溯｣・ｸ・|
| services/[serviceId]/users/[userId]/diary/page | `/services/{serviceId}/users/{userId}/diary` | 譌･險倥・繝ｼ繧ｸ | 笨・螳溯｣・ｸ・|
| **譌･隱後・險倬鹸** | | | |
| daily-log/page | `/daily-log` | 譌･隱後Γ繧､繝ｳ | 笨・螳溯｣・ｸ・|
| daily-log/expression/page | `/daily-log/expression` | 陦ｨ諠・・蜿榊ｿ懆ｨ倬鹸 | 笨・螳溯｣・ｸ・|
| daily-log/expression/history/page | `/daily-log/expression/history` | 陦ｨ諠・・蜿榊ｿ懷ｱ･豁ｴ | 笨・螳溯｣・ｸ・|
| daily-log/seizure/page | `/daily-log/seizure` | 逋ｺ菴懆ｨ倬鹸 | 笨・螳溯｣・ｸ・|
| daily-log/seizure/history/page | `/daily-log/seizure/history` | 逋ｺ菴懷ｱ･豁ｴ | 笨・螳溯｣・ｸ・|
| **譌･險・* | | | |
| diary/page | `/diary` | 譌･險倅ｸ隕ｧ | 笨・螳溯｣・ｸ・|
| diary/[id]/page | `/diary/{id}` | 譌･險倩ｩｳ邏ｰ | 笨・螳溯｣・ｸ・|
| diary/monthly/page | `/diary/monthly` | 譛亥挨譌･險倥ン繝･繝ｼ | 笨・螳溯｣・ｸ・|
| **縺昴・莉匁ｩ溯・** | | | |
| alerts/page | `/alerts` | 繧｢繝ｩ繝ｼ繝井ｸ隕ｧ | 笨・螳溯｣・ｸ・|
| medications/page | `/medications` | 譛崎脈邂｡逅・| 笨・螳溯｣・ｸ・|
| seizures/page | `/seizures` | 逋ｺ菴懃ｮ｡逅・| 笨・螳溯｣・ｸ・|
| seizures/new/page | `/seizures/new` | 逋ｺ菴懈眠隕剰ｨ倬鹸 | 笨・螳溯｣・ｸ・|
| todos/page | `/todos` | TODO邂｡逅・| 笨・螳溯｣・ｸ・|
| voice/page | `/voice` | 髻ｳ螢ｰ險倬鹸 | 笨・螳溯｣・ｸ・|
| family/page | `/family` | 螳ｶ譌城｣謳ｺ | 笨・螳溯｣・ｸ・|
| settings/thresholds/page | `/settings/thresholds` | 髢ｾ蛟､險ｭ螳・| 笨・螳溯｣・ｸ・|
| print/a4/case-record/page | `/print/a4/case-record` | A4繧ｱ繝ｼ繧ｹ險倬鹸蜊ｰ蛻ｷ逕ｨ | 笨・螳溯｣・ｸ・|
| forms/[form]/page | `/forms/{form}` | 蜍慕噪繝輔か繝ｼ繝 | 笨・螳溯｣・ｸ・|
| **Pochi・磯撼陦ｨ遉ｺ繧ｰ繝ｫ繝ｼ繝暦ｼ・* | | | |
| (pochi)/users/page | `/pochi/users`? | Pochi逕ｨ蛻ｩ逕ｨ閠・ｸ隕ｧ | 笶・荳肴・ |
| (pochi)/manage/achievements/daily/page | `/pochi/manage/achievements/daily`? | Pochi驕疲・邂｡逅・| 笶・荳肴・ |
| **Records・磯撼陦ｨ遉ｺ繧ｰ繝ｫ繝ｼ繝暦ｼ・* | | | |
| (records)/* | 髱櫁｡ｨ遉ｺ | 險倬鹸逕ｨ蜀・Κ繝ｫ繝ｼ繝・| 笶・荳肴・ |

---

## 迫 繝｡繝九Η繝ｼ繝ｻ繝ｪ繝ｳ繧ｯ辣ｧ蜷郁｡ｨ

### 繝帙・繝逕ｻ髱｢縺ｮ繝ｪ繝ｳ繧ｯ

| 繝ｪ繝ｳ繧ｯ譁・ｭ怜・ | href | 繝ｫ繝ｼ繝亥ｭ伜惠 | 迥ｶ諷・| 蛯呵・|
|-----------|------|----------|------|------|
| 繧ｱ繝ｼ繧ｹ險倬鹸 | `/services/life-care/users/AT/case-records` | 笨・| 笨・螳溯｣・ｸ・| AT・・繝ｻT縺輔ｓ・牙ｰら畑繝ｪ繝ｳ繧ｯ |
| 譌･隱瑚ｨ倬鹸 | `/daily-log` | 笨・| 笨・螳溯｣・ｸ・| 譌･隱後Γ繧､繝ｳ繝壹・繧ｸ |
| 逋ｺ菴懆ｨ倬鹸 | `/seizures` | 笨・| 笨・螳溯｣・ｸ・| 逋ｺ菴懃ｮ｡逅・・繝ｼ繧ｸ |
| 譛崎脈邂｡逅・| `/medications` | 笨・| 笨・螳溯｣・ｸ・| 譛崎脈邂｡逅・・繝ｼ繧ｸ |
| 譌･險・| `/diary` | 笨・| 笨・螳溯｣・ｸ・| 譌･險倅ｸ隕ｧ繝壹・繧ｸ |
| 繧ｵ繝ｼ繝薙せ荳隕ｧ | `/services/{serviceId}` | 笨・| 笨・螳溯｣・ｸ・| 蜷・し繝ｼ繝薙せ縺ｮ隧ｳ邏ｰ繝壹・繧ｸ |

### 蛻ｩ逕ｨ閠・ｩｳ邏ｰ繝壹・繧ｸ (`/services/{serviceId}/users/{userId}`) 縺ｮ繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ

| 繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ鬆・岼 | 驕ｷ遘ｻ蜈・URL | 繝ｫ繝ｼ繝亥ｭ伜惠 | 迥ｶ諷・| 蛯呵・|
|------------------|----------|----------|------|------|
| Overview 繧ｿ繝・| `/services/{serviceId}/users/{userId}` | 笨・| 笨・螳溯｣・ｸ・| 蛻ｩ逕ｨ閠・・繝ｭ繝輔ぅ繝ｼ繝ｫ |
| Case Records 繝懊ち繝ｳ | `/services/{serviceId}/users/{userId}/case-records` | 笨・| 笨・螳溯｣・ｸ・| 繧ｱ繝ｼ繧ｹ險倬鹸繝壹・繧ｸ |
| Daily Logs | `/services/{serviceId}/users/{userId}/daily-logs` | 笨・| 笨・螳溯｣・ｸ・| 譌･隱御ｸ隕ｧ |
| Diary | `/services/{serviceId}/users/{userId}/diary` | 笨・| 笨・螳溯｣・ｸ・| 譌･險倥・繝ｼ繧ｸ |

---

## 閥 404 蛟呵｣懶ｼ医Μ繝ｳ繧ｯ蟄伜惠 竊・繝ｫ繝ｼ繝育┌・・
迴ｾ蝨ｨ縺ｮ縺ｨ縺薙ｍ縲・*404蛟呵｣懊・讀懷・縺輔ｌ縺ｾ縺帙ｓ縺ｧ縺励◆**縲・
#### 陬懆ｶｳ
- `home-client.tsx` 陦・82: `Link href="/services/life-care/users/AT/case-records"` 縺ｯ豁｣縺励￥繝ｫ繝ｼ繝医′蟄伜惠
- 縺吶∋縺ｦ縺ｮ繝｡繝九Η繝ｼ繝ｪ繝ｳ繧ｯ縺悟ｯｾ蠢懊☆繧九Ν繝ｼ繝医ｒ謖√▽
- 縺溘□縺励・*AT・・AT"縺ｨ縺・≧ userId・峨′莠句燕縺ｫ Supabase 縺ｫ蟄伜惠縺励※縺・ｋ縺・*繧堤｢ｺ隱阪☆繧句ｿ・ｦ√′縺ゅｋ

---

## 伯 API 繝ｫ繝ｼ繝井ｸ隕ｧ・亥・11繧ｨ繝ｳ繝峨・繧､繝ｳ繝茨ｼ・
| API 繧ｨ繝ｳ繝峨・繧､繝ｳ繝・| 繝｡繧ｽ繝・ラ | 隱ｬ譏・| 蛻ｩ逕ｨ蜈・| 迥ｶ諷・|
|------------------|---------|------|-------|------|
| `/api/case-records/save` | POST | 繧ｱ繝ｼ繧ｹ險倬鹸繧剃ｿ晏ｭ・| CaseRecordFormClient.tsx | 笨・螳溯｣・ｸ・|
| `/api/case-records/list` | GET | 繧ｱ繝ｼ繧ｹ險倬鹸荳隕ｧ蜿門ｾ・| CaseRecordsListClient.tsx | 笨・螳溯｣・ｸ・|
| `/api/case-records` | GET/POST/DELETE | 繧ｱ繝ｼ繧ｹ險倬鹸 CRUD | 隍・焚 | 笨・螳溯｣・ｸ・|
| `/api/care-receivers` | GET/POST/DELETE | 蛻ｩ逕ｨ閠・ュ蝣ｱ CRUD | ServicePage, UserList | 笨・螳溯｣・ｸ・|
| `/api/care-receivers/list` | GET | 蛻ｩ逕ｨ閠・ｸ隕ｧ蜿門ｾ・| Dashboard | 笨・螳溯｣・ｸ・|
| `/api/care-receivers/[id]` | GET/PUT/DELETE | 蛻ｩ逕ｨ閠・ｩｳ邏ｰ謫堺ｽ・| UserDetailPage | 笨・螳溯｣・ｸ・|
| `/api/care-receivers/update-display-name` | PUT | 蛻ｩ逕ｨ閠・錐譖ｴ譁ｰ | UserDetailPage | 笨・螳溯｣・ｸ・|
| `/api/staff` | GET/POST | 繧ｹ繧ｿ繝・ヵ諠・ｱ | StaffSelector | 笨・螳溯｣・ｸ・|
| `/api/voice/save` | POST | 髻ｳ螢ｰ險倬鹸菫晏ｭ・| VoiceRecorder | 笨・螳溯｣・ｸ・|
| `/api/whisper` | POST | 髻ｳ螢ｰ隱崎ｭ假ｼ・penAI Whisper・・| VoiceRecorder | 笨・螳溯｣・ｸ・|
| `/api/push/send` | POST | 繝励ャ繧ｷ繝･騾夂衍騾∽ｿ｡ | Notification | 笨・螳溯｣・ｸ・|

---

## ・ｽ・・繧ｻ繧ｭ繝･繝ｪ繝・ぅ繝ｻ驕狗畑讖溯・

| 讖溯・蛻・｡・| 讖溯・蜷・| 螳溯｣・憾豕・| 隱ｬ譏・|
|---------|-------|---------|------|
| **繝・・繝ｭ繧､繝｡繝ｳ繝・* | Vercel + Supabase 譛ｬ逡ｪ讒区・ | 笨・險ｭ險域ｸ・| `docs/DEPLOYMENT.md` 縺ｫ繝・・繝ｭ繧､謇矩・ｒ險倩ｼ・|
| **繝・・繝ｭ繧､繝｡繝ｳ繝・* | 迺ｰ蠅・､画焚邂｡逅・| 笨・險ｭ險域ｸ・| `NEXT_PUBLIC_SUPABASE_URL` 縺ｪ縺ｩ蠢・亥､画焚繧呈紛逅・|
| **繝・・繝ｭ繧､繝｡繝ｳ繝・* | 繝倥Ν繧ｹ繝√ぉ繝・け | 笨・險ｭ險域ｸ・| `/api/health` 繧ｨ繝ｳ繝峨・繧､繝ｳ繝茨ｼ井ｺ亥ｮ夲ｼ・|
| **蜷梧凾邱ｨ髮・宛蠕｡** | 讌ｽ隕ｳ繝ｭ繝・け・・ptimistic Locking・・| 笨・螳溯｣・ｸ・| `version` 繧ｫ繝ｩ繝縺ｫ繧医ｋ遶ｶ蜷域､懷・ |
| **蜷梧凾邱ｨ髮・宛蠕｡** | 409 Conflict 繧ｨ繝ｩ繝ｼ蜃ｦ逅・| 笨・螳溯｣・ｸ・| 繝輔Ο繝ｳ繝医〒遶ｶ蜷医ム繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ |
| **蜷梧凾邱ｨ髮・宛蠕｡** | 蜀崎ｪｭ縺ｿ霎ｼ縺ｿ繝懊ち繝ｳ | 笨・螳溯｣・ｸ・| AlertDialog 縺九ｉ譛譁ｰ繝・・繧ｿ蜿門ｾ・|
| **蜷梧凾邱ｨ髮・宛蠕｡** | DB 繝医Μ繧ｬ繝ｼ | 笨・螳溯｣・ｸ・| `increment_version()` 縺ｧ閾ｪ蜍・version 蠅怜刈 |
| **蛻ｩ逕ｨ閠・ュ蝣ｱ邂｡逅・* | 蛟倶ｺｺ諠・ｱ邱ｨ髮・ヵ繧ｩ繝ｼ繝 | 笨・螳溯｣・ｸ・| full_name, address, phone, emergency_contact 縺ｪ縺ｩ |
| **蛻ｩ逕ｨ閠・ュ蝣ｱ邂｡逅・* | 蛹ｻ逋ら噪繧ｱ繧｢隧ｳ邏ｰ蜈･蜉・| 笨・螳溯｣・ｸ・| 邨檎ｮ｡譬・､翫∝精蠑輔・・邏蜷ｸ蜈･縲∽ｺｺ蟾･蜻ｼ蜷ｸ蝎ｨ縲∫匱菴懷ｯｾ蠢・|
| **蛻ｩ逕ｨ閠・ュ蝣ｱ邂｡逅・* | 蛹ｿ蜷崎｡ｨ遉ｺ・・isplay_name・・| 笨・螳溯｣・ｸ・| 蛟倶ｺｺ諠・ｱ菫晁ｭｷ縺ｮ縺溘ａ display_name 繧貞渕譛ｬ陦ｨ遉ｺ |
| **蛻ｩ逕ｨ閠・ュ蝣ｱ邂｡逅・* | RLS 縺ｫ繧医ｋ蛟倶ｺｺ諠・ｱ菫晁ｭｷ | 笨・螳溯｣・ｸ・| 閨ｷ蜩｡縺ｮ縺ｿ繧｢繧ｯ繧ｻ繧ｹ蜿ｯ閭ｽ縲∥non 縺ｯ諡貞凄 |
| **蛻ｩ逕ｨ閠・ュ蝣ｱ邂｡逅・* | 讌ｽ隕ｳ繝ｭ繝・け・亥茜逕ｨ閠・ュ蝣ｱ・・| 笨・螳溯｣・ｸ・| version 繧ｫ繝ｩ繝 + 409 UI |
| **逶｣譟ｻ繝ｭ繧ｰ** | care_receiver_audits 繝・・繝悶Ν | 笨・螳溯｣・ｸ・| 螟画峩縺輔ｌ縺溘ヵ繧｣繝ｼ繝ｫ繝牙錐縺ｮ縺ｿ險倬鹸 |
| **逶｣譟ｻ繝ｭ繧ｰ** | 閾ｪ蜍慕屮譟ｻ繝ｭ繧ｰ險倬鹸 | 笨・螳溯｣・ｸ・| UPDATE 繝医Μ繧ｬ繝ｼ縺ｧ閾ｪ蜍戊ｨ倬鹸 |

### 螳溯｣・ｩｳ邏ｰ

#### 蛻ｩ逕ｨ閠・ュ蝣ｱ邱ｨ髮・- **DB migration**: `supabase/migrations/20260128100000_add_personal_info_to_care_receivers.sql`
- **API**: `/api/care-receivers/[id]` 縺ｧ PUT/GET・・ersion 繝√ぉ繝・け + 409 Conflict・・- **UI**: `components/edit-care-receiver-dialog.tsx`・亥倶ｺｺ諠・ｱ邱ｨ髮・ヵ繧ｩ繝ｼ繝 + 蛹ｻ逋ら噪繧ｱ繧｢繝√ぉ繝・け繝懊ャ繧ｯ繧ｹ・・- **繝壹・繧ｸ邨ｱ蜷・*: `app/services/[serviceId]/users/[userId]/page.tsx`・・白 隧ｳ邏ｰ諠・ｱ繧堤ｷｨ髮・ 繝懊ち繝ｳ・・- **蛟倶ｺｺ諠・ｱ菫晁ｭｷ**: 繝ｭ繧ｰ蜃ｺ蜉帷ｦ∵ｭ｢縲ヽLS 縺ｧ菫晁ｭｷ縲・幕逋ｺ迺ｰ蠅・〒縺ｯ蛹ｿ蜷阪ョ繝ｼ繧ｿ縺ｮ縺ｿ

#### 讌ｽ隕ｳ繝ｭ繝・け・医こ繝ｼ繧ｹ險倬鹸・・- **DB migration**: `supabase/migrations/20260128093212_add_version_to_case_records.sql`
- **API**: `/api/case-records/save` 縺ｧ `version` 繝代Λ繝｡繝ｼ繧ｿ繧貞女縺大叙繧翫∽ｸ閾ｴ縺励↑縺代ｌ縺ｰ 409 繧定ｿ泌唆
- **繝輔Ο繝ｳ繝・*: `CaseRecordFormClient.tsx` 縺ｧ 409 蜿嶺ｿ｡譎ゅ↓遶ｶ蜷医ム繧､繧｢繝ｭ繧ｰ繧定｡ｨ遉ｺ
- **險ｭ險域嶌**: `docs/CONCURRENCY.md` 縺ｫ隧ｳ邏ｰ險ｭ險医ｒ險倩ｼ・
#### 繝・・繝ｭ繧､繝｡繝ｳ繝・- **Vercel**: Next.js 繧｢繝励Μ繧・Vercel 縺ｫ繝・・繝ｭ繧､
- **Supabase**: 譛ｬ逡ｪ逕ｨ繝励Ο繧ｸ繧ｧ繧ｯ繝医ｒ譁ｰ隕丈ｽ懈・縺励∫腸蠅・､画焚縺ｫ險ｭ螳・- **迺ｰ蠅・､画焚**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **險ｭ險域嶌**: `docs/DEPLOYMENT.md` 縺ｫ繝・・繝ｭ繧､謇矩・ｒ險倩ｼ・
---

## ・ｽ投 讖溯・繧ｹ繝・・繧ｿ繧ｹ繧ｵ繝槭Μ繝ｼ

| 繧ｫ繝・ざ繝ｪ | 螳溯｣・ｸ・| 404 | 譛ｪ螳溯｣・| 蜷郁ｨ・|
|---------|------|-----|-------|------|
| 繝壹・繧ｸ/繝ｫ繝ｼ繝・| 30 | 0 | 2* | 32 |
| API 繧ｨ繝ｳ繝峨・繧､繝ｳ繝・| 11 | 0 | 0 | 11 |
| 繝｡繝九Η繝ｼ繝ｪ繝ｳ繧ｯ | 6 | 0 | 0 | 6 |

*譛ｪ螳溯｣・ `(pochi)` 繧ｰ繝ｫ繝ｼ繝・2繝ｫ繝ｼ繝茨ｼ磯撼陦ｨ遉ｺ繧ｰ繝ｫ繝ｼ繝励∝ｮ溯｣・憾豕∽ｸ肴・・・
---

## 笨・縲後こ繝ｼ繧ｹ險倬鹸縲肴ｩ溯・縺ｮ隧ｳ邏ｰ遒ｺ隱・
### 繝ｪ繝ｳ繧ｯ蜈・- **繝帙・繝逕ｻ髱｢** (`app/home-client.tsx` L482)
  ```tsx
  <Link href="/services/life-care/users/AT/case-records">
    <h3>繧ｱ繝ｼ繧ｹ險倬鹸</h3>
    <p>蛻ｩ逕ｨ閠・ｯ弱・繧ｱ繝ｼ繧ｹ險倬鹸遒ｺ隱・/p>
  </Link>
  ```

- **蛻ｩ逕ｨ閠・ｩｳ邏ｰ繝壹・繧ｸ** (`app/services/[serviceId]/users/[userId]/page.tsx` L650)
  ```tsx
  router.push(`/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/case-records`)
  ```

### 繝ｫ繝ｼ繝亥ｮ溯｣・- **繝ｫ繝ｼ繝・*: `/services/[serviceId]/users/[userId]/case-records/page.tsx` 笨・蟄伜惠
- **繧ｳ繝ｳ繝昴・繝阪Φ繝・*: `src/components/case-records/CaseRecordFormClient.tsx` 笨・螳溯｣・ｸ・- **API**: `/api/case-records/save` (POST) 笨・螳溯｣・ｸ・
### 萓晏ｭ倥ユ繝ｼ繝悶Ν
- `case_records` (Supabase)
- `care_receivers` (Supabase)
- `services` (Supabase)

### 迴ｾ蝨ｨ縺ｮ螳溯｣・憾豕・笨・**螳悟・螳溯｣・*
- 繝壹・繧ｸ繝ｫ繝ｼ繝亥ｭ伜惠
- 繝輔か繝ｼ繝UI螳溯｣・- 菫晏ｭ連PI螳溯｣・- 荳隕ｧ陦ｨ遉ｺAPI螳溯｣・
---

## 噫 谺｡縺ｫ逶ｴ縺吶∋縺・404 荳隕ｧ

**迴ｾ蝨ｨ: 0莉ｶ**

縺吶∋縺ｦ縺ｮ繝｡繝九Η繝ｼ繝ｪ繝ｳ繧ｯ縺梧ｭ｣縺励＞繝ｫ繝ｼ繝医ｒ謖・＠縺ｦ縺翫ｊ縲・04 縺ｯ讀懷・縺輔ｌ縺ｾ縺帙ｓ縺ｧ縺励◆縲・
### 縺溘□縺礼｢ｺ隱阪☆縺ｹ縺埼・岼

1. **AT・・serId "AT"・峨・蟄伜惠遒ｺ隱・*
   - 繝帙・繝逕ｻ髱｢縺ｧ `AT` 縺ｫ繝上・繝峨さ繝ｼ繝峨＆繧後◆繝ｪ繝ｳ繧ｯ縺後≠繧・   - Supabase 縺ｫ螳滄圀縺ｫ `AT` 縺ｨ縺・≧ user 縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱阪′蠢・ｦ・   - 蟄伜惠縺励↑縺・ｴ蜷・竊・蜍慕噪縺ｫ蛻ｩ逕ｨ閠・ｒ驕ｸ謚槭〒縺阪ｋ繧医≧縺ｫ菫ｮ豁｣縺吶∋縺・
2. **(pochi) 繧ｰ繝ｫ繝ｼ繝励・謨ｴ逅・*
   - `app/(pochi)/users/page.tsx` 縺ｨ `app/(pochi)/manage/achievements/daily/page.tsx` 縺ｯ菴輔°?
   - 髱櫁｡ｨ遉ｺ繧ｰ繝ｫ繝ｼ繝励□縺後Ν繝ｼ繝医・蟄伜惠縺吶ｋ 竊・隕∫｢ｺ隱・
3. **蜑企勁貂医∩/蟒・ｭ｢繝ｫ繝ｼ繝医・遒ｺ隱・*
   - 譌ｧ URL 繧・炎髯､貂医∩ API 縺ｸ縺ｮ蜿ら・縺後↑縺・°遒ｺ隱・
---

## 統 繝ｪ繝ｳ繧ｯ遒ｺ隱阪さ繝槭Φ繝・
```bash
# 縲後こ繝ｼ繧ｹ險倬鹸縲阪梧律隱後阪↑縺ｩ縺ｮ蜈ｨ繝ｪ繝ｳ繧ｯ蜃ｺ迴ｾ邂・園
rg -n "case-records|繧ｱ繝ｼ繧ｹ險倬鹸|diary|譌･隱・ app --type ts --type tsx

# API 蜻ｼ縺ｳ蜃ｺ縺怜・迴ｾ邂・園
rg -n "/api/" src components --type ts --type tsx | grep fetch
```

---

## 菴ｿ逕ｨ繝・Φ繝励Ξ繝ｼ繝・
- **shared schema**: `src/lib/case-records/form-schemas.ts`
- **API schema validation**: Zod
- **State management**: React Hooks + localStorage/Supabase

---

**End of Document**  
*谺｡縺ｮ繧ｿ繧ｹ繧ｯ: 蜆ｪ蜈亥ｺｦA縲窟T 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ蜍慕噪蛹悶阪∪縺溘・繝ｪ繝ｳ繧ｯ譛ｪ螳溯｣・・404菫ｮ豁｣*

