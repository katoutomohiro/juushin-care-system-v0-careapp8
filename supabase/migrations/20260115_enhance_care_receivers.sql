-- Enhance care_receivers table with additional required columns
-- This adds: display_name (user-facing name), age, gender, care_level, condition, medical_care

-- Add missing columns if they don't exist
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS age int,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS care_level int,
ADD COLUMN IF NOT EXISTS condition text,
ADD COLUMN IF NOT EXISTS medical_care text;

-- Update service_id to use text instead of uuid for easier management
-- Note: If service_id is already uuid type, we'll handle it separately
-- For now, add a text-based service_code column for flexibility
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS service_code text NOT NULL DEFAULT 'life-care';

-- Create index on service_code for efficient filtering
CREATE INDEX IF NOT EXISTS idx_care_receivers_service_code 
  ON public.care_receivers(service_code);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.care_receivers ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.care_receivers;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.care_receivers;
DROP POLICY IF EXISTS "Allow admin operations" ON public.care_receivers;

-- Create RLS policies (development: open read, restricted write for now)
CREATE POLICY "Allow read for authenticated users"
  ON public.care_receivers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow write for authenticated users"
  ON public.care_receivers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
  ON public.care_receivers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_care_receivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_care_receivers_updated_at ON public.care_receivers;

CREATE TRIGGER trigger_care_receivers_updated_at
  BEFORE UPDATE ON public.care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_care_receivers_updated_at();
