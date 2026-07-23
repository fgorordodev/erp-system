# Security

## Current security model

The API is deny-by-default. `JwtAuthGuard`, `RolesGuard` and `PermissionsGuard` are registered globally. Public endpoints must opt out explicitly with `@Public()`.

```text
Bearer token
   │
   ▼
JWT signature validation
   │
   ▼
Database-backed user validation
   ├── user exists
   ├── isActive = true
   └── deletedAt = null
   │
   ▼
AuthUser { id, email, role, permissions }
   │
   ▼
Role and permission authorization
```

## Passwords

Passwords are hashed with bcrypt using 12 salt rounds. Plaintext passwords must never be returned, logged or included in generic update DTOs.

User profile updates intentionally exclude the password. Password changes require a separate authenticated flow that verifies the current password or an authorized administrative action.

## JWT

The security package can generate and verify access and refresh JWTs. Access-token validation is active through Passport JWT. Authentication endpoints, refresh-token rotation and revocation are not implemented yet.

Required controls for the upcoming authentication module:

- short-lived access tokens
- independently generated access and refresh secrets
- hashed refresh tokens at rest
- refresh-token rotation
- reuse detection or session revocation
- logout revocation
- maximum active-session policy
- generic login errors to prevent account enumeration
- rate limiting on authentication endpoints

## RBAC

Roles and permissions are seeded idempotently from constants. Controllers use `@Permissions()` and optionally `@Roles()`.

Permission checks currently use AND semantics:

```ts
requiredPermissions.every((permission) =>
  user.permissions.includes(permission),
)
```

A route declaring multiple permissions therefore requires all of them.

## Encryption

`EncryptionService` uses AES-256-GCM with a random 16-byte IV and authentication tag. `ENCRYPTION_KEY` must be exactly 32 bytes represented as 64 hexadecimal characters.

Use encryption only for data that must later be decrypted. Passwords and refresh tokens should be hashed, not encrypted.

## HTTP hardening

- Helmet is enabled globally.
- CORS permits the configured `FRONTEND_URL` and credentials.
- DTO validation strips unknown properties and rejects non-whitelisted fields.
- request IDs support correlation across logs and responses.
- database implementation details are hidden behind generic Prisma errors.

## Secrets

Never commit real secrets. Generate independent values:

```bash
openssl rand -hex 64
openssl rand -hex 64
openssl rand -hex 32
```

Store production secrets in a dedicated secret manager, not in the repository or Docker image.

## Known security gaps

The current repository is a strong foundation but is not production-complete. Remaining controls include:

- functional authentication and session lifecycle
- rate limiting and brute-force protection
- password policy beyond minimum length
- password reset and account recovery
- security event audit logs
- CSRF decision based on refresh-token transport
- dependency and container vulnerability scanning
- automated authorization and authentication tests
- protection against disabling or deleting the final system administrator
