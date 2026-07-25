# ADR 0002: Persistent-session authentication

[← ADR index](README.md)

- **Status:** Accepted
- **Date:** 2026-07

## Context

A purely stateless JWT design makes immediate revocation and refresh-token reuse response difficult.

## Decision

Use short-lived JWT access tokens together with database-backed sessions and hashed, one-time refresh tokens.

## Consequences

- Sessions can be revoked.
- Refresh-token reuse can invalidate the token family.
- Authentication requires database availability for session-sensitive operations.
- Expired/revoked rows require lifecycle management.
