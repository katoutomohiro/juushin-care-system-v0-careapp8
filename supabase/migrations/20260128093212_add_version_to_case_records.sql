-- Add version column to case_records for optimistic locking
-- Migration: 20260128093212_add_version_to_case_records

-- 1. Add version column with default value 1
ALTER TABLE case_records 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL;

-- 2. Initialize version for existing records
UPDATE case_records 
SET version = 1 
WHERE version IS NULL;

-- 3. Create function to auto-increment version on update
CREATE OR REPLACE FUNCTION increment_case_record_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if record_data or other fields changed
  IF NEW.record_data IS DISTINCT FROM OLD.record_data OR
     NEW.record_time IS DISTINCT FROM OLD.record_time THEN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-increment version
DROP TRIGGER IF EXISTS case_records_version_trigger ON case_records;
CREATE TRIGGER case_records_version_trigger
  BEFORE UPDATE ON case_records
  FOR EACH ROW
  EXECUTE FUNCTION increment_case_record_version();

-- 5. Add index on version for performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_case_records_version 
ON case_records(user_id, date, version);

-- 6. Add comment for documentation
COMMENT ON COLUMN case_records.version IS 'Optimistic locking version number. Auto-incremented on each update to prevent concurrent modification conflicts.';
