# Roadmap

[← Operations](OPERATIONS.md) · [Documentation index →](README.md)

This roadmap distinguishes repository evidence from proposed work.

## Completed foundation

- pnpm/Turborepo monorepo
- NestJS backend and React/Vite frontend shell
- Shared TypeScript, RBAC, API-contract and database packages
- PostgreSQL/Prisma schema and migrations
- Seeded system roles and permissions
- Seeded administrator
- User CRUD/status/soft deletion
- JWT authentication
- Persistent sessions
- Refresh-token rotation and reuse detection
- Global guards, validation, logging, response and error handling
- Swagger/OpenAPI and Postman assets
- CI build/lint/type-check workflow

## Immediate engineering priorities

1. Add meaningful integration and e2e coverage.
2. Run tests and OpenAPI validation in CI.
3. Add rate limiting and login abuse protections.
4. Add audit logging for identity and administration events.
5. Implement frontend authentication and protected routing.
6. Add user pagination/filtering.
7. Add explicit role-assignment administration.

## Platform priorities

- organization/tenant boundary;
- invitations and onboarding;
- password reset/change;
- multi-factor authentication;
- session/device management;
- notification infrastructure;
- observability and production deployment.

## ERP domain roadmap

Recommended implementation order:

1. organizations and settings;
2. products and categories;
3. warehouses and inventory;
4. customers and suppliers;
5. purchasing;
6. sales and orders;
7. invoicing and payments;
8. reporting;
9. accounting integration;
10. human resources.

Each module should add schema, permissions, API contracts, tests and documentation as one coherent change.
