-- 20260109_rename_payload_to_record_data.sql
DO $$ BEGIN
  -- Rename payload to record_data when payload exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'case_records' AND column_name = 'payload'
  ) THEN
    ALTER TABLE public.case_records
      RENAME COLUMN payload TO record_data;
  END IF;

  -- Normalize record_data type and defaults
  ALTER TABLE public.case_records
    ALTER COLUMN record_data TYPE jsonb USING record_data::jsonb,
    ALTER COLUMN record_data SET DEFAULT '{}'::jsonb,
    ALTER COLUMN record_data SET NOT NULL;
END $$;
