# Changelog

All notable changes are documented here. The project is in active development and has not published a stable release.

## Unreleased

### Added

- Turborepo and pnpm workspace with backend, frontend, database and shared TypeScript packages.
- NestJS API bootstrap, environment validation, Swagger/OpenAPI and health checks.
- PostgreSQL 17 Docker Compose service and Prisma 7 database package.
- User, role, permission, session and refresh-token persistence models.
- Multi-role RBAC using `UserRole` and `RolePermission` join models.
- User creation, listing, lookup, update, status management and soft deletion.
- Login with password verification and session metadata capture.
- Short-lived JWT access tokens tied to persistent sessions.
- Hashed refresh tokens with atomic one-time rotation and replacement chains.
- Logout through immediate session revocation.
- Request IDs, response/logging interceptors and normalized exception filters.
- Hashing, authenticated encryption, global authentication and authorization guards.
- Postman collection and architecture, API, database, security and roadmap documentation.
- GitHub Actions quality pipeline.

### Changed

- Separated authentication workflows under `modules/auth` from reusable security infrastructure under `security`.
- Replaced a single user-role relationship with multi-role assignment through `UserRole`.
- Added typed Prisma projections and mappers so persistence shapes do not leak into API contracts.
- Introduced package aliases and barrel exports for stable imports.
- Moved Prisma schema, generated client and package exports into `@erp/database`.
- Made `@erp/database` generate Prisma Client before compilation.
- Made typed lint and type checking depend on built internal packages in clean environments.
- Updated CI to build the database package before linting the backend.

### Security

- Passwords and refresh tokens are hashed before persistence.
- Refresh tokens are single-use and rotated atomically.
- Revoked or expired sessions invalidate access-token authentication.
- Inactive and soft-deleted users are rejected during authentication.
- Protected routes are deny-by-default and administrative routes require explicit permissions.
- Unknown DTO properties are rejected.

### Known limitations

- Automated test coverage remains limited.
- Rate limiting, audit logging, password recovery, email verification and 2FA are pending.
- Organization/tenant boundaries are not yet modeled.
- The frontend is an application shell without completed authentication flows.
- Inventory, sales, purchasing, reporting and other ERP domains remain pending.
