# Shared Packages

[← Frontend](FRONTEND.md) · [Development →](DEVELOPMENT.md)

## `@erp/api-contracts`

Contains transport-level contracts currently centered on shared error codes.

Intended consumers: backend, frontend and future integrations.

## `@erp/rbac`

Contains canonical role and permission definitions:

- `ROLES`
- `PERMISSIONS`
- `ROLE_DEFINITIONS`

This package is the source of truth used by guards and database seeding.

## `@erp/database`

Contains:

- Prisma schema
- migrations
- generated Prisma Client
- seed
- exports

Build and type-check commands generate Prisma Client before compiling TypeScript.

## `@erp/tsconfig`

Exports the shared TypeScript base configuration used by internal packages.

## Package design rules

- Shared packages must not import application code.
- Applications may depend on packages.
- Package public APIs should be exported through `src/index.ts`.
- Generated output should not become a hand-edited source of truth.
- A package requiring compiled declarations must be built before consumers in clean environments; Turborepo dependency ordering handles this through `dependsOn: ["^build"]`.
