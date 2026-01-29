-- Add role column foundation for staff_profiles (admin|nurse|staff)
-- Minimal change: align role check constraint and defaults

ALTER TABLE IF EXISTS public.staff_profiles
  ADD COLUMN IF NOT EXISTS role text;

ALTER TABLE IF EXISTS public.staff_profiles
  ALTER COLUMN role SET DEFAULT 'staff';

ALTER TABLE IF EXISTS public.staff_profiles
  DROP CONSTRAINT IF EXISTS staff_profiles_role_check;

ALTER TABLE IF EXISTS public.staff_profiles
  ADD CONSTRAINT staff_profiles_role_check
  CHECK (role IN ('admin', 'nurse', 'staff'));

-- Normalize legacy roles
UPDATE public.staff_profiles
SET role = 'staff'
WHERE role IS NULL OR role NOT IN ('admin', 'nurse', 'staff');
