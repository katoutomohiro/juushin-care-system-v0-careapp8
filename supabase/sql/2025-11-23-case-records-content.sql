-- Add structured JSON content for case records (A.T 用 MVP)
-- NEXT_PUBLIC_SUPABASE_URL が指す Supabase プロジェクトの SQL Editor で一度だけ実行してください。
-- ケース記録の content 列追加とインデックス付与に必要です。
ALTER TABLE public.case_records
ADD COLUMN IF NOT EXISTS content JSONB,
ADD COLUMN IF NOT EXISTS template TEXT;

-- Optional index to quickly pick the structured row per date
CREATE INDEX IF NOT EXISTS case_records_section_content_idx
  ON public.case_records (user_id, service_type, record_date)
  WHERE section = 'content';
