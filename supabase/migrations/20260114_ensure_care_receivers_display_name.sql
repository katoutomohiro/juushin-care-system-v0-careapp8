-- Create care_receivers table if not exists
-- This table stores care receiver (利用者) information
CREATE TABLE IF NOT EXISTS public.care_receivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,  -- Internal short code (e.g., "AT", "IK")
  name text,                   -- Display name for UI
  service_id uuid REFERENCES public.services(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_care_receivers_code ON public.care_receivers(code);
CREATE INDEX IF NOT EXISTS idx_care_receivers_service_id ON public.care_receivers(service_id);
