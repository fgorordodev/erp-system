# ERP System

[![CI](https://github.com/fgorordodev/erp-system/actions/workflows/ci.yml/badge.svg)](https://github.com/fgorordodev/erp-system/actions/workflows/ci.yml)
[![Status](https://img.shields.io/badge/status-active%20development-f59e0b)](docs/ROADMAP.md)
[![License](https://img.shields.io/badge/license-MIT-22c55e.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.19-339933?logo=nodedotjs&logoColor=white)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10.15.1-F69220?logo=pnpm&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](package.json)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](apps/backend/package.json)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](apps/frontend/package.json)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](docker-compose.yml)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](packages/database/package.json)

A modern Enterprise Resource Planning (ERP) platform built with a full-stack TypeScript monorepo.

The project is designed to become a complete business management solution where every operational process is integrated into a single platform through independent but connected modules.

Rather than focusing only on delivering features quickly, this project emphasizes building a robust architecture capable of supporting years of continuous evolution while maintaining security, consistency and maintainability.

---

## Project Vision

ERP System aims to provide a comprehensive platform for managing the core operations of a company from a single application.

The long-term goal is to integrate all business domains into a cohesive ecosystem, allowing organizations to centralize information, automate workflows and improve operational efficiency.

Planned modules include:

- Identity & Access Management
- User Administration
- Products
- Inventory
- Warehouses
- Customers
- Suppliers
- Sales
- Purchasing
- Accounting
- Treasury
- Human Resources
- Reporting & Analytics
- Notifications
- File Management
- Audit Logging
- Multi-tenancy

Each module is designed to be developed independently while sharing the same architectural principles and infrastructure.

---

## Current Status

The project has completed its technical foundation.

Implemented features include:

- Authentication
- Authorization
- User Management
- Role-Based Access Control (RBAC)
- Permission Management
- Persistent Sessions
- Refresh Token Rotation
- Password Recovery
- Account Lockout Protection
- PostgreSQL Persistence
- API Documentation
- Continuous Integration
- Shared Workspace Packages

With the platform infrastructure in place, development is now focused on implementing ERP business modules.

---

## Development Philosophy

Every architectural decision follows a consistent set of engineering principles.

- Security by default
- Explicit, readable code
- Strong typing with TypeScript
- Modular feature-based architecture
- SOLID principles where appropriate
- Composition over inheritance
- Business logic isolated from infrastructure
- Maintainability over premature optimization
- Long-term scalability over short-term speed

The objective is not only to build an ERP, but also to create a codebase that remains understandable and maintainable as it grows.

---

## Technology Stack

### Backend

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT Authentication
- RBAC
- Refresh Token Rotation
- Session Management

### Frontend

- React 19
- Vite
- TypeScript

### Workspace

- pnpm Workspaces
- Turborepo

### Tooling

- ESLint
- Prettier
- Husky
- lint-staged
- GitHub Actions

---

## Architecture

```
                      React Frontend
                             │
                      REST API (NestJS)
                             │
     ┌───────────────┬───────────────┬───────────────┐
     │               │               │
 Authentication   User Module   Future ERP Modules
     │               │               │
     └──────────── Shared Infrastructure ────────────┘
                     │
               Prisma ORM
                     │
               PostgreSQL
```

The backend follows a feature-oriented modular architecture where every domain encapsulates its own controllers, services, repositories, DTOs, mappers and security components.

Business rules remain inside Services while repositories are responsible exclusively for persistence.

---

## Repository Structure

```text
erp-system/
├── apps/
│   ├── backend/
│   └── frontend/
│
├── packages/
│   ├── api-contracts/
│   ├── database/
│   ├── rbac/
│   └── tsconfig/
│
├── docs/
├── postman/
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Getting Started

### Requirements

- Node.js >= 20.19
- pnpm >= 10
- Docker
- Docker Compose

### Installation

```bash
git clone git@github.com:fgorordodev/erp-system.git

cd erp-system

pnpm install

cp .env.example .env
```

Generate secure secrets:

```bash
openssl rand -hex 64
```

Start the database:

```bash
docker compose up -d
```

Run migrations:

```bash
pnpm db:migrate
```

Seed development data:

```bash
pnpm db:seed
```

Generate Prisma Client:

```bash
pnpm db:build
```

Start the workspace:

```bash
pnpm dev
```

---

## Services

| Service | URL |
|---------|-----|
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/docs |
| OpenAPI | http://localhost:3000/docs-json |
| Frontend | http://localhost:5173 |
| Health | http://localhost:3000/api/health |

---

## Available Commands

| Command | Description |
|----------|-------------|
| pnpm dev | Start development environment |
| pnpm build | Build all packages |
| pnpm lint | Run ESLint |
| pnpm typecheck | Run TypeScript validation |
| pnpm test | Execute tests |
| pnpm clean | Clean workspace |
| pnpm db:migrate | Run Prisma migrations |
| pnpm db:seed | Seed database |
| pnpm db:studio | Open Prisma Studio |

---

## Roadmap

### ✅ Platform Foundation

- Monorepo architecture
- Backend infrastructure
- Authentication
- Authorization
- RBAC
- User Management
- Sessions
- Refresh Tokens
- Database Layer
- Swagger
- CI Pipeline

### 🚧 In Progress

- Frontend application
- Repository improvements
- Automated testing
- API refinements

### 📋 Planned Modules

- Products
- Inventory
- Warehouses
- Customers
- Suppliers
- Sales
- Purchasing
- Accounting
- Treasury
- Reporting
- Notifications
- Audit
- Multi-tenancy

---

## Documentation

The `/docs` directory contains detailed documentation covering architecture, backend, frontend, database, security, testing and development workflow.

---

## Contributing

Contributions are welcome.

Please read `CONTRIBUTING.md` before opening issues or pull requests.

---

## License

Distributed under the MIT License.

Copyright © 2026 Fernando Gorordo.