-- Structured case_records schema (idempotent). Run in Supabase SQL Editor for the project in .env.local.
create extension if not exists "pgcrypto";

-- Base table (keeps legacy columns for compatibility while adding structured fields).
create table if not exists public.case_records (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  service_type text not null,
  record_date date not null,
  section text not null default 'structured',
  item_key text not null default 'root',
  item_value text,
  source text not null default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.case_records add column if not exists start_time time;
alter table public.case_records add column if not exists end_time time;
alter table public.case_records add column if not exists category text;
alter table public.case_records add column if not exists summary text;
alter table public.case_records add column if not exists details jsonb not null default '{}'::jsonb;
alter table public.case_records add column if not exists created_by text;

-- Unique per user/service/day for structured entries.
create unique index if not exists case_records_structured_unique_idx
  on public.case_records (user_id, service_type, record_date, section, item_key);

-- Helpful index for recent fetches.
create index if not exists case_records_recent_idx on public.case_records (user_id, created_at desc);

-- RLS (adjust as needed; currently open to allow server key usage and future auth wiring).
alter table public.case_records enable row level security;
create policy if not exists "case_records_select_all" on public.case_records for select using (true);
create policy if not exists "case_records_insert_all" on public.case_records for insert with check (true);
create policy if not exists "case_records_update_all" on public.case_records for update using (true) with check (true);
