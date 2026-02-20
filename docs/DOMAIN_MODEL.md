# DOMAIN_MODEL

## Canonical Tenant Key
- **Canonical**: `service_id` (per SECURITY_MODEL.md)
- **Current reality**: 
  - `service_id` exists in: `care_receivers`, `staff`, `case_records` (text type initially, later migrated)
  - `facility_id` exists in: `care_receivers`, `case_records`, `staff_profiles` (added in 20260117 migration)
  - Schema inconsistency: tables have both `service_id` and `facility_id` due to ongoing migration (services renamed to facilities)

## Tables

### care_receivers
- **Columns**:
  - `id` uuid PRIMARY KEY (default: gen_random_uuid())
  - `code` text UNIQUE NOT NULL (internal short code, e.g., "AT", "IK")
  - `name` text (display name for UI - deprecated)
  - `display_name` text NOT NULL (default: '') [added in 20260128]
  - `full_name` text [added in 20260128] (実名、個人情報)
  - `birthday` date [added in 20260128]
  - `address` text [added in 20260128] (個人情報)
  - `phone` text [added in 20260128] (個人情報)
  - `emergency_contact` text [added in 20260128] (個人情報)
  - `notes` text [added in 20260128]
  - `medical_care_detail` jsonb [added in 20260128] (医療的ケア詳細)
  - `version` int NOT NULL DEFAULT 1 [added in 20260128] (optimistic locking)
  - `updated_by` uuid [added in 20260128] (editor tracking)
  - `service_id` uuid REFERENCES public.services(id)
  - `facility_id` uuid NOT NULL REFERENCES public.facilities(id) [added in 20260117]
  - `created_at` timestamptz (default: now())
  - `updated_at` timestamptz (default: now())
- **Keys**:
  - PK: id
  - FK: service_id → services(id)
  - FK: facility_id → facilities(id)
- **Tenant fields**: Both `service_id` and `facility_id` (inconsistency)
- **Indexes**:
  - idx_care_receivers_code
  - idx_care_receivers_service_id
  - idx_care_receivers_facility_id
  - idx_care_receivers_version
  - idx_care_receivers_updated_by
- **RLS**: Enabled (multiple policies for role-based access)
- **Triggers**: 
  - increment_care_receiver_version (auto-increment version on UPDATE)
  - log_care_receiver_update (audit log on UPDATE)

### care_receiver_audits
- **Columns**:
  - `id` uuid PRIMARY KEY (default: gen_random_uuid())
  - `care_receiver_id` uuid NOT NULL REFERENCES public.care_receivers(id) ON DELETE CASCADE
  - `action` text NOT NULL CHECK (action IN ('create', 'update', 'delete'))
  - `changed_fields` jsonb (changed field names only, no values for PII)
  - `actor` uuid (auth.uid of editor)
  - `created_at` timestamptz NOT NULL (default: now())
- **Keys**:
  - PK: id
  - FK: care_receiver_id → care_receivers(id)
- **Indexes**:
  - idx_care_receiver_audits_care_receiver_id
  - idx_care_receiver_audits_actor
  - idx_care_receiver_audits_created_at
- **RLS**: Enabled (nurse/admin only)

### case_records
- **Columns**:
  - `id` uuid PRIMARY KEY (default: gen_random_uuid())
  - `service_id` text NOT NULL (initially text, not uuid)
  - `user_id` text (NOT NULL initially, then made nullable in 20260111)
  - `care_receiver_id` uuid [added in 20260111] REFERENCES public.care_receivers(id)
  - `record_date` date NOT NULL
  - `record_time` time NULL
  - `payload` jsonb NOT NULL (default: '{}', renamed from record_data)
  - `record_data` jsonb [renamed to payload in 20260109]
  - `main_staff_id` uuid [added in 20260114] REFERENCES staff(id) ON DELETE SET NULL
  - `sub_staff_id` uuid [added in 20260114] REFERENCES staff(id) ON DELETE SET NULL
  - `facility_id` uuid NOT NULL REFERENCES public.facilities(id) [added in 20260117]
  - `version` int NOT NULL DEFAULT 1 [added in 20260128] (optimistic locking)
  - `created_at` timestamptz NOT NULL (default: now())
  - `updated_at` timestamptz NOT NULL (default: now())
- **Keys**:
  - PK: id
  - FK: care_receiver_id → care_receivers(id)
  - FK: main_staff_id → staff(id)
  - FK: sub_staff_id → staff(id)
  - FK: facility_id → facilities(id)
  - UNIQUE: (service_id, user_id, record_date)
- **Tenant fields**: Both `service_id` (text) and `facility_id` (uuid)
- **Indexes**:
  - idx_case_records_service_user_date (service_id, user_id, record_date DESC)
  - idx_case_records_user_date (user_id, record_date DESC)
  - idx_case_records_main_staff
  - idx_case_records_sub_staff
  - idx_case_records_facility_id
  - idx_case_records_version (user_id, date, version)
- **RLS**: Enabled (facility-based isolation, service_role bypass)
- **Triggers**: 
  - trigger_case_records_updated_at (auto-update updated_at)
  - case_records_version_trigger (auto-increment version on UPDATE)

### staff
- **Columns**:
  - `id` uuid PRIMARY KEY (default: gen_random_uuid())
  - `service_id` uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE
  - `name` text NOT NULL
  - `sort_order` int NOT NULL (default: 0)
  - `is_active` boolean NOT NULL (default: true)
  - `created_at` timestamptz NOT NULL (default: now())
  - `updated_at` timestamptz NOT NULL (default: now())
- **Keys**:
  - PK: id
  - FK: service_id → services(id)
  - UNIQUE: (service_id, name)
- **Tenant fields**: `service_id` only
- **Indexes**:
  - idx_staff_service_active (service_id, is_active, sort_order)
- **RLS**: Enabled (authenticated users can view, admins can manage)
- **Triggers**: trigger_staff_updated_at

### staff_profiles
- **Columns**:
  - `id` uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
  - `facility_id` uuid NOT NULL REFERENCES public.facilities(id)
  - `role` text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'viewer'))
  - `display_name` text NOT NULL
  - `email` text
  - `created_at` timestamptz (default: now())
  - `updated_at` timestamptz (default: now())
- **Keys**:
  - PK: id
  - FK: id → auth.users(id)
  - FK: facility_id → facilities(id)
- **Tenant fields**: `facility_id` only
- **Indexes**:
  - idx_staff_profiles_facility_id
- **RLS**: Enabled (users can read own profile, admins can read/update all in facility)
- **Note**: Links to auth.users(id), used for user authentication and authorization

### services (renamed to facilities in 20260117)
- **Columns**:
  - `id` uuid PRIMARY KEY (default: gen_random_uuid())
  - `slug` text UNIQUE NOT NULL
  - `name` text NOT NULL
  - `created_at` timestamptz (default: now())
  - `updated_at` timestamptz (default: now())
- **Keys**:
  - PK: id
  - UNIQUE: slug
- **Tenant fields**: Self (this IS the tenant table)
- **RLS**: Enabled (users can see their own facility only)
- **Note**: Originally named "services", renamed to "facilities" in migration 20260117

### facilities (alias for services)
- Same as services table (renamed in 20260117_implement_facility_rls.sql)
- Seed data: 'life-care' (生活介護), 'after-school' (放課後等デイサービス)

### service_staff (REFERENCED BUT NOT CREATED)
- **Status**: ⚠️ **NOT FOUND IN MIGRATIONS**
- **Referenced in**: 20260128110000_extend_rls_role_separation.sql
- **Expected columns** (based on RLS policy references):
  - `user_id` (uuid, presumably auth.uid)
  - `service_id` (uuid)
  - `role` (text: 'staff' | 'nurse' | 'admin')
- **Purpose**: Many-to-many mapping between users and services with role assignment
- **Issue**: RLS policies reference this table but CREATE TABLE statement is missing

### voice_notes
- **Status**: Mentioned in 20260130_enable_rls_core_tables.sql
- **RLS**: Enabled (service_role bypass, owner-based policies)
- **Schema**: Not extracted (not core to case records)

## Inconsistencies (Facts Only)

### 1. service_id vs facility_id Duality
- **Tables with both**: `care_receivers`, `case_records`
- **Migration 20260117** renamed `services` → `facilities` and added `facility_id` to dependent tables
- **Result**: Some tables have both `service_id` (legacy) and `facility_id` (new), causing confusion
- **Observation**: `service_id` in `case_records` is `text`, not `uuid`, suggesting it was originally an external identifier

### 2. service_staff Table Missing
- **RLS policies depend on `service_staff`** (20260128110000_extend_rls_role_separation.sql)
- **Table creation DDL not found in migrations**
- **Impact**: Role-based RLS policies (staff/nurse/admin) will fail at runtime if table doesn't exist
- **Workaround in code**: May use `staff_profiles.role` instead for now

### 3. staff vs staff_profiles Confusion
- **`staff`**: Service-specific staff master (name, sort_order, is_active) - used for case record staff assignment
- **`staff_profiles`**: Auth-linked user profiles (display_name, role, facility_id) - used for RLS and authentication
- **No FK between them**: These appear to be separate concepts (operational staff vs system users)
- **Potential issue**: Assigning `staff.id` to case records doesn't link to auth users

### 4. Multiple RLS Migration Passes
- **20260108**: Initial RLS on case_records (user_id-based)
- **20260117**: Facility-based RLS with `get_current_facility_id()` function
- **20260128**: Role-based RLS (staff/nurse/admin separation)
- **20260130**: Baseline RLS with service_role bypass
- **Result**: Multiple overlapping or conflicting policies; unclear which is currently active

### 5. Optimistic Locking Added Late
- **`version` column** added to `case_records` (20260128093212) and `care_receivers` (20260128100000)
- **Existing records**: Initialized to version=1 retroactively
- **Client code**: May not be aware of version checking requirement

## Next Required Migrations (Plan Only)

### Phase 1: Consolidate Tenant Key
1. **Decide canonical tenant key**: `service_id` (uuid) or `facility_id` (uuid)?
   - Recommendation: Use `facility_id` (uuid) everywhere, drop `service_id` (text) from case_records
2. **Migrate case_records.service_id** (text) → **facility_id** (uuid)
   - Map via `SELECT id FROM facilities WHERE slug = case_records.service_id`
3. **Drop redundant columns**:
   - `care_receivers.service_id` (keep only `facility_id`)
   - `case_records.service_id` (keep only `facility_id`)
4. **Rename `facilities` back to `services`** if preferred, OR commit to `facilities` as standard terminology

### Phase 2: Create Missing service_staff Table
1. **Define service_staff schema**:
   ```sql
   CREATE TABLE public.service_staff (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     service_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
     role text NOT NULL CHECK (role IN ('staff', 'nurse', 'admin')),
     created_at timestamptz DEFAULT now(),
     UNIQUE(user_id, service_id)
   );
   ```
2. **Seed from staff_profiles**: Populate `service_staff` from existing `staff_profiles` (facility_id → service_id)
3. **Enable RLS** on `service_staff` (admins only can manage)

### Phase 3: Unify staff and staff_profiles
1. **Clarify distinction**:
   - Option A: Merge `staff` into `staff_profiles` (one table for all staff)
   - Option B: Keep separate (operational staff vs system users)
2. **If merging**: Add `sort_order`, `is_active` to `staff_profiles`, migrate `staff` data
3. **If keeping separate**: Add `staff_profile_id` (nullable) to `staff` table for linking

### Phase 4: Consolidate RLS Policies
1. **Audit all RLS policies**: List active policies per table (use scripts/check_rls.sql)
2. **Remove conflicting policies**: Keep only one consistent set (facility-based + role-based)
3. **Test with multiple roles**: Verify staff/nurse/admin can access correct data
4. **Document final RLS model**: Update SECURITY_MODEL.md with authoritative policy list

### Phase 5: Backfill version for Existing Records
1. **Ensure all records have version ≥ 1**
2. **Client-side**: Update API endpoints to support optimistic locking (version checks on PUT/PATCH)
3. **Error handling**: Return 409 Conflict if version mismatch

---

**Inventory source**: supabase/migrations/*.sql (no live DB access)  
**Last updated**: 2026-02-20  
**Related docs**: SECURITY_MODEL.md, SUPABASE_RLS_GUIDE.md
