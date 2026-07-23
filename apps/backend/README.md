# ERP Backend

NestJS 11 API for the ERP System repository.

## Run locally

From the repository root:

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm --filter backend exec prisma migrate dev
pnpm --filter backend db:seed
pnpm dev:backend
```

Default URLs:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/api/health`

## Source layout

```text
src/
├── common/      # filters, interceptors, middleware, exceptions
├── config/      # environment and Swagger configuration
├── database/    # Prisma module and service
├── modules/     # health and users
├── security/    # crypto, JWT, guards, decorators and RBAC
├── app.module.ts
└── main.ts
```

## Prisma

```bash
pnpm --filter backend exec prisma migrate dev
pnpm --filter backend exec prisma migrate deploy
pnpm --filter backend db:seed
pnpm --filter backend exec prisma studio
```

## Build

```bash
pnpm --filter backend build
```

See the repository-level [README](../../README.md) and [docs](../../docs/ARCHITECTURE.md) for complete documentation.
