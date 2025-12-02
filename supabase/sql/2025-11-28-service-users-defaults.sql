-- NOTE:
-- Supabase Studio の SQL Editor で 1 回だけ実行し、public.service_users テーブルを作成/更新するための DDL です。
-- 実行するプロジェクトは .env.local の NEXT_PUBLIC_SUPABASE_URL で指している Supabase 環境です（現在: https://avnjshakcbnxhdmetyni.supabase.co）。
-- これを実行しないと defaults API が 500 になります。
-- 実行後、API /api/service-users/[userId]/defaults から read/write できる前提になります。
create table if not exists public.service_users (
  user_id text primary key,
  name text not null,
  service_type text,
  default_main_staff_id text references public.staff_members(id),
  default_sub_staff_ids text[] null,
  default_service_start_time text,
  default_service_end_time text,
  default_total_service_minutes integer,
  default_day_service_am_start_time text,
  default_day_service_am_end_time text,
  default_day_service_pm_start_time text,
  default_day_service_pm_end_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Basic RLS (開発用途で全件許可。必要に応じて auth.uid() で絞り込んでください)
alter table if exists public.service_users enable row level security;
create policy if not exists "Service users select" on public.service_users for select using (true);
create policy if not exists "Service users insert" on public.service_users for insert with check (true);
create policy if not exists "Service users update" on public.service_users for update using (true) with check (true);
