# JESA VoR Gateway Operations Guide

## Deployment and environment

Run `pnpm test`, `pnpm check`, and `pnpm build` before creating a checkpoint. Authentication configuration, session signing, database connectivity, and built-in service endpoints are supplied through managed environment variables; secrets must not be committed to source. Publish only after the acceptance checkpoint has been reviewed in the project management interface.

## Protected API contract

The primary contracts are `auth.me`, `requests.catalog`, `requests.list`, `requests.detail`, `requests.create`, `requests.transition`, `approvals.pending`, `approvals.decide`, `validation.list`, `audit.list`, `systemHealth.summary`, `analytics.summary`, `notifications.list`, `notifications.markRead`, and `dcs.acknowledge`. Access is enforced on the server by active session and role procedure. Configuration is administrator-only.

## Validation and state semantics

Request creation resolves canonical equipment and variable references, then executes the ordered nine-check pipeline. The first failed check short-circuits execution and the request is recorded as `REJECTED`; otherwise the request is recorded as `PENDING_OPERATOR` for independent review. Approval decisions require a different authenticated actor from the requester and a comment for rejection. Propagation remains blocked unless the request is accepted and complete passing validation evidence exists.

## Plant integration handoff

The edge adapter contract currently exposes disconnected, stale, timeout, unavailable, configuration-error, and authentication-error health states with a hard-disabled write path. A future plant integration must add an approved endpoint, mutual TLS or equivalent certificate verification, allowlisted mappings, durable event transport, integration tests against a controlled test system, and an operational rollback procedure. Until that work is approved, simulator values are not plant telemetry and no DCS write is performed.

## Logging note

Startup and framework integration logs in `server/_core` are retained as operational diagnostics and are not user-facing product content. Project-owned request and workflow paths do not use debug logging to expose personal identity or sensitive process values.
