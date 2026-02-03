-- Add care_receiver_id to case_records and tighten RLS for server-side writes
ALTER TABLE public.case_records
  ADD COLUMN IF NOT EXISTS care_receiver_id uuid;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'case_records_care_receiver_fk'
      AND conrelid = 'public.case_records'::regclass
  ) THEN
    ALTER TABLE public.case_records
      ADD CONSTRAINT case_records_care_receiver_fk
      FOREIGN KEY (care_receiver_id)
      REFERENCES public.care_receivers(id);
  END IF;
END $$;

ALTER TABLE public.case_records
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own case records" ON public.case_records;
DROP POLICY IF EXISTS "Users can insert their own case records" ON public.case_records;
DROP POLICY IF EXISTS "Users can update their own case records" ON public.case_records;
DROP POLICY IF EXISTS "Admins can do everything" ON public.case_records;
