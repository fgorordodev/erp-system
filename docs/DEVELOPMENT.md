# Development Guide

[← API](API.md) · [Testing →](TESTING.md)

## Initial setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm db:build
pnpm dev
```

## Recommended daily workflow

```bash
git switch -c feature/short-description
pnpm dev
# implement the change
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For backend-only work:

```bash
pnpm dev:backend
pnpm --filter @erp/backend check
```

For frontend-only work:

```bash
pnpm dev:frontend
pnpm --filter @erp/frontend check
```

## Database workflow

Schema change:

1. edit `packages/database/prisma/schema.prisma`;
2. run `pnpm db:migrate`;
3. inspect generated SQL;
4. update seed when required;
5. run relevant quality checks;
6. commit schema and migration together.

## API workflow

When adding an endpoint:

1. define and validate DTOs;
2. keep controller transport-focused;
3. implement service logic;
4. define authorization metadata;
5. document Swagger responses;
6. add tests;
7. update `docs/API.md` and Postman when appropriate.

## Branches and commits

Recommended branch names:

- `feature/...`
- `fix/...`
- `refactor/...`
- `docs/...`
- `chore/...`

Examples:

```text
feat(auth): add refresh-token rotation
fix(users): exclude soft-deleted records
docs(api): document status endpoint
```

## Clean-run parity

CI installs from the lockfile in a clean environment. Before opening a pull request, avoid relying on stale local build artifacts. A clean verification can be approximated with:

```bash
pnpm clean
pnpm install --frozen-lockfile
pnpm db:build
pnpm lint
pnpm typecheck
pnpm build
```
