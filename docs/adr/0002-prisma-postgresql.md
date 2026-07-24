# ADR 0002: Prisma with PostgreSQL driver adapter

- Status: Accepted
- Date: 2026-07-23

## Context

The ERP requires relational integrity, transactions, migrations and type-safe data access.

## Decision

Use PostgreSQL 17 and Prisma 7 with `@prisma/adapter-pg`. Keep schema, migrations, seed and generated-client exports inside `@erp/database`.

## Consequences

- relational constraints and PostgreSQL capabilities remain available;
- generated TypeScript types support safe persistence code;
- migration history is part of the deployable artifact;
- consumers depend on the database package public API rather than generated paths;
- Prisma errors must be translated without leaking implementation details.
