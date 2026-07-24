# ADR 0001: Modular applications in a pnpm/Turborepo workspace

- Status: Accepted
- Date: 2026-07-23

## Context

The ERP will grow across backend, frontend, internal packages and multiple business capabilities. Coordinated types, configuration and atomic refactors are valuable.

## Decision

Use pnpm workspaces with Turborepo. Organize the NestJS backend into cross-cutting infrastructure and vertically grouped application modules, while keeping reusable build/persistence concerns in internal packages.

## Consequences

- consistent dependency management and root scripts;
- explicit application and package boundaries;
- incremental task execution and dependency ordering;
- shared configuration without publishing private packages;
- additional workspace complexity that must remain justified.
