# CI/CD

[← Testing](TESTING.md) · [Operations →](OPERATIONS.md)

## Existing CI

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main` and `develop`.

Current job:

1. checkout;
2. setup pnpm;
3. setup Node.js 22 with pnpm cache;
4. `pnpm install --frozen-lockfile`;
5. build `@erp/database`;
6. `pnpm lint`;
7. `pnpm typecheck`;
8. `pnpm build`.

Concurrency cancels obsolete runs for the same workflow/ref.

## Important accuracy note

The backend defines test and Swagger validation scripts, but the audited CI workflow does **not** currently run `pnpm test` or `swagger:validate`. Documentation and badges should not imply otherwise.

## Recommended CI additions

- run unit/integration/e2e tests;
- validate generated OpenAPI;
- verify formatting;
- scan dependencies;
- scan container images;
- upload test coverage;
- validate migrations against an ephemeral PostgreSQL service.

## Deployment status

No deployment workflow or production container image is committed in the audited snapshot.

A future delivery pipeline should separate:

- verification;
- artifact/image build;
- database migration;
- deployment;
- smoke test;
- rollback.

Never run `prisma migrate dev` in production. Use `pnpm db:deploy`.
