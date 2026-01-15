-- Seed data for care_receivers table
-- 24 care receivers: 14 for life-care service, 10 for after-school service
-- Each mapped to facility_id for RLS isolation

-- Life Care Service (14 receivers)
INSERT INTO public.care_receivers (code, name, facility_id, service_code, is_active)
SELECT code, name, (SELECT id FROM public.facilities WHERE slug = 'life-care'), 'life-care', true
FROM (
  VALUES
    ('AT_36M', 'AT'),
    ('IK_47F', 'IK'),
    ('OS_42M', 'OS'),
    ('SM_38F', 'SM'),
    ('TK_35M', 'TK'),
    ('NK_40M', 'NK'),
    ('MO_36F', 'MO'),
    ('YN_44M', 'YN'),
    ('HI_39M', 'HI'),
    ('RS_48F', 'RS'),
    ('TS_41M', 'TS'),
    ('US_48M', 'US'),
    ('IT_37M', 'IT'),
    ('KT_45F', 'KT')
) AS t(code, name)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  facility_id = (SELECT id FROM public.facilities WHERE slug = 'life-care'),
  service_code = 'life-care',
  is_active = true,
  updated_at = now();

-- After-School Service (10 receivers)
INSERT INTO public.care_receivers (code, name, facility_id, service_code, is_active)
SELECT code, name, (SELECT id FROM public.facilities WHERE slug = 'after-school'), 'after-school', true
FROM (
  VALUES
    ('AK_12M', 'AK'),
    ('BM_14F', 'BM'),
    ('CM_11M', 'CM'),
    ('DN_15M', 'DN'),
    ('EO_13F', 'EO'),
    ('FP_16M', 'FP'),
    ('GQ_10M', 'GQ'),
    ('HR_17F', 'HR'),
    ('IS_12F', 'IS'),
    ('JT_14M', 'JT')
) AS t(code, name)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  facility_id = (SELECT id FROM public.facilities WHERE slug = 'after-school'),
  updated_at = now();
