-- Facility-based Row Level Security (RLS) Implementation
-- Enables multi-tenant support: each facility isolates its own data
-- Auth + RLS: users can only access their facility's records

-- Step 1: Rename/alias services -> facilities (keep backward compatibility)
-- In practice, 'services' acts as 'facilities' with slug as tenant identifier
ALTER TABLE IF EXISTS public.services 
  RENAME TO facilities;

-- Recreate facilities if it was renamed
CREATE TABLE IF NOT EXISTS public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.facilities (slug, name)
VALUES 
  ('life-care', '生活介護'),
  ('after-school', '放課後等デイサービス')
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Create/alter staff_profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id),
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'viewer')),
  display_name text NOT NULL,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Composite index for fast facility lookups
CREATE INDEX IF NOT EXISTS idx_staff_profiles_facility_id 
  ON public.staff_profiles(facility_id);

-- Step 3: Add facility_id to care_receivers if not exists
ALTER TABLE IF EXISTS public.care_receivers
  ADD COLUMN IF NOT EXISTS facility_id uuid REFERENCES public.facilities(id);

-- Migrate existing care_receivers to facility (map by service_code)
UPDATE public.care_receivers cr
SET facility_id = f.id
FROM public.facilities f
WHERE cr.facility_id IS NULL 
  AND cr.service_code = f.slug;

-- Make facility_id NOT NULL after migration
ALTER TABLE public.care_receivers
  ALTER COLUMN facility_id SET NOT NULL;

-- Create index for facility filtering
CREATE INDEX IF NOT EXISTS idx_care_receivers_facility_id
  ON public.care_receivers(facility_id);

-- Step 4: Add facility_id to case_records if not exists
ALTER TABLE IF EXISTS public.case_records
  ADD COLUMN IF NOT EXISTS facility_id uuid REFERENCES public.facilities(id);

-- Migrate existing case_records to facility (map via care_receiver)
UPDATE public.case_records cr_records
SET facility_id = cr.facility_id
FROM public.care_receivers cr
WHERE cr_records.facility_id IS NULL 
  AND cr_records.care_receiver_id = cr.id;

-- Make facility_id NOT NULL after migration
ALTER TABLE public.case_records
  ALTER COLUMN facility_id SET NOT NULL;

-- Create index for facility filtering
CREATE INDEX IF NOT EXISTS idx_case_records_facility_id
  ON public.case_records(facility_id);

-- Step 5: Helper function to get current user's facility_id
-- Used in RLS policies to ensure users can only access their facility data
CREATE OR REPLACE FUNCTION public.get_current_facility_id()
RETURNS uuid AS $$
  SELECT facility_id FROM public.staff_profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Step 6: Enable Row Level Security
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies for facilities table
-- Users can see their own facility only
CREATE POLICY facilities_select_own 
  ON public.facilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.facility_id = facilities.id 
        AND sp.id = auth.uid()
    )
  );

-- Step 8: RLS Policies for staff_profiles table
-- Each staff can read their own profile
CREATE POLICY staff_profiles_select_self
  ON public.staff_profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read/update all staff in their facility
CREATE POLICY staff_profiles_select_admin
  ON public.staff_profiles FOR SELECT
  USING (
    facility_id = public.get_current_facility_id()
    AND (
      SELECT role FROM public.staff_profiles WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY staff_profiles_update_admin
  ON public.staff_profiles FOR UPDATE
  USING (
    facility_id = public.get_current_facility_id()
    AND (
      SELECT role FROM public.staff_profiles WHERE id = auth.uid()
    ) = 'admin'
  );

-- Step 9: RLS Policies for care_receivers table
-- Users can only SELECT care_receivers from their facility
CREATE POLICY care_receivers_select
  ON public.care_receivers FOR SELECT
  USING (facility_id = public.get_current_facility_id());

-- Users can only INSERT care_receivers to their facility
-- facility_id is enforced from current user's profile (anti-spoofing)
CREATE POLICY care_receivers_insert
  ON public.care_receivers FOR INSERT
  WITH CHECK (facility_id = public.get_current_facility_id());

-- Users can only UPDATE care_receivers in their facility
CREATE POLICY care_receivers_update
  ON public.care_receivers FOR UPDATE
  USING (facility_id = public.get_current_facility_id())
  WITH CHECK (facility_id = public.get_current_facility_id());

-- Users can only DELETE care_receivers in their facility
CREATE POLICY care_receivers_delete
  ON public.care_receivers FOR DELETE
  USING (facility_id = public.get_current_facility_id());

-- Step 10: RLS Policies for case_records table
-- Users can only SELECT case_records from their facility
CREATE POLICY case_records_select
  ON public.case_records FOR SELECT
  USING (facility_id = public.get_current_facility_id());

-- Users can only INSERT case_records to their facility
-- Enforce facility_id from current user (anti-spoofing)
CREATE POLICY case_records_insert
  ON public.case_records FOR INSERT
  WITH CHECK (facility_id = public.get_current_facility_id());

-- Users can only UPDATE case_records in their facility
CREATE POLICY case_records_update
  ON public.case_records FOR UPDATE
  USING (facility_id = public.get_current_facility_id())
  WITH CHECK (facility_id = public.get_current_facility_id());

-- Users can only DELETE case_records in their facility
CREATE POLICY case_records_delete
  ON public.case_records FOR DELETE
  USING (facility_id = public.get_current_facility_id());

-- Audit: Log RLS policies applied
COMMENT ON TABLE public.facilities IS 'Multi-tenant facility/service master. Each row = 1 organization.';
COMMENT ON TABLE public.staff_profiles IS 'Linked to auth.users(id). facility_id enforces tenant isolation. RLS: users see self + admins see all in facility.';
COMMENT ON TABLE public.care_receivers IS 'Care recipients. RLS: users can only CRUD records where facility_id matches their own.';
COMMENT ON TABLE public.case_records IS 'Care case records. RLS: users can only CRUD records where facility_id matches their own.';
COMMENT ON FUNCTION public.get_current_facility_id() IS 'Returns auth.uid()'' facility_id. Used in all RLS policies.';
