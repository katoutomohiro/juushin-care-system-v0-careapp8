# Initialized

## DOMAIN_MODEL Documentation
- **Status**: Created (2026-02-20)
- **Inventory source**: supabase/migrations/*.sql (no live DB access)
- **Coverage**: care_receivers, case_records, staff, staff_profiles, facilities/services
- **Key findings**: 
  - service_id/facility_id duality (inconsistent tenant keys)
  - service_staff table referenced but not created in migrations
  - Multiple overlapping RLS policy sets
- **Next steps**: See DOMAIN_MODEL.md → "Next Required Migrations"
