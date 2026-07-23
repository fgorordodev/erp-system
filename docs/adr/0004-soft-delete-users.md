# ADR 0004: Soft deletion for users

- Status: Accepted
- Date: 2026-07-23

## Context

ERP records often need historical attribution. Physically deleting users can break auditability and relationships.

## Decision

Soft-delete users with `deletedAt` and disable them by setting `isActive` to false.

## Consequences

- historical references can be retained
- all relevant user queries must filter `deletedAt: null`
- deleted users cannot authenticate
- restoration requires an explicit future use case rather than status toggling
