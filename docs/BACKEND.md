# Backend

[← Architecture](ARCHITECTURE.md) · [Security →](SECURITY.md)

## Runtime

- NestJS 11
- Node.js 20.19+; CI uses Node.js 22
- CommonJS output
- Global `/api` prefix
- Swagger UI at `/docs`
- OpenAPI JSON at `/docs-json`

## Module map

| Module | Responsibility |
|---|---|
| `AuthModule` | Login, refresh, logout, credentials, sessions and refresh-token rotation |
| `UsersModule` | User administration and current-user retrieval |
| `HealthModule` | API readiness and PostgreSQL connectivity |
| `SecurityModule` | JWT, guards, hashing, encryption and token utilities |
| `DatabaseModule` | Application integration for Prisma |
| `LoggerModule` | Central logging infrastructure |

## Bootstrap behavior

`main.ts` creates the Nest application, resolves configuration, applies shared application configuration, enables Swagger and starts the HTTP listener.

`configureApplication()` applies:

- `/api` prefix
- Helmet
- CORS restricted to `FRONTEND_URL`
- credentials support
- global `ValidationPipe`
- property whitelisting
- rejection of unknown fields
- DTO transformation

## Common infrastructure

The `common` directory centralizes:

- business exceptions
- HTTP and Prisma filters
- logging and response interceptors
- request IDs
- response interfaces
- Swagger response decorators
- email normalization

This avoids duplicating transport concerns in feature modules.

## Controller/service rule

Controllers should:

- declare transport contracts;
- apply authorization metadata;
- document operations;
- delegate work.

Services should:

- implement workflow and persistence decisions;
- use typed inputs/projections;
- avoid leaking raw Prisma objects where a response DTO/mapping exists.

## Configuration

Environment variables are validated with Zod at startup. The API refuses to start when required values are absent or malformed.

See [Operations](OPERATIONS.md) for the variable inventory.
