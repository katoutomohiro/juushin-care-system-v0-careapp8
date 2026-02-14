# 蜷梧凾邱ｨ髮・宛蠕｡繧ｬ繧､繝・

**蟇ｾ雎｡**: 驥榊ｿ・こ繧｢謾ｯ謠ｴ繧｢繝励Μ v0  
**譖ｴ譁ｰ譌･**: 2026蟷ｴ1譛・8譌･  
**譁ｹ蠑・*: 讌ｽ隕ｳ逧・Ο繝・け・・ptimistic Locking・・

---

## 識 逶ｮ逧・

隍・焚縺ｮ遶ｯ譛ｫ・医せ繝槭・繝ｻ繧ｿ繝悶Ξ繝・ヨ繝ｻPC・峨ｄ繧ｹ繧ｿ繝・ヵ縺悟酔譎ゅ↓繧ｱ繝ｼ繧ｹ險倬鹸繧堤ｷｨ髮・☆繧矩圀縲・*繝・・繧ｿ縺ｮ遐ｴ螢翫ｄ荳頑嶌縺阪ｒ髦ｲ豁｢**縺吶ｋ縲・

### 諠ｳ螳壹す繝翫Μ繧ｪ

```
譎ょ綾 10:00 - 繧ｹ繧ｿ繝・ヵA・医せ繝槭・・峨′繧ｱ繝ｼ繧ｹ險倬鹸繧帝幕縺・
譎ょ綾 10:01 - 繧ｹ繧ｿ繝・ヵB・・C・峨′蜷後§繧ｱ繝ｼ繧ｹ險倬鹸繧帝幕縺・
譎ょ綾 10:02 - 繧ｹ繧ｿ繝・ヵA縺後後ヰ繧､繧ｿ繝ｫ: 菴捺ｸｩ36.5邃・阪ｒ菫晏ｭ・
譎ょ綾 10:03 - 繧ｹ繧ｿ繝・ヵB縺後悟ｙ閠・ 鬟滉ｺ矩㍼濶ｯ螂ｽ縲阪ｒ菫晏ｭ・
  竊・
閥 蝠城｡・ 繧ｹ繧ｿ繝・ヵA縺ｮ螟画峩縺梧ｶ医∴繧具ｼ・ast Write Wins・・
```

**蟇ｾ遲・*: 讌ｽ隕ｳ逧・Ο繝・け縺ｧ遶ｶ蜷医ｒ讀懃衍縺励√Θ繝ｼ繧ｶ繝ｼ縺ｫ騾夂衍縺吶ｋ

---

## 柏 讌ｽ隕ｳ逧・Ο繝・け譁ｹ蠑・

### 蝓ｺ譛ｬ蜴溽炊

1. **繝ｬ繧ｳ繝ｼ繝芽ｪｭ縺ｿ蜿悶ｊ譎・*: `version` 縺ｾ縺溘・ `updated_at` 繧貞叙蠕・
2. **菫晏ｭ俶凾**: 縲計ersion 縺悟､峨ｏ縺｣縺ｦ縺・↑縺・阪％縺ｨ繧堤｢ｺ隱阪＠縺ｦ譖ｴ譁ｰ
3. **遶ｶ蜷育匱逕滓凾**: 譖ｴ譁ｰ縺・0 莉ｶ 竊・409 Conflict 繧ｨ繝ｩ繝ｼ繧定ｿ斐☆
4. **繝ｦ繝ｼ繧ｶ繝ｼ蟇ｾ蠢・*: 縲御ｻ悶・遶ｯ譛ｫ縺ｧ譖ｴ譁ｰ縺輔ｌ縺ｾ縺励◆縲阪ム繧､繧｢繝ｭ繧ｰ 竊・蜀崎ｪｭ縺ｿ霎ｼ縺ｿ

### 謗｡逕ｨ譁ｹ蠑・

**Version 繧ｫ繝ｩ繝譁ｹ蠑・*・域耳螂ｨ・・

```sql
-- case_records 繝・・繝悶Ν縺ｫ version 繧ｫ繝ｩ繝繧定ｿｽ蜉
ALTER TABLE case_records ADD COLUMN version INT DEFAULT 1 NOT NULL;

-- 譖ｴ譁ｰ譎ゅ・繧ｯ繧ｨ繝ｪ
UPDATE case_records
SET 
  record_data = $1,
  version = version + 1,
  updated_at = NOW()
WHERE id = $2 AND version = $3
RETURNING *;
```

**蛻ｩ轤ｹ**:
- 笨・譏守､ｺ逧・↑繝舌・繧ｸ繝ｧ繝ｳ邂｡逅・
- 笨・`updated_at` 縺ｮ邊ｾ蠎ｦ縺ｫ萓晏ｭ倥＠縺ｪ縺・
- 笨・遶ｶ蜷域､懃衍縺檎｢ｺ螳・

**谺轤ｹ**:
- 笶・繧ｫ繝ｩ繝霑ｽ蜉縺悟ｿ・ｦ・ｼ医・繧､繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ・・

---

## 盗 螳溯｣・い繝ｼ繧ｭ繝・け繝√Ε

### 繝・・繧ｿ繝輔Ο繝ｼ

```
[繝輔Ο繝ｳ繝・ 繧ｱ繝ｼ繧ｹ險倬鹸繝壹・繧ｸ繧帝幕縺・
  竊・GET /api/case-records/list
[API] record_data + version 繧定ｿ斐☆
  竊・
[繝輔Ο繝ｳ繝・ 繝輔か繝ｼ繝邱ｨ髮・
  竊・
[繝輔Ο繝ｳ繝・ 菫晏ｭ倥・繧ｿ繝ｳ繧ｯ繝ｪ繝・け
  竊・POST /api/case-records/save { version: 3 }
[API] WHERE id = ? AND version = 3
  竊・
[DB] 譖ｴ譁ｰ謌仙粥・・莉ｶ・・竊・version = 4
  竊・200 OK
[繝輔Ο繝ｳ繝・ 縲御ｿ晏ｭ倥＠縺ｾ縺励◆縲阪ヨ繝ｼ繧ｹ繝・

--- 遶ｶ蜷育匱逕滓凾 ---

[繝輔Ο繝ｳ繝・ 菫晏ｭ倥・繧ｿ繝ｳ繧ｯ繝ｪ繝・け
  竊・POST /api/case-records/save { version: 3 }
[API] WHERE id = ? AND version = 3
  竊・
[DB] 譖ｴ譁ｰ螟ｱ謨暦ｼ・莉ｶ・俄・ 莉悶・遶ｯ譛ｫ縺・version = 4 縺ｫ譖ｴ譁ｰ貂・
  竊・409 Conflict
[繝輔Ο繝ｳ繝・ 縲御ｻ悶・遶ｯ譛ｫ縺ｧ譖ｴ譁ｰ縺輔ｌ縺ｾ縺励◆縲ょ・隱ｭ縺ｿ霎ｼ縺ｿ縺励※縺上□縺輔＞縲阪ム繧､繧｢繝ｭ繧ｰ
```

---

## 肌 螳溯｣・ｩｳ邏ｰ

### 1. 繝・・繧ｿ繝吶・繧ｹ繧ｹ繧ｭ繝ｼ繝・

**繝槭う繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ**: `supabase/migrations/YYYYMMDD_add_version_to_case_records.sql`

```sql
-- case_records 縺ｫ version 繧ｫ繝ｩ繝繧定ｿｽ蜉
ALTER TABLE case_records 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL;

-- 譌｢蟄倥Ξ繧ｳ繝ｼ繝峨・ version 繧・1 縺ｫ蛻晄悄蛹・
UPDATE case_records SET version = 1 WHERE version IS NULL;

-- updated_at 繝医Μ繧ｬ繝ｼ・・ersion 閾ｪ蜍輔う繝ｳ繧ｯ繝ｪ繝｡繝ｳ繝育畑縲√が繝励す繝ｧ繝ｳ・・
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_records_version_trigger
BEFORE UPDATE ON case_records
FOR EACH ROW
EXECUTE FUNCTION increment_version();
```

### 2. API 螳溯｣・ｼ・app/api/case-records/save/route.ts`・・

**譖ｴ譁ｰ繧ｯ繧ｨ繝ｪ**:

```typescript
// POST /api/case-records/save
export async function POST(req: NextRequest) {
  const { userId, serviceId, careReceiverName, date, record_data, recordTime, version } = await req.json()
  
  // version 縺檎┌縺・ｴ蜷医・譁ｰ隕丈ｽ懈・
  if (version === undefined) {
    // INSERT 蜃ｦ逅・ｼ域眠隕擾ｼ・
    const { data, error } = await supabase
      .from('case_records')
      .insert({ 
        user_id: userId, 
        service_id: serviceId, 
        date, 
        record_data, 
        record_time: recordTime,
        version: 1  // 蛻晄悄繝舌・繧ｸ繝ｧ繝ｳ
      })
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  }
  
  // 譌｢蟄倥Ξ繧ｳ繝ｼ繝峨・譖ｴ譁ｰ・域･ｽ隕ｳ逧・Ο繝・け・・
  const { data, error, count } = await supabase
    .from('case_records')
    .update({ 
      record_data, 
      record_time: recordTime,
      updated_at: new Date().toISOString()
      // version 縺ｯ 繝医Μ繧ｬ繝ｼ縺ｧ閾ｪ蜍輔う繝ｳ繧ｯ繝ｪ繝｡繝ｳ繝・
    })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('version', version)  // 柏 讌ｽ隕ｳ逧・Ο繝・け縺ｮ繧ｭ繝ｼ
    .select()
    .single()
  
  // 遶ｶ蜷域､懃衍
  if (count === 0 || !data) {
    return NextResponse.json(
      { 
        error: 'conflict', 
        message: '莉悶・遶ｯ譛ｫ縺ｧ譖ｴ譁ｰ縺輔ｌ縺ｦ縺・∪縺吶ょ・隱ｭ縺ｿ霎ｼ縺ｿ縺励※縺上□縺輔＞縲・ 
      }, 
      { status: 409 }  // 409 Conflict
    )
  }
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ ok: true, data })
}
```

### 3. 繝輔Ο繝ｳ繝医お繝ｳ繝牙ｮ溯｣・ｼ・src/components/case-records/CaseRecordFormClient.tsx`・・

**迥ｶ諷狗ｮ｡逅・*:

```typescript
const [currentVersion, setCurrentVersion] = useState<number>(1)
const [conflictDialogOpen, setConflictDialogOpen] = useState(false)

// 繝ｬ繧ｳ繝ｼ繝芽ｪｭ縺ｿ霎ｼ縺ｿ譎・
useEffect(() => {
  async function loadRecord() {
    const res = await fetch(`/api/case-records/list?userId=${userId}&date=${date}`)
    const data = await res.json()
    if (data.records?.[0]) {
      setCurrentVersion(data.records[0].version)  // version 繧剃ｿ晏ｭ・
      // ... 繝輔か繝ｼ繝縺ｫ螻暮幕
    }
  }
  loadRecord()
}, [userId, date])

// 菫晏ｭ伜・逅・
const handleSave = async () => {
  const res = await fetch('/api/case-records/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      date,
      record_data: formData,
      version: currentVersion  // 柏 迴ｾ蝨ｨ縺ｮ version 繧帝∽ｿ｡
    })
  })
  
  if (res.status === 409) {
    // 遶ｶ蜷育匱逕・竊・繝繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ
    setConflictDialogOpen(true)
    return
  }
  
  const result = await res.json()
  if (result.ok) {
    setCurrentVersion(result.data.version)  // 譁ｰ縺励＞ version 縺ｫ譖ｴ譁ｰ
    toast({ title: '笨・菫晏ｭ倥＠縺ｾ縺励◆' })
  }
}
```

**遶ｶ蜷医ム繧､繧｢繝ｭ繧ｰ**:

```tsx
<AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>笞・・莉悶・遶ｯ譛ｫ縺ｧ譖ｴ譁ｰ縺輔ｌ縺ｦ縺・∪縺・/AlertDialogTitle>
      <AlertDialogDescription>
        縺薙・繧ｱ繝ｼ繧ｹ險倬鹸縺ｯ縲∝挨縺ｮ遶ｯ譛ｫ縺ｾ縺溘・繧ｹ繧ｿ繝・ヵ縺ｫ繧医▲縺ｦ譖ｴ譁ｰ縺輔ｌ縺ｾ縺励◆縲・
        譛譁ｰ縺ｮ蜀・ｮｹ繧堤｢ｺ隱阪＠縺ｦ縺九ｉ縲∝・蠎ｦ邱ｨ髮・＠縺ｦ縺上□縺輔＞縲・
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>繧ｭ繝｣繝ｳ繧ｻ繝ｫ</AlertDialogCancel>
      <AlertDialogAction onClick={() => window.location.reload()}>
        蜀崎ｪｭ縺ｿ霎ｼ縺ｿ
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ｧｪ 繝・せ繝医す繝翫Μ繧ｪ

### 繧ｷ繝翫Μ繧ｪ 1: 蜷梧凾邱ｨ髮・ｼ育ｫｶ蜷育匱逕滂ｼ・

1. **繧ｹ繝槭・**: 繧ｱ繝ｼ繧ｹ險倬鹸・・T, 2026-01-28・峨ｒ髢九￥ 竊・version = 1
2. **PC**: 蜷後§繧ｱ繝ｼ繧ｹ險倬鹸繧帝幕縺・竊・version = 1
3. **繧ｹ繝槭・**: 縲御ｽ捺ｸｩ: 36.5邃・阪ｒ菫晏ｭ・竊・version = 2
4. **PC**: 縲悟ｙ閠・ 濶ｯ螂ｽ縲阪ｒ菫晏ｭ・竊・**409 Conflict**
5. **PC**: 繝繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ 竊・蜀崎ｪｭ縺ｿ霎ｼ縺ｿ 竊・version = 2 縺ｧ蜀咲ｷｨ髮・

**譛溷ｾ・ｵ先棡**:
- 笨・繧ｹ繝槭・縺ｮ螟画峩縺御ｿ晏ｭ倥＆繧後ｋ
- 笨・PC 縺ｧ遶ｶ蜷医ム繧､繧｢繝ｭ繧ｰ縺瑚｡ｨ遉ｺ縺輔ｌ繧・
- 笨・蜀崎ｪｭ縺ｿ霎ｼ縺ｿ蠕後√せ繝槭・縺ｮ螟画峩縺悟渚譏縺輔ｌ縺ｦ縺・ｋ

### 繧ｷ繝翫Μ繧ｪ 2: 鬆・ｬ｡邱ｨ髮・ｼ育ｫｶ蜷医↑縺暦ｼ・

1. **繧ｹ繝槭・**: 繧ｱ繝ｼ繧ｹ險倬鹸繧帝幕縺・竊・version = 1
2. **繧ｹ繝槭・**: 菫晏ｭ・竊・version = 2
3. **PC**: 繧ｱ繝ｼ繧ｹ險倬鹸繧帝幕縺・竊・version = 2
4. **PC**: 菫晏ｭ・竊・version = 3

**譛溷ｾ・ｵ先棡**:
- 笨・縺吶∋縺ｦ縺ｮ菫晏ｭ倥′謌仙粥
- 笨・遶ｶ蜷医ム繧､繧｢繝ｭ繧ｰ縺ｯ陦ｨ遉ｺ縺輔ｌ縺ｪ縺・

---

## 搭 螳溯｣・メ繧ｧ繝・け繝ｪ繧ｹ繝・

- [ ] `case_records` 縺ｫ `version` 繧ｫ繝ｩ繝霑ｽ蜉・医・繧､繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ・・
- [ ] API 縺ｧ `WHERE version = ?` 縺ｫ繧医ｋ譖ｴ譁ｰ螳溯｣・
- [ ] 0莉ｶ譖ｴ譁ｰ譎ゅ↓ 409 Conflict 繧定ｿ斐☆
- [ ] 繝輔Ο繝ｳ繝医〒 `version` 繧・state 邂｡逅・
- [ ] 菫晏ｭ俶凾縺ｫ `version` 繧帝∽ｿ｡
- [ ] 409 繧ｨ繝ｩ繝ｼ縺ｧ遶ｶ蜷医ム繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ
- [ ] 蜀崎ｪｭ縺ｿ霎ｼ縺ｿ讖溯・螳溯｣・
- [ ] 繝・せ繝医す繝翫Μ繧ｪ 1, 2 繧呈焔蜍輔ユ繧ｹ繝・

---

## 売 莉｣譖ｿ譯・ updated_at 縺ｫ繧医ｋ遶ｶ蜷域､懃衍

**Version 繧ｫ繝ｩ繝繧定ｿｽ蜉縺励◆縺上↑縺・ｴ蜷・*:

```typescript
// 隱ｭ縺ｿ霎ｼ縺ｿ譎・
const originalUpdatedAt = record.updated_at

// 菫晏ｭ俶凾
const { data, count } = await supabase
  .from('case_records')
  .update({ record_data, updated_at: new Date().toISOString() })
  .eq('id', recordId)
  .eq('updated_at', originalUpdatedAt)  // 柏 繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励〒遶ｶ蜷域､懃衍
  .select()

if (count === 0) {
  // 遶ｶ蜷育匱逕・
}
```

**豕ｨ諢冗せ**:
- 笞・・`updated_at` 縺ｮ邊ｾ蠎ｦ縺ｫ萓晏ｭ假ｼ・ostgreSQL 縺ｯ microsecond 邊ｾ蠎ｦ・・
- 笞・・繝医Μ繧ｬ繝ｼ縺ｧ閾ｪ蜍墓峩譁ｰ縺輔ｌ繧句ｴ蜷医∫ｫｶ蜷域､懃衍縺碁屮縺励＞
- 笨・Version 繧ｫ繝ｩ繝譁ｹ蠑上ｒ謗ｨ螂ｨ

---

## 答 蜿り・ｳ・侭

- **Optimistic Locking**: https://en.wikipedia.org/wiki/Optimistic_concurrency_control
- **Supabase Real-time**: https://supabase.com/docs/guides/realtime・亥ｰ・擂逧・↑諡｡蠑ｵ譯茨ｼ・
- **PostgreSQL Row Versioning**: https://www.postgresql.org/docs/current/mvcc-intro.html

---

**End of Document**  
*谺｡蝗樊峩譁ｰ: 讌ｽ隕ｳ逧・Ο繝・け螳溯｣・ｮ御ｺ・凾*

