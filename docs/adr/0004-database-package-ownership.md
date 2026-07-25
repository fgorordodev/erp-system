# ADR 0004: Database package ownership

[← ADR index](README.md)

- **Status:** Accepted
- **Date:** 2026-07

## Context

Multiple applications may eventually consume a shared domain database. Duplicating Prisma configuration would create drift.

## Decision

`@erp/database` owns the Prisma schema, migrations, generated client and seed.

## Consequences

- Database changes have a clear location.
- Consumers depend on a compiled internal package.
- Build and type-check flows must generate Prisma Client first.
