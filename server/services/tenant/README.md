Tenant Service

Purpose: Manage tenant onboarding, metadata, subscription status, and simple lookup APIs.

This is an internal service intended to be small and database-backed. It exposes endpoints such as:
- `GET /tenants/:id` — retrieve tenant metadata
- `POST /tenants` — create tenant (admin-only)

Implementation notes:
- For early iteration, keep tenant data in the main app DB and add `tenant_id` columns.
- Later, migrate to dedicated storage if needed.