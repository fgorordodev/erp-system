# Roadmap

Status legend: complete, next, planned, later.

## Phase 0 — Foundation — complete

- pnpm workspace
- NestJS backend
- PostgreSQL and Prisma adapter
- Docker Compose
- environment validation
- global middleware, interceptors and filters
- Swagger
- health checks
- CI build and lint

## Phase 1 — Security infrastructure — complete

- bcrypt hashing
- AES-256-GCM service
- JWT service and strategy
- global authentication guard
- roles and permissions guards
- decorators
- RBAC constants and seed

## Phase 2 — User administration — complete

- create, list and retrieve users
- profile update
- activation and deactivation
- soft deletion
- permission-protected routes
- normalized DTOs and responses

## Phase 3 — Authentication and sessions — next

- login
- access and refresh token response
- refresh-token storage as hashes
- token rotation
- logout and revocation
- session model
- current-user endpoint
- password change
- authentication tests
- rate limiting

## Phase 4 — Organization foundation — planned

- organizations or companies
- tenant ownership strategy
- branches
- memberships and organization-scoped roles
- organization switching if required

## Phase 5 — Parties — planned

- customers
- suppliers
- contacts
- tax identifiers
- addresses

## Phase 6 — Catalog — planned

- products and services
- categories
- units of measure
- price lists
- taxes

## Phase 7 — Inventory — planned

- warehouses
- stock ledger
- adjustments
- transfers
- reservations
- valuation policy

## Phase 8 — Purchases — planned

- purchase orders
- receipts
- supplier invoices
- accounts payable integration

## Phase 9 — Sales — planned

- quotations
- sales orders
- deliveries
- invoices
- accounts receivable integration

## Phase 10 — Finance — later

- payments
- cash and bank accounts
- journal model
- reconciliation
- financial statements

## Phase 11 — Reporting and operations — later

- dashboards
- exports
- audit log
- background jobs
- notifications
- observability and alerts
- deployment automation

## Cross-cutting quality milestones

Before production:

- unit, integration and end-to-end test strategy
- database backup and recovery procedure
- vulnerability scanning
- structured logging
- metrics and traces
- pagination and filtering standards
- API versioning decision
- data-retention and privacy policy
