# Architecture

## Overview

ERP System currently follows a modular NestJS architecture inside a pnpm workspace. It uses pragmatic layering rather than full Clean or Hexagonal Architecture. This is appropriate for the current project size and can evolve when domain complexity justifies additional boundaries.

```text
HTTP request
   │
   ▼
RequestIdMiddleware
   │
   ▼
JwtAuthGuard → RolesGuard → PermissionsGuard
   │
   ▼
Controller → Service → PrismaService → PostgreSQL
   │
   ▼
ResponseInterceptor / ExceptionFilters
```

## Main layers

### `common`

Cross-cutting infrastructure shared by all modules:

- business and technical exceptions
- HTTP and Prisma exception filters
- logging and response interceptors
- response interfaces
- request ID middleware

This layer must remain domain-neutral. It must not emit user-, product- or invoice-specific errors for generic persistence failures.

### `config`

Owns environment validation and Swagger configuration. Environment variables are parsed with Zod at startup, so invalid deployments fail fast.

### `database`

Provides a global `PrismaService` using Prisma 7 with `@prisma/adapter-pg`. Modules consume this service through dependency injection and should not instantiate Prisma clients directly.

### `security`

Provides reusable security infrastructure:

- password hashing
- symmetric encryption
- JWT generation and verification
- Passport JWT strategy
- global guards
- route decorators
- RBAC constants and definitions

The strategy resolves the current user and loads role and permissions. Guards authorize exclusively from the resolved `AuthUser` and do not query the database.

### `modules`

Contains application capabilities. Existing modules are:

- `health`: public API and database availability check
- `users`: permission-protected user administration

Future business modules should remain vertically grouped and expose only their public surface from each module barrel.

## Dependency direction

```text
modules ───────► security
   │               │
   ├──────────────► common
   │               │
   └──────────────► database

security ──────► database
security ──────► config
```

`common`, `config` and `database` must never depend on business modules.

## Request lifecycle

1. `RequestIdMiddleware` accepts or creates an `x-request-id`.
2. `JwtAuthGuard` bypasses routes marked `@Public()` or validates the bearer token.
3. `JwtStrategy` rejects inactive, deleted or missing users and creates an `AuthUser`.
4. `RolesGuard` evaluates `@Roles()` metadata.
5. `PermissionsGuard` evaluates `@Permissions()` metadata using AND semantics.
6. The controller validates DTOs through the global `ValidationPipe`.
7. The service executes application logic and persistence operations.
8. `ResponseInterceptor` wraps successful responses.
9. exception filters normalize errors.
10. `LoggingInterceptor` records method, route, request ID and duration.

## Module design guideline

Use this structure as modules grow:

```text
modules/example/
├── dto/
├── example.controller.ts
├── example.module.ts
├── example.service.ts
└── index.ts
```

Add repositories, mappers or use-case classes only when the module has enough business complexity to benefit from them. Do not introduce layers preemptively.

## Scalability direction

The likely domain sequence is:

```text
auth → organizations → branches → customers/suppliers
     → catalog/products → inventory → purchases/sales
     → finance → reporting
```

Before multi-company data is introduced, tenancy boundaries and ownership columns must be designed explicitly. Retrofitting organization isolation after business tables exist is costly and risky.
