-- Idempotent offline outbox processing receipts
create extension if not exists "uuid-ossp";

create table if not exists public.offline_op_receipts (
  op_id uuid primary key,
  device_id text not null,
  user_id text not null,
  kind text not null,
  payload_hash text not null,
  status text not null default 'processing',
  result jsonb null,
  error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offline_op_receipts_user_created_at_idx
  on public.offline_op_receipts (user_id, created_at desc);

create or replace function public.offline_op_receipts_set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists offline_op_receipts_set_updated_at on public.offline_op_receipts;
create trigger offline_op_receipts_set_updated_at
before update on public.offline_op_receipts
for each row execute procedure public.offline_op_receipts_set_updated_at();

-- Request-level idempotency cache
create table if not exists public.api_idempotency_keys (
  key text primary key,
  request_hash text not null,
  response jsonb null,
  status integer null,
  created_at timestamptz not null default now()
);
