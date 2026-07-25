# Frontend

[← Documentation index](README.md) · [Packages →](PACKAGES.md)

## Current state

`apps/frontend` is a React 19 + Vite 8 application shell. The audited snapshot contains the starter application and static assets; it does not yet provide production ERP workflows.

## Available scripts

```bash
pnpm dev:frontend
pnpm --filter @erp/frontend build
pnpm --filter @erp/frontend typecheck
pnpm --filter @erp/frontend lint
pnpm --filter @erp/frontend preview
```

## Intended boundaries

The frontend should consume the backend exclusively through documented HTTP contracts. Future implementation should keep these concerns separate:

```text
src/
├── app/          # composition, router and providers
├── features/     # authentication and ERP feature slices
├── pages/        # route-level screens
├── shared/       # generic UI and utilities
└── services/     # API client and transport adapters
```

This is guidance, not a claim about the current source tree.

## Near-term priorities

1. API client with normalized error handling.
2. Login and token/session lifecycle.
3. Protected routing.
4. Current-user bootstrap.
5. Permission-aware navigation.
6. Initial administration screens.
7. First ERP business feature.

See [Roadmap](ROADMAP.md).
