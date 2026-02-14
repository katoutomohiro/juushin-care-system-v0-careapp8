# 繧ｱ繝ｼ繧ｹ險倬鹸菫晏ｭ俶ｩ溯・ 蜍穂ｽ懃｢ｺ隱肴焔鬆・
## 蜑肴署譚｡莉ｶ

### 1. 迺ｰ蠅・､画焚險ｭ螳・(.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase繝・・繝悶Ν菴懈・
`supabase/migrations/20260108_create_case_records.sql` 繧貞ｮ溯｡梧ｸ医∩縺ｧ縺ゅｋ縺薙→

---

## 蜍穂ｽ懃｢ｺ隱肴焔鬆・
### Step 1: 髢狗匱繧ｵ繝ｼ繝舌・襍ｷ蜍・```powershell
pnpm dev
```

### Step 2: 繝悶Λ繧ｦ繧ｶ縺ｧ繧ｱ繝ｼ繧ｹ險倬鹸繝壹・繧ｸ繧帝幕縺・```
http://dev-app.local:3000/services/life-care/users/AT/case-records
```

### Step 3: DevTools 繧帝幕縺・- F12 繧ｭ繝ｼ縺ｧ髢狗匱閠・ヤ繝ｼ繝ｫ繧定｡ｨ遉ｺ
- **Network** 繧ｿ繝悶ｒ驕ｸ謚・- **Fetch/XHR** 繝輔ぅ繝ｫ繧ｿ繝ｼ繧呈怏蜉ｹ蛹・
### Step 4: 繝輔か繝ｼ繝縺ｫ蜈･蜉・1. 譌･莉倥・譎ょ綾縺ｯ閾ｪ蜍募・蜉帙＆繧後※縺・ｋ・育｢ｺ隱搾ｼ・2. 繝｡繧､繝ｳ繧ｹ繧ｿ繝・ヵ: 縲後せ繧ｿ繝・ヵA縲阪ｒ驕ｸ謚・3. 繧ｵ繝悶せ繧ｿ繝・ヵ: 縲後せ繧ｿ繝・ヵB縲阪ｒ驕ｸ謚・4. 迚ｹ險倅ｺ矩・↓菴輔°蜈･蜉・ 萓九後ユ繧ｹ繝郁ｨ倬鹸縲・5. AT繝・Φ繝励Ξ繝ｼ繝医・繧ｫ繧ｹ繧ｿ繝繝輔ぅ繝ｼ繝ｫ繝峨↓蜈･蜉・
   - 繧ｹ繝医Ξ繝・メ繝ｻ繝槭ャ繧ｵ繝ｼ繧ｸ: 縲・0蛻・ｮ滓命縲・   - 隱ｲ鬘娯蔵: 縲檎捩蠎ｧ險鍋ｷｴ縲阪↑縺ｩ

### Step 5: 菫晏ｭ倥・繧ｿ繝ｳ繧偵け繝ｪ繝・け
1. **縲御ｿ晏ｭ倥・* 繝懊ち繝ｳ繧偵け繝ｪ繝・け
2. 繝懊ち繝ｳ縺・**縲御ｿ晏ｭ倅ｸｭ...縲・* 縺ｫ螟峨ｏ繧翫‥isabled 縺ｫ縺ｪ繧九％縺ｨ繧堤｢ｺ隱・3. Network 繧ｿ繝悶〒莉･荳九ｒ遒ｺ隱・

#### 笨・遒ｺ隱阪・繧､繝ｳ繝・: 繝ｪ繧ｯ繧ｨ繧ｹ繝磯∽ｿ｡
- **Name**: `case-records`
- **Method**: `POST`
- **Status**: `200` (謌仙粥)
- **Type**: `fetch`

#### 笨・遒ｺ隱阪・繧､繝ｳ繝・: 繝ｪ繧ｯ繧ｨ繧ｹ繝亥・螳ｹ
Request Payload (Preview 繧ｿ繝・:
```json
{
  "userId": "AT",
  "serviceId": "life-care",
  "recordDate": "2026-01-08",
  "recordTime": "14:30",
  "mainStaffId": "staff-1",
  "subStaffIds": ["staff-2"],
  "payload": {
    "specialNotes": "繝・せ繝郁ｨ倬鹸",
    "familyNotes": "",
    "custom": {
      "stretch_massage": "10蛻・ｮ滓命",
      "task_1": "逹蠎ｧ險鍋ｷｴ"
    }
  }
}
```

#### 笨・遒ｺ隱阪・繧､繝ｳ繝・: 繝ｬ繧ｹ繝昴Φ繧ｹ蜀・ｮｹ
Response (Preview 繧ｿ繝・:
```json
{
  "ok": true,
  "record": {
    "id": "uuid-here",
    "user_id": "AT",
    "service_id": "life-care",
    "record_date": "2026-01-08",
    "record_time": "14:30:00",
    "payload": { ... },
    "created_at": "2026-01-08T05:30:00Z",
    "updated_at": "2026-01-08T05:30:00Z"
  }
}
```

### Step 6: UI遒ｺ隱・1. **Toast騾夂衍** 縺檎判髱｢蜿ｳ荳奇ｼ医∪縺溘・險ｭ螳壹＆繧後◆菴咲ｽｮ・峨↓陦ｨ遉ｺ縺輔ｌ繧・
   - 繧ｿ繧､繝医Ν: "笨・繧ｱ繝ｼ繧ｹ險倬鹸繧剃ｿ晏ｭ倥＠縺ｾ縺励◆"
   - 隱ｬ譏・ "AT 縺ｮ險倬鹸縺梧ｭ｣蟶ｸ縺ｫ菫晏ｭ倥＆繧後∪縺励◆ (14:30:45)"

2. **譛邨ゆｿ晏ｭ倥ヰ繝翫・** 縺後ヵ繧ｩ繝ｼ繝荳企Κ縺ｫ陦ｨ遉ｺ縺輔ｌ繧・
   ```
   笨・譛邨ゆｿ晏ｭ・ 2026/1/8 14:30:45
   ```

3. 菫晏ｭ倥・繧ｿ繝ｳ縺・**縲御ｿ晏ｭ倥・* 縺ｫ謌ｻ繧翫∝・蠎ｦ繧ｯ繝ｪ繝・け蜿ｯ閭ｽ縺ｫ縺ｪ繧・
### Step 7: Supabase遒ｺ隱・1. Supabase Dashboard 縺ｫ繝ｭ繧ｰ繧､繝ｳ
2. **Table Editor** 竊・`case_records` 繧帝幕縺・3. 莉･荳九・繝ｬ繧ｳ繝ｼ繝峨′蟄伜惠縺吶ｋ縺薙→繧堤｢ｺ隱・

| id | user_id | service_id | record_date | record_time | payload | created_at | updated_at |
|----|---------|------------|-------------|-------------|---------|------------|------------|
| (uuid) | AT | life-care | 2026-01-08 | 14:30:00 | {...} | 2026-01-08 05:30:00+00 | 2026-01-08 05:30:00+00 |

### Step 8: 譖ｴ譁ｰ繝・せ繝茨ｼ亥酔縺俶律莉倥〒蜀堺ｿ晏ｭ假ｼ・1. 繝輔か繝ｼ繝縺ｮ蜀・ｮｹ繧貞､画峩・井ｾ・ 迚ｹ險倅ｺ矩・ｒ縲梧峩譁ｰ繝・せ繝医阪↓螟画峩・・2. 繧ゅ≧荳蠎ｦ **縲御ｿ晏ｭ倥・* 繧偵け繝ｪ繝・け
3. Network 繧ｿ繝悶〒 `POST /api/case-records` 縺・`200` 繧定ｿ斐☆縺薙→繧堤｢ｺ隱・4. Supabase 縺ｧ蜷後§繝ｬ繧ｳ繝ｼ繝峨′ **UPDATE** 縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱・
   - `updated_at` 縺梧眠縺励￥縺ｪ縺｣縺ｦ縺・ｋ
   - `payload` 縺ｮ蜀・ｮｹ縺梧峩譁ｰ縺輔ｌ縺ｦ縺・ｋ

---

## 繧ｨ繝ｩ繝ｼ繧ｱ繝ｼ繧ｹ縺ｮ遒ｺ隱・
### Case 1: Supabase謗･邯壹お繝ｩ繝ｼ
**繧ｷ繝溘Η繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ**: `.env.local` 縺ｮ `SUPABASE_SERVICE_ROLE_KEY` 繧剃ｸ譎ら噪縺ｫ辟｡蜉ｹ縺ｪ蛟､縺ｫ縺吶ｋ

**譛溷ｾ・ｵ先棡**:
- Network: `500 Internal Server Error`
- Response: `{ "ok": false, "error": "Server configuration error" }`
- Toast: 縲娯搆 菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆縲・
### Case 2: 蠢・医ヵ繧｣繝ｼ繝ｫ繝画ｬ謳・**繧ｷ繝溘Η繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ**: DevTools Console 縺ｧ螳溯｡・```javascript
fetch('/api/case-records', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serviceId: 'life-care' }) // userId谺謳・}).then(r => r.json()).then(console.log)
```

**譛溷ｾ・ｵ先棡**:
- Network: `400 Bad Request`
- Response: `{ "ok": false, "error": "Missing required fields: userId, serviceId, recordDate" }`

---

## 繝医Λ繝悶Ν繧ｷ繝･繝ｼ繝・ぅ繝ｳ繧ｰ

### 蝠城｡・ 菫晏ｭ倥・繧ｿ繝ｳ繧呈款縺励※繧ゆｽ輔ｂ襍ｷ縺阪↑縺・**蜴溷屏**: 
- 繝輔か繝ｼ繝縺ｮ `onSubmit` 縺悟他縺ｰ繧後※縺・↑縺・- `handleSubmit` 縺御ｾ句､悶〒豁｢縺ｾ縺｣縺ｦ縺・ｋ

**隗｣豎ｺ遲・*:
1. Console 繧ｿ繝悶〒繧ｨ繝ｩ繝ｼ繧堤｢ｺ隱・2. `[CaseRecordFormClient] Submitting:` 繝ｭ繧ｰ縺悟・縺ｦ縺・ｋ縺狗｢ｺ隱・3. Network 繧ｿ繝悶〒 fetch 繝ｪ繧ｯ繧ｨ繧ｹ繝医′蜃ｺ縺ｦ縺・ｋ縺狗｢ｺ隱・
### 蝠城｡・ 500繧ｨ繝ｩ繝ｼ縺瑚ｿ斐ｋ
**蜴溷屏**:
- Supabase迺ｰ蠅・､画焚縺瑚ｨｭ螳壹＆繧後※縺・↑縺・- Supabase繝・・繝悶Ν縺御ｽ懈・縺輔ｌ縺ｦ縺・↑縺・
**隗｣豎ｺ遲・*:
1. `.env.local` 縺ｮ迺ｰ蠅・､画焚繧堤｢ｺ隱・2. `pnpm dev` 繧貞・襍ｷ蜍・3. Supabase縺ｧ繝・・繝悶Ν菴懈・SQL繧貞ｮ溯｡・
### 蝠城｡・ 400繧ｨ繝ｩ繝ｼ縺瑚ｿ斐ｋ
**蜴溷屏**:
- 繝ｪ繧ｯ繧ｨ繧ｹ繝医・繝・ぅ縺ｫ蠢・医ヵ繧｣繝ｼ繝ｫ繝峨′蜷ｫ縺ｾ繧後※縺・↑縺・- 譌･莉倥ヵ繧ｩ繝ｼ繝槭ャ繝医′荳肴ｭ｣

**隗｣豎ｺ遲・*:
1. Network 竊・Payload 繧堤｢ｺ隱・2. `userId`, `serviceId`, `recordDate` 縺悟性縺ｾ繧後※縺・ｋ縺狗｢ｺ隱・3. Console 縺ｧ `[CaseRecordFormClient] Submitting:` 縺ｮ蜀・ｮｹ繧堤｢ｺ隱・
---

## 謌仙粥譎ゅ・繝ｭ繧ｰ蜃ｺ蜉帑ｾ・
### Console
```
[CaseRecordFormClient] Submitting: {
  date: "2026-01-08",
  time: "14:30",
  userId: "AT",
  serviceId: "life-care",
  mainStaffId: "staff-1",
  subStaffIds: ["staff-2"],
  specialNotes: "繝・せ繝郁ｨ倬鹸",
  familyNotes: "",
  custom: { stretch_massage: "10蛻・ｮ滓命" }
}

[case-records API] Upserting record: {
  user_id: "AT",
  service_id: "life-care",
  record_date: "2026-01-08"
}

[case-records API] Success: {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  user_id: "AT",
  ...
}

[CaseRecordFormClient] Saved: {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  ...
}
```

---

## 繝√ぉ繝・け繝ｪ繧ｹ繝・
- [ ] `.env.local` 縺ｫ Supabase迺ｰ蠅・､画焚繧定ｨｭ螳・- [ ] Supabase繝・・繝悶Ν `case_records` 繧剃ｽ懈・
- [ ] `pnpm dev` 縺ｧ髢狗匱繧ｵ繝ｼ繝舌・襍ｷ蜍・- [ ] `/services/life-care/users/AT/case-records` 縺ｫ繧｢繧ｯ繧ｻ繧ｹ
- [ ] DevTools Network 繧ｿ繝悶ｒ髢九￥
- [ ] 繝輔か繝ｼ繝縺ｫ蜈･蜉帙＠縺ｦ縲御ｿ晏ｭ倥阪ｒ繧ｯ繝ｪ繝・け
- [ ] `POST /api/case-records` 縺・`200` 繧定ｿ斐☆
- [ ] Toast騾夂衍縲娯怛 繧ｱ繝ｼ繧ｹ險倬鹸繧剃ｿ晏ｭ倥＠縺ｾ縺励◆縲阪′陦ｨ遉ｺ縺輔ｌ繧・- [ ] 縲梧怙邨ゆｿ晏ｭ倥阪ヰ繝翫・縺瑚｡ｨ遉ｺ縺輔ｌ繧・- [ ] Supabase `case_records` 繝・・繝悶Ν縺ｫ繝ｬ繧ｳ繝ｼ繝峨′菴懈・縺輔ｌ繧・- [ ] 蜷後§譌･莉倥〒蜀堺ｿ晏ｭ倥☆繧九→ `updated_at` 縺梧峩譁ｰ縺輔ｌ繧・
