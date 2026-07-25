# ADR 0001: pnpm/Turborepo monorepo

[← ADR index](README.md)

- **Status:** Accepted
- **Date:** 2026-07

## Context

The platform contains backend, frontend and cross-application concerns that must evolve together.

## Decision

Use pnpm workspaces and Turborepo. Place executable applications in `apps/*` and reusable libraries in `packages/*`.

## Consequences

- Shared types and policies can have one source of truth.
- Build ordering and caching can be centralized.
- Package boundaries must be maintained deliberately.
- Clean CI builds must generate and compile dependency packages before consumers.
