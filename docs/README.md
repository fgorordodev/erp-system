# ERP System Documentation

[← Project README](../README.md)

This directory documents the repository as implemented in the audited `feature-roles-permissions` snapshot.

## Documentation map

### System design

- [Architecture](ARCHITECTURE.md)
- [Backend](BACKEND.md)
- [Frontend](FRONTEND.md)
- [Shared packages](PACKAGES.md)
- [Database](DATABASE.md)

### Interfaces and security

- [API reference](API.md)
- [Security](SECURITY.md)

### Engineering and operations

- [Development](DEVELOPMENT.md)
- [Testing](TESTING.md)
- [CI/CD](CI_CD.md)
- [Operations](OPERATIONS.md)
- [Roadmap](ROADMAP.md)

### Decisions

- [Architecture Decision Records](adr/README.md)

## Reading paths

**New contributor:** [Development](DEVELOPMENT.md) → [Architecture](ARCHITECTURE.md) → [Backend](BACKEND.md) → [Testing](TESTING.md)

**Security review:** [Security](SECURITY.md) → [Database](DATABASE.md) → [API](API.md)

**Deployment preparation:** [Operations](OPERATIONS.md) → [CI/CD](CI_CD.md) → [Database](DATABASE.md)

## Documentation rules

- Implemented and planned capabilities must be clearly distinguished.
- Commands must exist in the repository scripts.
- API paths must match controllers.
- Schema descriptions must match `packages/database/prisma/schema.prisma`.
- Architectural decisions that materially constrain future work should receive an ADR.
