-- enable RLS
alter table public.seizures enable row level security;

-- clean up (存在する場合のみドロップ)
drop policy if exists "select_own" on public.seizures;
drop policy if exists "read_by_role" on public.seizures;
drop policy if exists "insert_own" on public.seizures;

-- 本人の閲覧（reporter_id に統一）
create policy "select_own"
on public.seizures
for select
to authenticated
using ( auth.uid() = reporter_id );

-- 役割ベースの閲覧（任意：nurse / admin）
create policy "read_by_role"
on public.seizures
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('nurse','admin')
  )
);

-- 本人の作成（reporter_id=auth.uid()）
create policy "insert_own"
on public.seizures
for insert
to authenticated
with check ( auth.uid() = reporter_id );
