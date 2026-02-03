-- Consolidate care_receivers schema
-- Remove display_name (unused, always empty)
-- Ensure service_code is populated from services.slug
-- Add is_active for logical deletion

-- Drop display_name column (unused)
ALTER TABLE IF EXISTS public.care_receivers
DROP COLUMN IF EXISTS display_name CASCADE;

-- Add is_active for logical deletion (default true)
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_care_receivers_is_active 
  ON public.care_receivers(is_active);

-- Update service_code from service_id's slug (one-time data sync)
UPDATE public.care_receivers cr
SET service_code = s.slug
FROM public.services s
WHERE cr.service_id = s.id AND cr.service_code = 'life-care';  -- Only update if still default

-- Create composite index on service_code + is_active for common queries
CREATE INDEX IF NOT EXISTS idx_care_receivers_service_code_active 
  ON public.care_receivers(service_code, is_active);
