-- Create case_records table
CREATE TABLE IF NOT EXISTS case_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text NOT NULL,
  user_id text NOT NULL,
  record_date date NOT NULL,
  record_time time NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(service_id, user_id, record_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_case_records_service_user_date 
  ON case_records(service_id, user_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_case_records_user_date 
  ON case_records(user_id, record_date DESC);

-- Create trigger function for updated_at auto-update
CREATE OR REPLACE FUNCTION update_case_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_case_records_updated_at ON case_records;
CREATE TRIGGER trigger_case_records_updated_at
  BEFORE UPDATE ON case_records
  FOR EACH ROW
  EXECUTE FUNCTION update_case_records_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE case_records ENABLE ROW LEVEL SECURITY;

-- RLS policies (adjust based on your auth model)
CREATE POLICY "Users can view their own case records"
  ON case_records
  FOR SELECT
  USING (auth.uid()::text = user_id OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert their own case records"
  ON case_records
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own case records"
  ON case_records
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins can do everything"
  ON case_records
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));
