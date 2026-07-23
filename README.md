# ERP System

![CI](https://github.com/fgorordodev/erp-system/actions/workflows/ci.yml/badge.svg)
![Status](https://img.shields.io/badge/status-foundation%20complete-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-22-green)
![pnpm](https://img.shields.io/badge/pnpm-11-orange)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![Docker](https://img.shields.io/badge/Docker-enabled-2496ED)

Backend foundation for a modular ERP platform built with NestJS, Prisma and PostgreSQL. The current repository contains the API, database infrastructure, security primitives, RBAC and user management. Authentication endpoints and business-domain modules are planned next.

## Current scope

Implemented:

- NestJS API bootstrap and environment validation
- PostgreSQL with Prisma 7 and the PostgreSQL driver adapter
- Docker Compose database service
- health checks
- global response, logging and exception handling
- request correlation IDs
- password hashing and AES-256-GCM encryption service
- JWT infrastructure and Passport strategy
- global authentication, role and permission guards
- role-based access control seed
- user creation, reading, updating, activation and soft deletion
- Swagger/OpenAPI documentation
- GitHub Actions quality pipeline

Not implemented yet:

- login, refresh and logout endpoints
- refresh-token persistence and rotation
- password recovery and password-change flows
- frontend application
- ERP business modules such as organizations, products, inventory and sales
- meaningful automated test coverage

## Technology

| Area | Technology |
|---|---|
| Runtime | Node.js 22 |
| Language | TypeScript |
| Backend | NestJS 11 |
| Persistence | Prisma 7 |
| Database | PostgreSQL 17 |
| Validation | class-validator, class-transformer, Zod |
| Authentication foundation | Passport JWT, `@nestjs/jwt` |
| Security | bcrypt, Helmet, AES-256-GCM |
| API documentation | Swagger/OpenAPI |
| Package manager | pnpm workspaces |
| Infrastructure | Docker Compose, GitHub Actions |

## Repository structure

```text
erp-system/
├── apps/
│   └── backend/
│       ├── prisma/
│       ├── src/
│       │   ├── common/
│       │   ├── config/
│       │   ├── database/
│       │   ├── modules/
│       │   └── security/
│       └── test/
├── docs/
├── .github/workflows/
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## Requirements

- Node.js 22 or newer
- pnpm 11
- Docker with Docker Compose

## Setup

```bash
git clone https://github.com/fgorordodev/erp-system.git
cd erp-system
pnpm install
cp .env.example .env
docker compose up -d
pnpm --filter backend exec prisma migrate dev
pnpm --filter backend db:seed
pnpm dev:backend
```

The API is available at `http://localhost:3000/api` and Swagger at `http://localhost:3000/docs` with the default environment values.

## Environment

The backend validates all required variables during startup. Generate new secrets for local or deployed environments; do not reuse example values.

```env
NODE_ENV=development
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erp_system
JWT_ACCESS_SECRET=<at-least-64-characters>
JWT_REFRESH_SECRET=<at-least-64-characters>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
ENCRYPTION_KEY=<64-hex-characters>
```

Useful generation commands:

```bash
openssl rand -hex 64  # JWT secret
openssl rand -hex 32  # 256-bit encryption key
```

## Commands

```bash
pnpm dev:backend                 # Run API in watch mode
pnpm --filter backend build      # Build backend
pnpm lint                        # Run linting
pnpm format                      # Format repository
pnpm --filter backend db:seed    # Seed roles and permissions
pnpm build                       # Build all workspace applications
```

## API conventions

- Global prefix: `/api`
- Swagger: `/docs`
- Bearer authentication scheme: `access-token`
- Success responses are wrapped in `{ success, data, timestamp, path }`
- Errors are wrapped in `{ success, error, timestamp, path }`
- Protected routes use global JWT, role and permission guards

See [API documentation](docs/API.md) and [security documentation](docs/SECURITY.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Database](docs/DATABASE.md)
- [API conventions](docs/API.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Technical audit](docs/TECHNICAL_AUDIT.md)
- [Architecture decisions](docs/adr/README.md)

## Project status

The backend foundation is stable enough to begin the authentication module. The repository should not yet be presented as a production-ready ERP: business modules, session management, tests and operational observability remain incomplete.

## License

MIT. See [LICENSE](LICENSE).
