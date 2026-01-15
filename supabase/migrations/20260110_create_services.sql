-- Create services table for service lookups
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text
);

INSERT INTO public.services (slug, name)
VALUES 
  ('life-care', '生活介護'),
  ('after-school', '放課後等デイサービス')
ON CONFLICT (slug) DO NOTHING;
