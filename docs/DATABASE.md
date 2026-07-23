# Database

## Stack

- PostgreSQL 17
- Prisma 7
- `@prisma/adapter-pg`
- CUID primary keys

## Current model

```text
Role 1 ──────── * User
Role 1 ──────── * RolePermission * ──────── 1 Permission
```

### User

Stores identity and profile data, password hash, role assignment, active state and soft-deletion timestamp.

Important invariants:

- `email` is unique
- `password` contains a bcrypt hash
- every user has one role
- deleted users have `deletedAt != null`
- deletion also sets `isActive = false`

### Role

Represents an RBAC role. `isSystem` identifies protected built-in roles. Role names are unique.

### Permission

Represents one authorization capability. Permission names are unique.

### RolePermission

Explicit many-to-many join table with a composite primary key. Cascading deletes remove joins when a role or permission is removed.

## Seed

The seed performs idempotent upserts for permissions, roles and role-permission assignments:

```bash
pnpm --filter backend db:seed
```

The database must be migrated before seeding.

## Migrations

Development:

```bash
pnpm --filter backend exec prisma migrate dev
```

Production deployment:

```bash
pnpm --filter backend exec prisma migrate deploy
```

The current history contains several consecutive corrective migrations for `isActive`, `deletedAt` and `isSystem`. They are functional history, but should be consolidated only before a shared or production database depends on them. Never rewrite applied production migrations.

## Soft delete policy

Business queries for users must explicitly include `deletedAt: null`. Soft deletion is not globally enforced by Prisma, so every new query must consider whether deleted rows should be visible.

Future options:

- continue explicit filtering for maximum clarity
- create repository helpers
- introduce a Prisma extension after evaluating query behavior carefully

## Future database decisions

Before implementing business modules, define:

- organization or tenant ownership
- branch ownership
- monetary representation and currency
- document numbering and uniqueness scope
- inventory movement ledger model
- audit trail and immutable events
- timezone policy
- decimal precision and rounding rules

## Indexing

Unique indexes currently support email, role name and permission name. Add indexes from measured query patterns, especially for future combinations such as:

- `(organizationId, deletedAt)`
- `(organizationId, sku)`
- `(branchId, productId)`
- `(organizationId, createdAt)`

Avoid speculative indexes without expected access paths.
