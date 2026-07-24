# API

## Conventions

- Base path: `/api`
- Swagger UI: `/docs`
- Authentication: `Authorization: Bearer <accessToken>`
- JSON DTO validation rejects unknown properties.
- Successful responses may be wrapped by the global response interceptor.
- Errors are normalized by HTTP and Prisma exception filters.

## Health

### `GET /api/health`

Public endpoint that reports API and database availability.

## Authentication

### `POST /api/auth/login`

Public endpoint. Validates credentials, creates a persistent session, stores a hashed refresh token and returns a token pair plus the user projection.

```json
{
  "email": "admin@erp.local",
  "password": "change-this-development-password",
  "rememberMe": false
}
```

Representative response data:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque-token>",
  "expiresIn": 900,
  "user": {
    "id": "<user-id>",
    "email": "admin@erp.local",
    "firstName": "System",
    "lastName": "Administrator",
    "isActive": true,
    "roles": ["ADMIN"]
  }
}
```

### `POST /api/auth/refresh`

Public endpoint. Accepts the current opaque refresh token, rotates it exactly once and returns a new access/refresh pair.

```json
{
  "refreshToken": "<current-refresh-token>"
}
```

A used, revoked, expired or unknown refresh token is rejected. Clients must replace the stored refresh token after every successful refresh.

### `POST /api/auth/logout`

Authenticated endpoint. Revokes the current persisted session and returns `204 No Content`. The associated access token is rejected on subsequent requests because session state is checked server-side.

## Users

All user administration endpoints require an access token. Permission metadata is additionally enforced where shown.

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `POST` | `/api/users` | `user:create` | Create a user with a hashed password |
| `GET` | `/api/users` | `user:read` | List non-deleted users |
| `GET` | `/api/users/me` | authenticated | Return the current user |
| `GET` | `/api/users/:id` | `user:read` | Return a non-deleted user by ID |
| `PATCH` | `/api/users/:id` | `user:update` | Update profile fields |
| `PATCH` | `/api/users/:id/status` | `user:update` | Activate or deactivate an account |
| `DELETE` | `/api/users/:id` | `user:delete` | Soft-delete and deactivate an account |

`GET /api/users/me` is declared before the parameterized route so `me` is not interpreted as a user ID.

User responses never include password hashes, sessions or refresh-token data. A representative projection is:

```json
{
  "id": "<user-id>",
  "email": "user@example.com",
  "firstName": "Example",
  "lastName": "User",
  "isActive": true,
  "roles": ["USER"],
  "createdAt": "2026-07-24T00:00:00.000Z",
  "updatedAt": "2026-07-24T00:00:00.000Z"
}
```

## Error behavior

Expected business failures use stable error codes such as invalid credentials, invalid refresh token, duplicate email and missing user. Technical Prisma details are not returned to clients.

Common status codes:

- `400`: invalid DTO or request data;
- `401`: missing/invalid access token, invalid credentials, invalid refresh token or inactive session;
- `403`: authenticated but missing required role/permission;
- `404`: requested resource not found;
- `409`: unique-resource conflict;
- `500`: unexpected internal failure.

## Postman

Import:

- `postman/ERP-System.postman_collection.json`
- `postman/ERP-System-Local.postman_environment.json`

Use the environment only for local development and never store production credentials in Postman files committed to the repository.

## Contract validation

```bash
pnpm swagger:generate
pnpm swagger:validate
```

See [backend Swagger conventions](backend/SWAGGER.md).
