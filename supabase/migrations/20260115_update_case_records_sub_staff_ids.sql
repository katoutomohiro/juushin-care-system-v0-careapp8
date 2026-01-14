-- =========================================
-- case_records: sub_staff_id を sub_staff_ids (uuid[]) に修正
-- =========================================

-- Step 1: Drop existing sub_staff_id column and constraints
ALTER TABLE case_records 
  DROP CONSTRAINT IF EXISTS fk_case_records_sub_staff;

ALTER TABLE case_records 
  DROP INDEX IF EXISTS idx_case_records_sub_staff;

ALTER TABLE case_records 
  DROP COLUMN IF EXISTS sub_staff_id;

-- Step 2: Add sub_staff_ids as array type
ALTER TABLE case_records 
  ADD COLUMN IF NOT EXISTS sub_staff_ids uuid[] DEFAULT '{}'::uuid[];

-- Step 3: Create index for sub_staff_ids array queries
CREATE INDEX IF NOT EXISTS idx_case_records_sub_staff_ids 
  ON case_records USING GIN (sub_staff_ids);

-- =========================================
-- Note: Foreign key constraints for array columns require trigger-based validation
-- We'll keep the constraint at the DB level through a CHECK constraint
-- =========================================

-- Create function to validate sub_staff_ids reference valid staff
CREATE OR REPLACE FUNCTION validate_sub_staff_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Check that all sub_staff_ids exist in staff table for the same service
  IF NEW.sub_staff_ids IS NOT NULL AND array_length(NEW.sub_staff_ids, 1) > 0 THEN
    IF EXISTS (
      SELECT 1 FROM (SELECT UNNEST(NEW.sub_staff_ids) as id) AS ids
      WHERE NOT EXISTS (
        SELECT 1 FROM staff WHERE staff.id = ids.id AND staff.service_id = NEW.service_id
      )
    ) THEN
      RAISE EXCEPTION 'Invalid sub_staff_ids: one or more IDs do not exist in staff table for this service';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate sub_staff_ids
DROP TRIGGER IF EXISTS trigger_validate_sub_staff_ids ON case_records;
CREATE TRIGGER trigger_validate_sub_staff_ids
  BEFORE INSERT OR UPDATE ON case_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_sub_staff_ids();
