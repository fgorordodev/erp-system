# Operations

[← CI/CD](CI_CD.md) · [Roadmap →](ROADMAP.md)

## Environment variables

| Variable | Required by | Notes |
|---|---|---|
| `NODE_ENV` | Backend | `development`, `production` or `test` |
| `BACKEND_PORT` | Backend | Defaults to `3000` |
| `FRONTEND_URL` | Backend | CORS origin |
| `DATABASE_URL` | Backend/database | PostgreSQL connection |
| `JWT_ACCESS_SECRET` | Backend | Minimum 64 characters |
| `JWT_REFRESH_SECRET` | Backend | Minimum 64 characters |
| `JWT_ACCESS_EXPIRES` | Backend | Defaults to `15m` |
| `JWT_REFRESH_EXPIRES` | Backend | Defaults to `7d` |
| `ENCRYPTION_KEY` | Backend | Exactly 64 hexadecimal characters |
| `POSTGRES_*` | Docker Compose | Local database bootstrap |
| `SEED_ADMIN_*` | Seed | Development administrator |

## Health

`GET /api/health` verifies API readiness and PostgreSQL connectivity.

Use it for readiness checks. A separate liveness endpoint may be desirable if future dependencies make readiness more complex.

## Logging and tracing

The API provides:

- request IDs;
- logging interceptor;
- centralized error filters.

Before production, define structured log format, redaction rules, retention, alerting and external telemetry.

## Secrets

- Never commit `.env`.
- Replace every example secret.
- Store production secrets in a managed secret store.
- Rotate secrets using a documented procedure.
- JWT secret rotation requires compatibility planning for already issued tokens.

## Backups and recovery

Production planning should define:

- automated PostgreSQL backups;
- restore testing;
- retention;
- recovery point objective;
- recovery time objective;
- migration rollback/forward strategy.

## Production readiness checklist

- [ ] Rate limiting
- [ ] Audit logging
- [ ] Security-flow automated tests
- [ ] Dependency and image scanning
- [ ] Production Dockerfile
- [ ] Deployment pipeline
- [ ] HTTPS and trusted proxy configuration
- [ ] Structured logs and alerts
- [ ] Database backups and restore test
- [ ] Secret management
- [ ] Tenant boundary or explicit single-organization decision
