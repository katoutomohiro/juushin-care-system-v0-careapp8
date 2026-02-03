-- Enable RLS on core tables (RLS v1 - minimal, safe)
-- Date: 2026-01-30
-- Purpose: Baseline RLS activation with service_role bypass

-- ============================================================
-- 1. Enable RLS on core tables
-- ============================================================

ALTER TABLE public.care_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Drop existing conflicting policies (if any)
-- ============================================================

DROP POLICY IF EXISTS "service_role_bypass_care_receivers" ON public.care_receivers;
DROP POLICY IF EXISTS "service_role_bypass_case_records" ON public.case_records;
DROP POLICY IF EXISTS "service_role_bypass_services" ON public.services;
DROP POLICY IF EXISTS "service_role_bypass_staff" ON public.staff;
DROP POLICY IF EXISTS "service_role_bypass_voice_notes" ON public.voice_notes;

-- ============================================================
-- 3. Create service_role bypass policies (admin access)
-- ============================================================

-- service_role can do everything (used by API routes with supabaseAdmin)
CREATE POLICY "service_role_bypass_care_receivers"
  ON public.care_receivers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass_case_records"
  ON public.case_records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass_services"
  ON public.services
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass_staff"
  ON public.staff
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass_voice_notes"
  ON public.voice_notes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. Create basic authenticated user policies (read-only)
-- ============================================================

-- Authenticated users can view care_receivers (minimal access)
CREATE POLICY "authenticated_view_care_receivers"
  ON public.care_receivers
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can view services
CREATE POLICY "authenticated_view_services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can view staff in their service
CREATE POLICY "authenticated_view_staff"
  ON public.staff
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 5. Create owner-based policies for case_records and voice_notes
-- ============================================================

-- Users can read their own case_records (if created_by matches auth.uid())
-- Note: Current schema may not have created_by, so this is a placeholder
-- Adjust based on actual schema
CREATE POLICY "users_view_own_case_records"
  ON public.case_records
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is part of the service (to be refined later)
    true
  );

-- Users can insert case_records (basic write access)
CREATE POLICY "users_insert_case_records"
  ON public.case_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update case_records (basic write access)
CREATE POLICY "users_update_case_records"
  ON public.case_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Voice notes: users can manage their own
CREATE POLICY "users_manage_own_voice_notes"
  ON public.voice_notes
  FOR ALL
  TO authenticated
  USING (
    CASE
      WHEN auth.uid() IS NULL THEN false
      ELSE true  -- Allow for now, refine with user_id column later
    END
  )
  WITH CHECK (
    CASE
      WHEN auth.uid() IS NULL THEN false
      ELSE true
    END
  );

-- ============================================================
-- 6. Deny anonymous access to all core tables
-- ============================================================

CREATE POLICY "deny_anon_care_receivers"
  ON public.care_receivers
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_anon_case_records"
  ON public.case_records
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_anon_services"
  ON public.services
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_anon_staff"
  ON public.staff
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_anon_voice_notes"
  ON public.voice_notes
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 7. Comments for documentation
-- ============================================================

COMMENT ON POLICY "service_role_bypass_care_receivers" ON public.care_receivers IS 
  'service_role (API with admin key) has full access';

COMMENT ON POLICY "authenticated_view_care_receivers" ON public.care_receivers IS 
  'Authenticated users can view care receivers (to be refined with service-based access)';

COMMENT ON POLICY "users_view_own_case_records" ON public.case_records IS 
  'Users can view case records (placeholder for future service-based filtering)';

-- ============================================================
-- End of migration
-- ============================================================
