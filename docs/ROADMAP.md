# Roadmap

Status legend: ✅ completed · 🚧 in progress · ⬜ planned

## Phase 1 — Workspace and platform foundation

- ✅ Turborepo and pnpm workspaces
- ✅ NestJS backend
- ✅ React + Vite frontend shell
- ✅ Shared TypeScript configuration package
- ✅ PostgreSQL Docker Compose service
- ✅ Prisma database package and migrations
- ✅ Environment validation
- ✅ Swagger/OpenAPI and health checks
- ✅ Request correlation, logging and response/error normalization
- ✅ GitHub Actions quality workflow foundation

## Phase 2 — Identity and access

- ✅ User CRUD and response mapping
- ✅ Active/inactive status management
- ✅ User soft deletion
- ✅ Multi-role RBAC model
- ✅ Permission and role guards
- ✅ Login and credential validation
- ✅ Persistent server-side sessions
- ✅ Access tokens tied to sessions
- ✅ Hashed refresh-token persistence
- ✅ Atomic refresh-token rotation
- ✅ Logout and immediate session revocation
- ✅ Current-user endpoint
- 🚧 Automated authentication and authorization tests
- ⬜ Rate limiting and brute-force controls
- ⬜ Password recovery and reset
- ⬜ Email verification
- ⬜ Two-factor authentication
- ⬜ Session-management UI and logout-all capability
- ⬜ Security audit events

## Phase 3 — Delivery quality

- 🚧 Reliable lint/typecheck/build/test CI sequence
- ⬜ Unit tests for services, guards and mappers
- ⬜ Integration tests for Prisma-backed workflows
- ⬜ End-to-end API suite
- ⬜ Coverage thresholds
- ⬜ Dependency and CodeQL security scanning
- ⬜ Container image build and vulnerability scanning
- ⬜ Structured logging, metrics and tracing
- ⬜ Deployment environments and migration strategy

## Phase 4 — Organization model

This phase must precede most ERP business tables.

- ⬜ Organization/tenant entity
- ⬜ Membership and organization-scoped roles
- ⬜ Branch/location model
- ⬜ Warehouse ownership boundaries
- ⬜ Tenant-aware uniqueness and query policies
- ⬜ Audit and retention policy

## Phase 5 — Frontend foundation

- ⬜ UI system and application layout
- ⬜ API client and typed error handling
- ⬜ Login and refresh lifecycle
- ⬜ Protected routing and authorization-aware navigation
- ⬜ Session expiration and logout UX
- ⬜ User administration screens
- ⬜ Accessibility and responsive baseline
- ⬜ Frontend tests

## Phase 6 — ERP business modules

Recommended order:

1. ⬜ Products, categories and units
2. ⬜ Warehouses and inventory movements
3. ⬜ Customers and suppliers
4. ⬜ Purchases and receiving
5. ⬜ Sales, orders and invoicing boundaries
6. ⬜ Reporting and dashboards
7. ⬜ Accounting integration/design

Each module should define permissions, audit events, transactional invariants, API contracts and tests before being considered complete.

## Immediate next milestone

1. Make CI green from a clean checkout.
2. Add auth/session unit and integration tests.
3. Add user/RBAC end-to-end tests.
4. Add rate limiting and security-event logging.
5. Design organization and branch tenancy.
6. Begin the frontend authentication flow.
