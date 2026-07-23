# ADR 0001: Modular NestJS backend in a pnpm workspace

- Status: Accepted
- Date: 2026-07-23

## Context

The ERP is expected to grow across multiple business capabilities and may later include a frontend and shared packages.

## Decision

Use a pnpm workspace with a NestJS backend organized into cross-cutting infrastructure and vertically grouped application modules.

## Consequences

- consistent dependency management and scripts
- clear future path for additional applications or shared packages
- Nest dependency injection and module boundaries
- workspace complexity must remain justified; nonexistent applications must not be documented as implemented
