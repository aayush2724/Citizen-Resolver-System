Overview

This document outlines a practical, incremental plan to evolve the existing Citizen-Resolver-System into a SaaS-ready architecture. The goal is to enable multi-tenant isolation, scalable deployment, billing and tenant management, observability, and operational CI/CD while minimizing disruption to the current codebase.

Principles

- Incremental: introduce tenancy and platform services step-by-step.
- Backwards-compatible: keep current UI and API behavior while adding tenant context.
- Secure by default: isolate data per-tenant and centralize auth and secrets.
- Observable and automatable: include metrics, logs, and CI/CD from the start.

High-level Components

- API Gateway / Ingress
  - Single public entry point handling auth, rate limiting, TLS termination, and routing to internal services.

- Platform Services (new microservice group)
  - Tenant Service: manage tenant records, subscription status, plan, metadata, and onboarding.
  - Billing Service: integrates with Stripe (recommended) for invoices, webhooks, and usage metering.
  - Auth Service: centralized auth (JWT / OAuth2), supports tenant-scoped users and SSO (optional).
  - Admin Console: UI for tenant management, usage, billing, and support tools.

- Application Services (existing code extracted/refactored)
  - Issue API Service: core report/issue endpoints, refactored to accept tenant context.
  - Notifications, Messages, State: each can be kept as modular services or grouped in a single app depending on scale.

- Data Layer
  - Multi-tenant strategy options:
    - Shared schema with tenant_id columns (fastest to adopt; use row-level security where possible).
    - Single database per tenant (highest isolation; works for larger tenants).
    - Hybrid: small tenants on shared schema; large/enterprise tenants on dedicated DBs.
  - Use migrations (Flyway / Knex / Sequelize migrations) and versioned schemas.

- Infrastructure & Deployment
  - Containerize services with Docker. Use `docker-compose` for local dev and Kubernetes for production.
  - Use a managed SQL database (Postgres) with read replicas for scaling reads.
  - Use object storage (S3-compatible) for images and attachments.

Security & Isolation

- Tenant identification: include `X-Tenant-ID` or embed tenant_id in JWT claims.
- Authorization: tenant-aware RBAC; verify tenant isolation at service boundaries.
- Secrets: store in a secrets manager (AWS Secrets Manager, HashiCorp Vault) and avoid hardcoding.
- Data protections: enable TLS in transit and encryption at rest for DBs and object storage.

Observability & Reliability

- Logs: structured logs shipped to ELK / Loki.
- Metrics: expose Prometheus metrics; track per-tenant usage and error rates.
- Tracing: add distributed tracing (Jaeger / Zipkin).
- Alerts: configure alerts for revenue-impacting failures (billing webhooks, DB down, 5xx spikes).

CI/CD and Ops

- CI: run tests, lint, container builds in GitHub Actions / GitLab CI.
- CD: deploy to staging then production; support blue/green or canary deployments.
- Infrastructure-as-Code: Terraform for cloud resources.

Data Migration Strategy

1. Add tenant_id to existing tables (nullable) and backfill using mapping of users/orgs.
2. Deploy services that are tenant-aware but support missing tenant_id (grace period).
3. Once backfill is complete and tested, enforce non-null tenant_id and row-level access.

Suggested Repo Restructure

- /client (keep existing frontend)
- /server (API gateway + monorepo services)
  - /server/services/gateway
  - /server/services/auth
  - /server/services/tenant
  - /server/services/billing
  - /server/services/issues  (extracted from existing issues module)
  - /server/services/notifications
  - /server/shared (config, middlewares, db client)
- /platform (infra, IaC, CI templates)
  - /platform/terraform
  - /platform/kubernetes
  - /platform/ci

Concrete First Changes (Low-effort, High-value)

- Add `tenant_id` column to critical tables and migration scripts.
- Centralize authentication into `server/services/auth` and start issuing tenant-scoped JWTs.
- Add `X-Tenant-ID` header handling middleware in `server/shared/middlewares`.
- Introduce a basic `server/services/tenant` service with CRUD and a minimal admin UI.
- Add Dockerfile for `server` and top-level `docker-compose.yml` for local platform emulation.
- Create `docs/` runbook for onboarding a new tenant.

Estimate & Phases

- Phase 0 (1-2 days): Architectural doc, CI templates, Dockerize services, add tenant_id column and minimal middleware.
- Phase 1 (1-3 weeks): Implement Tenant Service, Auth centralization, update APIs to be tenant-aware, add migrations, basic billing integration.
- Phase 2 (2-6 weeks): Production-grade infra (K8s/Terraform), monitoring, SSO, per-tenant scaling options and dedicated DBs for large tenants.

Next Steps I Can Do Now

- Scaffold `server/services/tenant` and `server/services/auth` with basic endpoints and middleware.
- Add a migration that adds `tenant_id` to core tables in `server/db/schema.sql` and add migration scripts.
- Add `docker-compose.yml` and Dockerfiles for quick local runs.

Files Added/Changed

- New: `docs/SAAS_ARCHITECTURE.md` (this file)

Questions

- Do you prefer a shared-schema multi-tenant model or separate DBs per tenant for this product?
- Do you already have a billing provider (Stripe) preference?

If you want, I can now scaffold the `server/services/tenant` and `server/services/auth` directories and add a local `docker-compose.yml` to iterate on.