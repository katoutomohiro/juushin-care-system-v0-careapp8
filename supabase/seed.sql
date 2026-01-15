-- Seed data for care_receivers table
-- 24 care receivers: 14 for life-care (age >= 18), 10 for after-school (age < 18)
-- Data from 事業所情報（business operation data）

-- Truncate existing data (comment out if you want to preserve existing records)
-- DELETE FROM public.care_receivers;

-- Life Care Service (14 receivers, age >= 18)
-- Based on provided business data: 生活介護14名
INSERT INTO public.care_receivers (code, display_name, age, gender, service_code, care_level, condition, medical_care)
VALUES
  ('AT_36M', 'A・T', 36, 'male', 'life-care', 4, '脳性麻痺、てんかん、遠視性弱視、側湾症、両上下肢機能障害', 'なし'),
  ('IK_47F', 'I・K', 47, 'female', 'life-care', 4, '脳性麻痺、側湾症、体幹四肢機能障害', 'なし'),
  ('OS_42M', 'O・S', 42, 'male', 'life-care', 4, '脳性麻痺、知的障害、てんかん、両上下肢機能障害', 'なし'),
  ('SM_38F', 'S・M', 38, 'female', 'life-care', 4, '脳性麻痺、知的障害、てんかん、両上下肢機能障害', 'なし'),
  ('TK_35M', 'T・K', 35, 'male', 'life-care', 4, '脳性麻痺、知的障害、両上下肢機能障害', 'なし'),
  ('NK_40M', 'N・K', 40, 'male', 'life-care', 4, '脳性麻痺、視覚障害、運動機能障害', 'てんかん薬'),
  ('MO_36F', 'M・O', 36, 'female', 'life-care', 4, '脳性麻痺、知的障害、コミュニケーション困難', 'なし'),
  ('YN_44M', 'Y・N', 44, 'male', 'life-care', 4, '脳性麻痺、側湾症、呼吸機能低下', 'なし'),
  ('HI_39M', 'H・I', 39, 'male', 'life-care', 4, '脳性麻痺、運動機能障害、排泄管理必要', 'なし'),
  ('RS_48F', 'R・S', 48, 'female', 'life-care', 4, '脳性麻痺、知的障害、経管栄養', 'なし'),
  ('TS_41M', 'T・S', 41, 'male', 'life-care', 4, '脳性麻痺、てんかん、自動運動困難', 'てんかん薬'),
  ('US_48M', 'U・S', 48, 'male', 'life-care', 4, '脳性麻痺、知的障害、てんかん、両上下肢機能障害', 'なし'),
  ('IT_37M', 'I・T', 37, 'male', 'life-care', 4, '脳性麻痺、知的障害、てんかん、両上下肢機能障害', 'なし'),
  ('KT_45F', 'K・T', 45, 'female', 'life-care', 4, '脳性麻痺、側湾症、移動支援必要', 'なし')
ON CONFLICT (code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  age = EXCLUDED.age,
  gender = EXCLUDED.gender,
  service_code = EXCLUDED.service_code,
  care_level = EXCLUDED.care_level,
  condition = EXCLUDED.condition,
  medical_care = EXCLUDED.medical_care,
  updated_at = now();

-- After-School Service (10 receivers, age < 18)
-- Based on provided business data: 放課後等デイサービス10名
INSERT INTO public.care_receivers (code, display_name, age, gender, service_code, care_level, condition, medical_care)
VALUES
  ('AK_12M', 'A・K', 12, 'male', 'after-school', 3, '脳性麻痺、学習支援必要、運動機能障害', 'なし'),
  ('BM_14F', 'B・M', 14, 'female', 'after-school', 3, '発達障害、学習困難、コミュニケーション支援', 'なし'),
  ('CM_11M', 'C・M', 11, 'male', 'after-school', 3, '脳性麻痺、動作支援必要', 'なし'),
  ('DN_15M', 'D・N', 15, 'male', 'after-school', 4, '脳性麻痺、てんかん、学習支援', 'てんかん薬'),
  ('EO_13F', 'E・O', 13, 'female', 'after-school', 2, '発達障害、学習支援、行動支援', 'なし'),
  ('FP_16M', 'F・P', 16, 'male', 'after-school', 3, '脳性麻痺、知的障害、運動機能障害', 'なし'),
  ('GQ_10M', 'G・Q', 10, 'male', 'after-school', 2, '学習支援必要、社会性育成中', 'なし'),
  ('HR_17F', 'H・R', 17, 'female', 'after-school', 3, '脳性麻痺、運動機能障害、進路支援', 'なし'),
  ('IS_12F', 'I・S', 12, 'female', 'after-school', 2, '発達障害、学習支援、友人関係構築支援', 'なし'),
  ('JT_14M', 'J・T', 14, 'male', 'after-school', 3, '脳性麻痺、てんかん、行動支援', 'てんかん薬')
ON CONFLICT (code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  age = EXCLUDED.age,
  gender = EXCLUDED.gender,
  service_code = EXCLUDED.service_code,
  care_level = EXCLUDED.care_level,
  condition = EXCLUDED.condition,
  medical_care = EXCLUDED.medical_care,
  updated_at = now();
