# Contributing

## Branch model

- `main`: production-ready history
- `dev`: integration branch
- `feature/<name>`: new capability
- `refactor/<name>`: behavior-preserving improvements
- `fix/<name>`: defect correction
- `docs/<name>`: documentation-only work

Create branches from an updated `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/auth-module
```

## Commit convention

Use Conventional Commit-style messages:

```text
feat(auth): implement login
fix(users): prevent duplicate email update
refactor(security): simplify authorization guards
docs: document database conventions
test(auth): cover refresh token rotation
chore(ci): add test job
```

Keep commits focused and compilable when practical.

## Local quality checks

Before committing:

```bash
pnpm format
pnpm lint
pnpm --filter backend build
```

Run relevant tests when they exist. Do not merge code that depends on local uncommitted migrations or secrets.

## Pull requests

A pull request should include:

- problem and intended outcome
- important implementation decisions
- database migration notes
- security implications
- API contract changes
- verification steps
- screenshots only when a UI exists

## Code guidelines

- Keep controllers limited to transport concerns.
- Place application logic in services or use cases.
- Use dependency injection; do not manually instantiate infrastructure services.
- Validate all external input with DTOs.
- Do not expose persistence entities blindly when they contain sensitive fields.
- Use domain-specific exceptions for expected business failures.
- Let global filters handle unexpected technical failures.
- Require permissions on administrative endpoints.
- Maintain soft-delete filtering where applicable.
- Avoid new architectural layers without demonstrated complexity.

## Database changes

1. Update `schema.prisma`.
2. Create a named migration.
3. Inspect generated SQL.
4. Update seed data if required.
5. Document compatibility or data migration concerns.

Never edit or delete migrations already applied to shared or production databases.

## Documentation

Update documentation in the same pull request when changing:

- environment variables
- endpoint behavior
- architecture or security decisions
- database models
- setup commands
- roadmap status
