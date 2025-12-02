-- case_records テーブル作成 (MVP A・T 用、後に全利用者へ拡張)
-- NEXT_PUBLIC_SUPABASE_URL が指す Supabase プロジェクトの SQL Editor で一度だけ実行してください。
-- ケース記録保存・表示（Excel手入力含む）で使用します。
CREATE TABLE IF NOT EXISTS public.case_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- 既存ユーザーID (例: 'A・T')
  service_type text NOT NULL, -- 例: 'life-care'
  record_date date NOT NULL,
  section text NOT NULL, -- 例: 'vital', 'seizure', 'hydration', 'excretion', 'activity'
  item_key text NOT NULL, -- 例: 'bp', 'summary'
  item_value text, -- 整形済み表示テキスト
  source text NOT NULL DEFAULT 'daily-log', -- 'daily-log' | 'manual'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 重複アップサート用ユニーク制約 (1日/ユーザー/セクション/キー)
CREATE UNIQUE INDEX IF NOT EXISTS case_records_unique_idx
ON public.case_records (user_id, service_type, record_date, section, item_key);

-- RLS 有効化
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー (読み取り)
CREATE POLICY "Case records select by user" ON public.case_records
FOR SELECT USING (true); -- MVP: 後で auth.user_id と結びつけて絞り込み

-- RLS ポリシー (挿入/更新)
CREATE POLICY "Case records modify" ON public.case_records
FOR INSERT WITH CHECK (true);
CREATE POLICY "Case records update" ON public.case_records
FOR UPDATE USING (true) WITH CHECK (true);
