# ADR 0006: Build internal packages before type-aware quality checks

- Status: Accepted
- Date: 2026-07-24

## Context

`@erp/backend` consumes declarations exported from `@erp/database`, and those declarations depend on generated Prisma Client artifacts. Local machines may retain them, but clean CI runners do not.

## Decision

Generate Prisma Client and build `@erp/database` before type-aware lint and type checking. Represent internal build ordering through Turborepo dependencies and keep the CI prerequisite explicit.

## Consequences

- clean environments resolve Prisma and package types consistently;
- lint failures reflect source issues rather than missing generated artifacts;
- the database package build performs generation work;
- CI takes a small additional build step but becomes deterministic.
