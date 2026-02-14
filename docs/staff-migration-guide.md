# 閨ｷ蜩｡繝槭せ繧ｿDB蛹悶・繧､繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧ｬ繧､繝・
## 讎りｦ・MOCK_STAFF_OPTIONS縺九ｉSupabase staff繝・・繝悶Ν縺ｸ縺ｮ遘ｻ陦梧焔鬆・
## 螳溯｡碁・ｺ・
### 1. 繝槭う繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ螳溯｡・```bash
# Supabase CLI縺ｧ繝槭う繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧帝←逕ｨ
supabase db push

# 縺ｾ縺溘・縲ヾupabase Dashboard縺ｧ逶ｴ謗･SQL繧貞ｮ溯｡・# Migration: supabase/migrations/20260114_create_staff_table.sql
```

### 2. 菴懈・縺輔ｌ繧九ｂ縺ｮ

#### staff繝・・繝悶Ν
- `id` (uuid PK) - 閨ｷ蜩｡ID
- `service_id` (uuid) - 繧ｵ繝ｼ繝薙せID・亥､夜Κ繧ｭ繝ｼ: services.id・・- `name` (text) - 閨ｷ蜩｡蜷・- `sort_order` (int) - 陦ｨ遉ｺ鬆・- `is_active` (boolean) - 譛牙柑繝輔Λ繧ｰ・磯閨ｷ繝ｻ逡ｰ蜍慕ｮ｡逅・畑・・- `created_at` / `updated_at` (timestamptz)

#### case_records繝・・繝悶Ν縺ｫ霑ｽ蜉縺輔ｌ繧句・
- `main_staff_id` (uuid) - 荳ｻ諡・ｽ楢・蜩｡ID・亥､夜Κ繧ｭ繝ｼ: staff.id・・- `sub_staff_id` (uuid) - 蜑ｯ諡・ｽ楢・蜩｡ID・亥､夜Κ繧ｭ繝ｼ: staff.id・・
#### 繧ｷ繝ｼ繝峨ョ繝ｼ繧ｿ
13莠ｺ縺ｮ閨ｷ蜩｡繝・・繧ｿ縺瑚・蜍慕匳骭ｲ縺輔ｌ縺ｾ縺呻ｼ・1. 螻ｱ逕ｰ 螟ｪ驛・2. 菴占陸 闃ｱ蟄・3. 驤ｴ譛ｨ 荳驛・4. 逕ｰ荳ｭ 鄒主調
5. 莨願陸 蛛･螟ｪ
6. 貂｡霎ｺ 逕ｱ鄒・7. 鬮俶ｩ・螟ｧ霈・8. 荳ｭ譚・逵溽炊
9. 蟆乗棊 蟄晏､ｫ
10. 蜉阯､ 鮗ｻ陦｣
11. 蜷臥伐 蜥御ｹ・12. 螻ｱ譛ｬ 螂医・13. 菴舌・惠 鄙・
### 3. 繝・・繧ｿ遘ｻ陦鯉ｼ域里蟄倥Ξ繧ｳ繝ｼ繝峨′縺ゅｋ蝣ｴ蜷茨ｼ・
譌｢蟄倥・case_records縺ｫmain_staff_id縺檎ｩｺ縺ｮ繝ｬ繧ｳ繝ｼ繝峨′縺ゅｋ蝣ｴ蜷医・縲∵焔蜍輔〒險ｭ螳夲ｼ・
```sql
-- 萓・ 蜈ｨ繝ｬ繧ｳ繝ｼ繝峨↓繝・ヵ繧ｩ繝ｫ繝郁・蜩｡繧定ｨｭ螳・UPDATE case_records 
SET main_staff_id = (SELECT id FROM staff ORDER BY sort_order LIMIT 1)
WHERE main_staff_id IS NULL;
```

### 4. NOT NULL蛻ｶ邏・・霑ｽ蜉・育ｧｻ陦悟ｮ御ｺ・ｾ鯉ｼ・
蜈ｨ繝ｬ繧ｳ繝ｼ繝峨↓main_staff_id縺瑚ｨｭ螳壹＆繧後◆縺薙→繧堤｢ｺ隱榊ｾ鯉ｼ・
```sql
-- main_staff_id 繧貞ｿ・亥喧
ALTER TABLE case_records ALTER COLUMN main_staff_id SET NOT NULL;
```

### 5. 遒ｺ隱阪け繧ｨ繝ｪ

```sql
-- 閨ｷ蜩｡繝・・繧ｿ遒ｺ隱・SELECT COUNT(*) FROM staff;

-- 繧ｱ繝ｼ繧ｹ險倬鹸縺ｮ閨ｷ蜩｡險ｭ螳夂憾豕・SELECT 
  COUNT(*) as total,
  COUNT(main_staff_id) as with_main_staff,
  COUNT(sub_staff_id) as with_sub_staff
FROM case_records;

-- 閨ｷ蜩｡蛻･繧ｱ繝ｼ繧ｹ險倬鹸莉ｶ謨ｰ
SELECT 
  s.name,
  COUNT(cr.id) as record_count
FROM staff s
LEFT JOIN case_records cr ON cr.main_staff_id = s.id
GROUP BY s.id, s.name
ORDER BY s.sort_order;
```

## 繝輔Ο繝ｳ繝医お繝ｳ繝牙､画峩

### API霑ｽ蜉
- **GET /api/staff** - 閨ｷ蜩｡荳隕ｧ蜿門ｾ暦ｼ・erviceId蠢・茨ｼ・
### 繧ｳ繝ｳ繝昴・繝阪Φ繝亥､画峩
- **CaseRecordFormClient** - `useEffect`縺ｧDB 縺九ｉ閨ｷ蜩｡繝・・繧ｿ蜿門ｾ・- **API菫晏ｭ俶凾** - `mainStaffId` (UUID), `subStaffId` (UUID) 繧帝∽ｿ｡

### 蜑企勁縺輔ｌ縺溘さ繝ｼ繝・- `MOCK_STAFF_OPTIONS` 螳壽焚

## 繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ謇矩・ｼ亥ｿ・ｦ∵凾・・
```sql
-- 螟夜Κ繧ｭ繝ｼ蛻ｶ邏・炎髯､
ALTER TABLE case_records DROP CONSTRAINT IF EXISTS fk_case_records_main_staff;
ALTER TABLE case_records DROP CONSTRAINT IF EXISTS fk_case_records_sub_staff;

-- 蛻怜炎髯､
ALTER TABLE case_records DROP COLUMN IF EXISTS main_staff_id;
ALTER TABLE case_records DROP COLUMN IF EXISTS sub_staff_id;

-- staff繝・・繝悶Ν蜑企勁
DROP TABLE IF EXISTS staff CASCADE;
```

## 豕ｨ諢丈ｺ矩・
1. **service_id險ｭ螳・*: 繧ｷ繝ｼ繝峨ョ繝ｼ繧ｿ縺ｯ譛蛻昴・繧ｵ繝ｼ繝薙せ縺ｫ邏蝉ｻ倥￠繧峨ｌ縺ｾ縺吶り､・焚繧ｵ繝ｼ繝薙せ縺後≠繧句ｴ蜷医・謇句虚縺ｧ隱ｿ謨ｴ縺励※縺上□縺輔＞縲・
2. **閨ｷ蜩｡蜷阪・螟画峩**: staff繝・・繝悶Ν縺ｮname繧呈峩譁ｰ縺吶ｌ縺ｰ縲・℃蜴ｻ縺ｮ繧ｱ繝ｼ繧ｹ險倬鹸縺ｫ繧ょ渚譏縺輔ｌ縺ｾ縺呻ｼ・UID縺ｧ邏蝉ｻ倥￠縺ｦ縺・ｋ縺溘ａ・峨・
3. **騾閨ｷ繝ｻ逡ｰ蜍・*: `is_active = false`縺ｫ險ｭ螳壹☆繧後・縲∵眠隕剰ｨ倬鹸縺ｮ驕ｸ謚櫁い縺九ｉ髯､螟悶〒縺阪∪縺呻ｼ域里蟄倩ｨ倬鹸縺ｯ陦ｨ遉ｺ蜿ｯ閭ｽ・峨・
4. **蜑ｯ諡・ｽ・*: 迴ｾ蝨ｨ縺ｯ1莠ｺ縺ｮ縺ｿ蟇ｾ蠢懶ｼ・sub_staff_id`・峨り､・焚蜑ｯ諡・ｽ薙′蠢・ｦ√↑蝣ｴ蜷医・縲∽ｸｭ髢薙ユ繝ｼ繝悶Ν`case_record_staff`縺ｮ霑ｽ蜉繧呈､懆ｨ弱＠縺ｦ縺上□縺輔＞縲・
