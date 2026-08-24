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

## Canonical analytics expansion

The protected `analytics.summary` procedure now derives detailed measures from persisted request, request-history, approval, variable, and validation rows. Supported filtered series include current request status, source use-case, priority, SIL class, approval decision, validation-failure concentration, requests by creation day, state transitions, and approval latency. Date and department filters apply to the relevant canonical source timestamps and request department joins.

The Analytics dashboard renders the series as decision-path and approval-latency charts plus data-driven insight cards. CSV, JSON, and PDF exports include the detailed distributions and active filter metadata. When no canonical rows match the authenticated scope, the dashboard reports an explicit no-data state and does not substitute simulator values; simulator telemetry remains confined to the Operations preview.

## Master audit and health follow-up

The Audit route supports independent request-ID, user-ID, role, event, state/result, free-text, and inclusive UTC date filters. Filters compose before typed sorting and clamped pagination; the active filtered result set is the same set used by CSV, JSON, and PDF export controls.

The Operations route uses canonical equipment and variable catalog labels whenever persisted request rows are available. In simulator-only preview mode, request cards and telemetry are visibly labeled as isolated simulator content. System Health reports a protected database probe and derived application subsystem readiness; the DCS/OPC UA edge remains disconnected, read-only, and unavailable for plant writes until an approved integration contract is supplied.

## Acceptance-surface follow-up

The protected application also resolves `/dashboard` to Operations and `/history` to the append-only Audit surface so both specification aliases retain the same session and role gates as their canonical routes. Pending approval records include joined equipment and variable context, persisted validation outcomes, and the request-creation reason; the confirmation dialog displays these values before a four-eyes decision is submitted. No approval row is synthesized in the client when the protected query is empty.
