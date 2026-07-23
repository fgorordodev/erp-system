# Changelog

All notable changes will be documented in this file. The project currently follows an unreleased development cycle and has not published a stable semantic version.

## Unreleased

### Added

- NestJS backend foundation in a pnpm workspace
- PostgreSQL 17 Docker Compose service
- Prisma 7 PostgreSQL adapter integration
- environment validation with Zod
- Swagger/OpenAPI setup
- API and database health checks
- request ID middleware
- logging and response interceptors
- normalized HTTP and Prisma exception filters
- bcrypt password hashing
- AES-256-GCM encryption service
- access and refresh JWT utility service
- database-backed Passport JWT strategy
- global authentication, role and permission guards
- RBAC roles, permissions and idempotent seed
- user administration with soft deletion and status management
- GitHub Actions lint and build pipeline
- architecture, security, database, API and contribution documentation

### Changed

- moved global filters and interceptors to Nest application providers
- hardened CORS and bootstrap configuration
- rejected inactive and deleted users during JWT validation
- separated password changes from general user updates
- normalized user response DTOs and email handling
- decoupled generic Prisma errors from user-domain errors

### Security

- passwords are hashed before persistence
- unknown DTO properties are rejected
- protected endpoints are deny-by-default
- user routes require explicit RBAC permissions

### Known limitations

- no authentication controller or session persistence
- no refresh-token rotation or revocation
- minimal automated test coverage
- no business-domain ERP modules yet
