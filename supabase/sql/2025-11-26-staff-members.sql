-- Staff members table for case record assignments
-- NEXT_PUBLIC_SUPABASE_URL が指す Supabase プロジェクトの SQL Editor で一度だけ実行してください。
-- ケース記録・利用者デフォルト設定のスタッフ候補取得に必要です。
create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists staff_members_active_idx on public.staff_members (is_active);
