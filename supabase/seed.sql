-- Seed data for care_receivers table
-- 24 care receivers: 14 for life-care service, 10 for after-school service
-- Data from ���Ə����ibusiness operation data�j

-- Service UUIDs will be looked up from services table
-- Services must be created before seeding care_receivers

-- Truncate existing data if needed (comment out to preserve)
-- DELETE FROM public.care_receivers;

-- Life Care Service (14 receivers)
-- Based on provided business data: �������14��
INSERT INTO public.care_receivers (code, name, service_id)
SELECT code, name, (SELECT id FROM services WHERE slug = 'life-care')
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
  service_id = (SELECT id FROM services WHERE slug = 'life-care'),
  updated_at = now();

-- After-School Service (10 receivers)
-- Based on provided business data: ���ی㓙�f�C�T�[�r�X10��
INSERT INTO public.care_receivers (code, name, service_id)
SELECT code, name, (SELECT id FROM services WHERE slug = 'after-school')
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
  service_id = (SELECT id FROM services WHERE slug = 'after-school'),
  updated_at = now();
