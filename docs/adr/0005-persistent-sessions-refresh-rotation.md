# ADR 0005: Persistent sessions and rotating refresh tokens

- Status: Accepted
- Date: 2026-07-24

## Context

Stateless access tokens cannot be revoked immediately after logout or account compromise. Long-lived bearer refresh tokens also create replay risk when reused.

## Decision

Use short-lived JWT access tokens tied to persisted sessions. Generate opaque refresh tokens, store only their hashes and rotate them atomically on every refresh. Record token usage, revocation and replacement relationships.

## Consequences

- logout and server-side revocation invalidate access immediately;
- protected requests require a database session lookup;
- refresh clients must replace tokens after every successful rotation;
- used, revoked, expired and unknown refresh tokens are rejected;
- session cleanup and security-event auditing are required operational concerns.
