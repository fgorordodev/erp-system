# ERP System

![CI](https://github.com/fgordev/erp-system/actions/workflows/ci.yml/badge.svg)
![Status](https://img.shields.io/badge/status-under%20development-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-22-green)
![pnpm](https://img.shields.io/badge/pnpm-11-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-7-blue)
![NestJS](https://img.shields.io/badge/NestJS-red)
![React](https://img.shields.io/badge/React-Vite-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![Docker](https://img.shields.io/badge/Docker-enabled-2496ED)
![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-purple)

Modern ERP system built with a scalable monorepo architecture focused on maintainability, type safety and professional development practices.

---

# Overview

ERP System is a business management platform designed with a modular architecture.

The goal is to provide a flexible foundation for managing:

- Users
- Authentication
- Inventory
- Sales
- Purchases
- Customers
- Reports
- Business processes

The project is built following modern software engineering practices:

- Type-safe development
- Containerized infrastructure
- Automated workflows
- Clean architecture principles

---

# Tech Stack

## Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- REST API

## Frontend

- React
- Vite
- TypeScript

## Infrastructure

- Docker
- Docker Compose
- GitHub Actions

## Package Management

- pnpm Workspaces

---

# Architecture

The project uses a monorepo structure:

```text
erp-system/

├── apps/
│   ├── backend        # NestJS API
│   └── frontend       # React application
│
├── packages/
│   └── types          # Shared TypeScript types
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

# Requirements

Before starting, install:

- Node.js 22+
- pnpm 11+
- Docker

```bash
node -v

pnpm -v

docker --version
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/fgordev/erp-system.git

cd erp-system
```

Install dependencies:

```bash
pnpm install
```

---

# Environment Setup

Create your environment file:

```bash
cp .env.example .env
```

Example:

```env
# Application
NODE_ENV=development

# Backend
BACKEND_PORT=3000

# Frontend
VITE_FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000/api

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=erp_system
POSTGRES_PORT=5432

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erp_system
```

---

# Infrastructure

Start docker services:

```bash
docker compose up -d
```

Stop services:

```bash
docker compose down
```

---

# Development

## Backend

```bash
pnpm dev:backend
```

Runs:

```
http://localhost:3000
```

## Frontend

```bash
pnpm dev:frontend
```

Runs:

```
http://localhost:5173
```

---

# Available Scripts

Install dependencies

```bash
pnpm install
```

Build applications:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

---

# CI/CD

The project uses GitHub Actions for automated workflows.

## Current Pipeline

- Install dependencies
- Validate code quality
- Build applications

## Future Improvements

- Automated tests
- Docker image publishing
- Production deployment

---

# Project Status

## Phase 1 - Foundation

- ✅ Repository setup
- ✅ pnpm workspace
- ✅ Environment configuration
- ✅ Docker infrastructure
- ✅ CI/CD foundation

## Phase 2 - Backend

- ⬜ NestJS setup
- ⬜ Authentication
- ⬜ Database integration
- ⬜ API modules

## Phase 3 - Frontend

- ⬜ React setup
- ⬜ UI system
- ⬜ Authentication flow

## Phase 4 - ERP Modules

- ⬜ Inventory
- ⬜ Sales
- ⬜ Customers
- ⬜ Reports

---

# Contributing

This project follows conventional commits.

Examples:

```text
feat(auth): add login module

fix(api): resolve validation error

core(infra): update docker configuration
```

---

# License

```
MIT License

Copyright (c) 2026 Fernando Gorordo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software.

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```
