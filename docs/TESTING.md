# Testing Strategy

[← Development](DEVELOPMENT.md) · [CI/CD →](CI_CD.md)

## Current state

The backend is configured for Jest and contains an e2e test scaffold. The root `test` task runs available package test scripts, but automated coverage is not yet broad enough to protect the security-critical workflows.

The frontend package currently has no `test` script.

## Priority test pyramid

### Unit tests

Prioritize:

- credential validation;
- token expiration calculations;
- role/permission guards;
- mappers and transforms;
- user soft-delete rules.

### Integration tests

Use a real isolated PostgreSQL database for:

- refresh-token rotation;
- token reuse and concurrent consumption;
- logout revocation;
- user creation and default role;
- duplicate email behavior;
- seed idempotency.

### End-to-end tests

Cover:

1. health check;
2. administrator login;
3. authenticated current-user retrieval;
4. user creation under permissions;
5. forbidden action under insufficient permissions;
6. refresh;
7. logout;
8. rejected use of revoked credentials.

## Commands

```bash
pnpm test
pnpm --filter @erp/backend test
pnpm --filter @erp/backend test:watch
pnpm --filter @erp/backend test:cov
pnpm --filter @erp/backend test:e2e
```

## Quality threshold recommendation

Before production, define explicit coverage thresholds and make security-flow integration tests mandatory in CI. Coverage percentage alone is insufficient; assertions must validate revocation and authorization behavior.
