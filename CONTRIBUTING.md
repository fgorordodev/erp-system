# Contributing

## Branch model

- `main`: stable project history.
- `dev`: integration branch.
- `feature/<scope>`: new capability.
- `fix/<scope>`: defect correction.
- `refactor/<scope>`: behavior-preserving structural work.
- `docs/<scope>`: documentation-only work.

Create branches from an updated `dev` branch:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/inventory-module
```

## Commit convention

Use Conventional Commit-style messages:

```text
feat(auth): implement refresh-token rotation
fix(ci): build database package before lint
refactor(users): isolate Prisma projections
docs: update architecture and roadmap
test(auth): cover token reuse detection
chore(deps): update workspace tooling
```

Keep each commit focused and leave the repository in a verifiable state.

## Local setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Do not commit real secrets, generated local environment files or changes that depend on uncommitted migrations.

## Quality gate

Run the same core checks used by CI:

```bash
pnpm --filter @erp/database build
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm format:check
```

`@erp/database` must be generated and built before typed ESLint analyzes consumers in a clean environment.

## Pull requests

A pull request should describe:

- the problem and intended outcome;
- significant implementation decisions;
- database migration and compatibility concerns;
- security implications;
- API contract changes;
- verification commands and results;
- screenshots when user-facing UI changes exist.

Keep pull requests small enough to review. Avoid mixing unrelated refactors, feature work and formatting changes.

## Code guidelines

- Keep controllers focused on transport and HTTP concerns.
- Place workflows in application services and narrow persistence details behind projections/inputs.
- Use dependency injection instead of manually constructing infrastructure services.
- Validate every external input through DTOs.
- Never expose password hashes, refresh-token hashes or raw Prisma entities in API responses.
- Use business exceptions for expected domain failures and global filters for technical failures.
- Preserve deny-by-default authentication and explicit RBAC metadata.
- Filter soft-deleted records consistently.
- Use `@backend/*` and package exports rather than fragile deep relative imports.
- Add architectural layers only when a demonstrated requirement justifies them.

## Database changes

1. Update `packages/database/prisma/schema.prisma`.
2. Generate a descriptive migration with `pnpm db:migrate`.
3. Inspect the generated SQL.
4. Update seed data and projections when required.
5. Regenerate Prisma Client.
6. Run the complete quality gate.
7. Document data migration or compatibility risks.

Never edit or remove migrations already applied to a shared environment.

## Documentation

Update documentation in the same pull request when changing:

- environment variables or setup commands;
- endpoint behavior or response contracts;
- architecture or security decisions;
- Prisma models and migrations;
- workspace scripts or CI behavior;
- roadmap status.

Accepted ADRs represent historical decisions. Add a superseding ADR rather than silently rewriting an accepted decision, except while correcting documentation before the decision has been relied upon externally.
