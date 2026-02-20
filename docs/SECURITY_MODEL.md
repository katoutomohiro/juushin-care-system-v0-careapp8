# Initialized

## RLS Report Endpoint
GET /api/security/rls-report
(migration scan only, no DB access)

## AuditEvent Table (DDL Example - Documentation Only)

```sql
create table public.audit_events (
  id uuid primary key,
  actor_id uuid,
  service_id uuid not null,
  target_type text not null,
  target_id uuid,
  action text not null,
  changed_fields jsonb,
  before_hash text,
  after_hash text,
  prev_event_hash text,
  event_hash text,
  created_at timestamptz not null default now()
);
```
