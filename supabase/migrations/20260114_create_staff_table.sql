-- =========================================
-- 職員マスタテーブル作成
-- =========================================

-- Step 1: Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Foreign key to services table
  CONSTRAINT fk_staff_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  
  -- Unique constraint: same name cannot exist twice in the same service
  CONSTRAINT uq_staff_service_name UNIQUE (service_id, name)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_staff_service_active 
  ON staff(service_id, is_active, sort_order);

-- Trigger function for updated_at auto-update
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_staff_updated_at ON staff;
CREATE TRIGGER trigger_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- RLS policies: Allow read access to all authenticated users
CREATE POLICY "Authenticated users can view staff"
  ON staff
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS policies: Only admins can insert/update/delete staff
CREATE POLICY "Admins can manage staff"
  ON staff
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- =========================================
-- case_records テーブルに職員ID列を追加
-- =========================================

-- Step 2: Add staff columns to case_records (NULL allowed for migration)
ALTER TABLE case_records 
  ADD COLUMN IF NOT EXISTS main_staff_id uuid;

ALTER TABLE case_records 
  ADD COLUMN IF NOT EXISTS sub_staff_id uuid;

-- Add foreign key constraints
ALTER TABLE case_records 
  ADD CONSTRAINT fk_case_records_main_staff 
  FOREIGN KEY (main_staff_id) REFERENCES staff(id) ON DELETE SET NULL;

ALTER TABLE case_records 
  ADD CONSTRAINT fk_case_records_sub_staff 
  FOREIGN KEY (sub_staff_id) REFERENCES staff(id) ON DELETE SET NULL;

-- Create index for staff queries
CREATE INDEX IF NOT EXISTS idx_case_records_main_staff 
  ON case_records(main_staff_id);

CREATE INDEX IF NOT EXISTS idx_case_records_sub_staff 
  ON case_records(sub_staff_id);

-- =========================================
-- 13人の職員データをシード（仮のサービスID使用）
-- =========================================

-- Note: Replace 'YOUR_SERVICE_UUID' with actual service_id from services table
-- Example: SELECT id FROM services WHERE slug = 'life-care' LIMIT 1;

DO $$
DECLARE
  default_service_id uuid;
BEGIN
  -- Get the first service ID (adjust this query based on your needs)
  SELECT id INTO default_service_id FROM services LIMIT 1;
  
  -- If no service exists, create a default one
  IF default_service_id IS NULL THEN
    INSERT INTO services (id, name, slug)
    VALUES (gen_random_uuid(), 'デフォルトサービス', 'default-service')
    RETURNING id INTO default_service_id;
  END IF;
  
  -- Insert 13 staff members
  INSERT INTO staff (id, service_id, name, sort_order, is_active) VALUES
    (gen_random_uuid(), default_service_id, '山田 太郎', 1, true),
    (gen_random_uuid(), default_service_id, '佐藤 花子', 2, true),
    (gen_random_uuid(), default_service_id, '鈴木 一郎', 3, true),
    (gen_random_uuid(), default_service_id, '田中 美咲', 4, true),
    (gen_random_uuid(), default_service_id, '伊藤 健太', 5, true),
    (gen_random_uuid(), default_service_id, '渡辺 由美', 6, true),
    (gen_random_uuid(), default_service_id, '高橋 大輔', 7, true),
    (gen_random_uuid(), default_service_id, '中村 真理', 8, true),
    (gen_random_uuid(), default_service_id, '小林 孝夫', 9, true),
    (gen_random_uuid(), default_service_id, '加藤 麻衣', 10, true),
    (gen_random_uuid(), default_service_id, '吉田 和也', 11, true),
    (gen_random_uuid(), default_service_id, '山本 奈々', 12, true),
    (gen_random_uuid(), default_service_id, '佐々木 翔', 13, true)
  ON CONFLICT (service_id, name) DO NOTHING;
END $$;

-- =========================================
-- Migration completion notes
-- =========================================

-- After data migration is complete, run the following to make main_staff_id NOT NULL:
-- ALTER TABLE case_records ALTER COLUMN main_staff_id SET NOT NULL;

-- To verify the migration:
-- SELECT COUNT(*) FROM staff;
-- SELECT COUNT(*), COUNT(main_staff_id) FROM case_records;
