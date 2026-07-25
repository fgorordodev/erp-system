# API Reference

[← Database](DATABASE.md) · [Development →](DEVELOPMENT.md)

## Base URLs

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

## Authentication

Use the access token as a bearer token:

```http
Authorization: Bearer <access-token>
```

## Endpoints

| Method | Path | Access | Permission | Purpose |
|---|---|---|---|---|
| GET | `/api/health` | Public | — | Readiness and database check |
| POST | `/api/auth/login` | Public | — | Create session and token pair |
| POST | `/api/auth/refresh` | Public | — | Rotate refresh token |
| POST | `/api/auth/logout` | Authenticated | — | Revoke current session |
| GET | `/api/users/me` | Authenticated | — | Current user |
| POST | `/api/users` | Authenticated | `user:create` | Create user |
| GET | `/api/users` | Authenticated | `user:read` | List non-deleted users |
| GET | `/api/users/:id` | Authenticated | `user:read` | Get user |
| PATCH | `/api/users/:id` | Authenticated | `user:update` | Update profile fields |
| PATCH | `/api/users/:id/status` | Authenticated | `user:update` | Enable/disable user |
| DELETE | `/api/users/:id` | Authenticated | `user:delete` | Soft-delete user |

## Login example

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@erp.local",
    "password": "change-this-development-password"
  }'
```

## Refresh example

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refresh-token>"}'
```

## Response behavior

Successful controller responses are processed by the global response interceptor. Errors are normalized by HTTP and Prisma exception filters. Request identifiers support tracing individual calls.

The generated Swagger document is the authoritative field-level reference for DTOs and status codes.

## Known limitations

- User listing has no pagination or filtering.
- Role assignment has no management endpoint.
- Password change DTOs exist, but no password-change controller endpoint is exposed in the audited snapshot.
- No explicit API version prefix beyond the project version in Swagger.
