# ADR 0003: Centralized RBAC definitions

[← ADR index](README.md)

- **Status:** Accepted
- **Date:** 2026-07

## Context

Authorization constants are needed by backend guards and database seed logic.

## Decision

Define roles, permissions and role mappings in `@erp/rbac`.

## Consequences

- Guards and seed use the same definitions.
- New business modules must extend the package and database seed together.
- Runtime database assignments remain authoritative for user authorization.
