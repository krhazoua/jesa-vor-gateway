# VoR Gateway Requirement Reconciliation

## Scope and source precedence

The newly supplied `pasted_content_5.txt` and `pasted_content_6.txt` were reviewed as supplementary execution requirements. The existing project specification, supplied NE178/process references, and current repository were compared before implementation. The authoritative engineering values retained in the interface are the PAP Attack Reactor context, the UC1 workflow, the nine validation checks, the five request states, the three logical security zones, and the disclosed simulator boundary.

Where the new directives required PostgreSQL, JWT issuance, X.509 verification, SSE, OPC UA, append-only persistence, server-side state transitions, or backend test suites, those requirements exceed the current `web-static` frontend-only project scope. They are not represented as completed backend functionality. The UI now labels prototype authentication, simulator state, and configuration boundaries explicitly rather than implying production integration.

## Implemented in the frontend

The dashboard now starts at `/login` and protects operational routes through a session gate. The login screen contains username, password, certificate posture, issuer validation status, security-zone context, session TTL, and configuration-backed prototype credentials. After successful demo authentication, the user is routed to `/operations`.

All requested navigation surfaces now resolve to working routes: `/operations`, `/requests`, `/requests/:id`, `/approvals`, `/validation`, `/audit`, `/system-health`, `/analytics`, and `/configuration`. The modules share the same request statuses, UC1 terminology, engineering tags, units, NE178 check names, security-zone vocabulary, and simulator disclaimer. Request detail exposes all nine validation checks and traceability values. Approvals present the four-eyes warning and explicit approve/reject confirmation messaging. Audit, system health, analytics, and configuration surfaces use consistent industrial tables and status semantics.

The previous personal identity display was removed from the frontend and replaced with functional identities such as `Operator Shift A` and the `OPERATOR` role. The JESA wordmark remains the only corporate branding, paired with the VoR gate mark. No production credential, private key, or external company logo is included.

## Remaining backend boundary

A production deployment still requires a full-stack upgrade and implementation of the server-side contract: persistent canonical database tables, real JWT and refresh handling, X.509 chain validation, RBAC middleware, immutable audit storage, server-enforced state transitions and four-eyes approval, nine-step executable validation, DCS/OPC UA adapter abstraction, SSE event transport, migrations, seed data from the authoritative workbook, and backend/API/integration tests. The static prototype intentionally does not claim these capabilities.

## Validation performed

The frontend TypeScript check and production build pass. The development server was restarted cleanly and the `/login` screen was visually verified. The final repository should be upgraded to the full-stack template before treating authentication, auditability, or DCS propagation as production controls.

## Full-stack upgrade status

The project now uses the full-stack template with Manus OAuth-backed signed session cookies, typed tRPC procedures, Drizzle persistence, server-side role middleware, an expanded role enum, and a canonical schema for requests, validation checks, approvals, audit events, request history, equipment, variables, and process snapshots. Approval decisions require an independent authenticated actor and commit the approval, request status, history, and audit event in one database transaction. Illegal terminal-state transitions are rejected server-side.

Audit and request-history writes are append-only at the application contract: no update or delete procedures are exposed, and all decision/transition writes create a new audit event. The connected TiDB environment does not support MySQL triggers, so database-level trigger enforcement could not be applied; a production hardening step should use database permissions or a database engine with append-only trigger support if adversarial direct SQL access is in scope.

The database migration was generated, reviewed, applied successfully, and verified with nine canonical tables. Vitest now covers logout cookie clearing, legal/illegal transitions, independent approver enforcement, role allowlists, validation short-circuiting, and SIL-1 approval marking. The development server restarted cleanly after the dependency upgrade, and the routed dashboard screens were visually verified.

## Authentication claim boundary

The application does not issue a second custom JWT. The full-stack template validates the Manus OAuth session on the server and exposes the authenticated user through the request context; protected tRPC procedures then enforce active-session status and role allowlists on every call. The UI labels this as a server-authenticated JWT session because it is bound to the template's signed session mechanism, but token issuance and cryptographic validation remain owned by the Manus authentication layer.

## Real-time notification enhancement

The notification system persists recipient-scoped alerts in the `notifications` table for active operators and supervisors. Request transitions and approval decisions emit `STATE_CHANGED` events; the approval-raise procedure emits `APPROVAL_REQUIRED`. The UI reads unread alerts through protected tRPC procedures, marks them read with an ownership-checked mutation, and refreshes immediately through the protected SSE stream with a 15-second polling fallback.

The current event fan-out is process-local and deliberately best-effort: persisted rows remain the source of truth, while the in-process bus and SSE stream provide low-latency updates to connected sessions on the same runtime instance. For multi-instance or always-on production delivery, use Reserved Hosting or an external durable pub/sub broker so events are not limited to a single process.
