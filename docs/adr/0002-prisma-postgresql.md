# ADR 0002: Prisma with PostgreSQL driver adapter

- Status: Accepted
- Date: 2026-07-23

## Context

The ERP requires relational integrity, transactions, migrations and type-safe data access.

## Decision

Use PostgreSQL 17 and Prisma 7 with `@prisma/adapter-pg`.

## Consequences

- strong relational model and generated TypeScript client
- migration history is part of the deployable artifact
- database-specific behavior remains possible through PostgreSQL
- Prisma errors must be translated without leaking implementation details
