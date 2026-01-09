-- Rename payload -> record_data in case_records, safely handling existing data
DO $$
BEGIN
  -- Ensure table exists
  IF to_regclass('public.case_records') IS NULL THEN
    RAISE NOTICE 'Table public.case_records does not exist. Skipping rename.';
  ELSE
    -- Check if payload column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'case_records'
        AND column_name = 'payload'
    ) THEN
      -- If record_data does not exist, simple rename
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'case_records'
          AND column_name = 'record_data'
      ) THEN
        ALTER TABLE public.case_records RENAME COLUMN payload TO record_data;
        RAISE NOTICE 'Renamed column payload -> record_data.';
      ELSE
        -- Both columns exist: migrate data, then drop payload
        UPDATE public.case_records
        SET record_data = COALESCE(record_data, payload)
        WHERE payload IS NOT NULL
          AND (record_data IS NULL OR record_data = '{}'::jsonb);
        ALTER TABLE public.case_records DROP COLUMN payload;
        RAISE NOTICE 'Merged payload into record_data and dropped payload column.';
      END IF;
    ELSE
      RAISE NOTICE 'Column payload not found. No changes.';
    END IF;
  END IF;
END $$;
