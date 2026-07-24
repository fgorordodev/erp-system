# @erp/backend

NestJS REST API for the ERP System monorepo.

## Responsibilities

- HTTP bootstrap, validation, exception normalization and Swagger.
- Authentication through login, refresh and logout workflows.
- Persistent session and refresh-token lifecycle.
- JWT authentication and multi-role RBAC enforcement.
- User administration and soft-delete behavior.
- API and PostgreSQL health reporting.

## Module boundaries

```text
src/
├── common/          # errors, filters, interceptors, middleware and shared contracts
├── config/          # environment and Swagger configuration
├── database/        # Nest integration for @erp/database
├── modules/
│   ├── auth/        # authentication workflows and persistence projections
│   ├── health/      # health endpoints and indicators
│   └── users/       # user administration
└── security/        # JWT, token/hash utilities, decorators, guards and RBAC
```

Use `@backend/*` for backend-internal imports and `@erp/database` for database package exports.

## Development

From the repository root:

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev:backend
```

API base URL: `http://localhost:3000/api`  
Swagger UI: `http://localhost:3000/docs`  
OpenAPI JSON: `http://localhost:3000/docs-json`

## Commands

```bash
pnpm --filter @erp/backend dev
pnpm --filter @erp/backend lint
pnpm --filter @erp/backend typecheck
pnpm --filter @erp/backend build
pnpm --filter @erp/backend test
pnpm --filter @erp/backend test:e2e
pnpm --filter @erp/backend swagger:generate
pnpm --filter @erp/backend swagger:validate
```

In a clean checkout, build `@erp/database` before running typed ESLint directly against the backend:

```bash
pnpm --filter @erp/database build
pnpm --filter @erp/backend lint
```

## Security model

Every route is protected by default unless decorated with `@Public()`. Access-token validation checks the persisted user and session. Administrative actions additionally require permissions declared through `@Permissions()`.

See the root [README](../../README.md), [API](../../docs/API.md), [Security](../../docs/SECURITY.md) and [Architecture](../../docs/ARCHITECTURE.md) documents.

## API contract

Swagger conventions and the module checklist are documented in [docs/backend/SWAGGER.md](../../docs/backend/SWAGGER.md). The generated contract is stored at `openapi/openapi.json` and validated by CI.
