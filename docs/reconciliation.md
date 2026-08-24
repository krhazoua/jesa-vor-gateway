# VoR Gateway Requirement Reconciliation

## Scope and source precedence

The newly supplied `pasted_content_5.txt` and `pasted_content_6.txt` were reviewed as supplementary execution requirements. The existing project specification, supplied NE178/process references, and current repository were compared before implementation. The authoritative engineering values retained in the interface are the PAP Attack Reactor context, the UC1 workflow, the nine validation checks, the five request states, the three logical security zones, and the disclosed simulator boundary.

Where the new directives required PostgreSQL, JWT issuance, X.509 verification, SSE, OPC UA, append-only persistence, server-side state transitions, or backend test suites, those requirements exceed the current `web-static` frontend-only project scope. They are not represented as completed backend functionality. The UI now labels prototype authentication, simulator state, and configuration boundaries explicitly rather than implying production integration.

## Implemented in the frontend

The dashboard now starts at `/login` and protects operational routes through a session gate. The login screen contains username, password, certificate posture, issuer validation status, security-zone context, session TTL, and configuration-backed prototype credentials. After successful demo authentication, the user is routed to `/operations`.

All requested navigation surfaces now resolve to working routes: `/operations`, `/requests`, `/requests/:id`, `/approvals`, `/validation`, `/audit`, `/system-health`, `/analytics`, and `/configuration`. The modules share the same request statuses, UC1 terminology, engineering tags, units, NE178 check names, security-zone vocabulary, and simulator disclaimer. Request detail exposes all nine validation checks and traceability values. Approvals present the four-eyes warning and explicit approve/reject confirmation messaging. Audit, system health, analytics, and configuration surfaces use consistent industrial tables and status semantics.

The previous personal identity display was removed from the frontend and replaced with role-based identities such as `Operator`, `Supervisor`, `Process Engineer`, and `VoR Administrator`. The JESA wordmark remains the only corporate branding. No production credential, private key, or external company logo is included.

## Remaining backend boundary

A production deployment still requires a full-stack upgrade and implementation of the server-side contract: persistent canonical database tables, real JWT and refresh handling, X.509 chain validation, RBAC middleware, immutable audit storage, server-enforced state transitions and four-eyes approval, nine-step executable validation, DCS/OPC UA adapter abstraction, SSE event transport, migrations, seed data from the authoritative workbook, and backend/API/integration tests. The static prototype intentionally does not claim these capabilities.

## Validation performed

The frontend TypeScript check and production build pass. The development server was restarted cleanly and the `/login` screen was visually verified. The final repository should be upgraded to the full-stack template before treating authentication, auditability, or DCS propagation as production controls.

## Full-stack upgrade status

The project now uses the full-stack template with signed server-authenticated session cookies, typed tRPC procedures, Drizzle persistence, server-side role middleware, an expanded role enum, and a canonical schema for requests, validation checks, approvals, audit events, request history, equipment, variables, and process snapshots. Approval decisions require an independent authenticated actor and commit the approval, request status, history, and audit event in one database transaction. Illegal terminal-state transitions are rejected server-side.

Audit and request-history writes are append-only at the application contract: no update or delete procedures are exposed, and all decision/transition writes create a new audit event. The connected TiDB environment does not support MySQL triggers, so database-level trigger enforcement could not be applied; a production hardening step should use database permissions or a database engine with append-only trigger support if adversarial direct SQL access is in scope.

The database migration was generated, reviewed, applied successfully, and verified with nine canonical tables. Vitest now covers logout cookie clearing, legal/illegal transitions, independent approver enforcement, role allowlists, validation short-circuiting, and SIL-1 approval marking. The development server restarted cleanly after the dependency upgrade, and the routed dashboard screens were visually verified.

## Authentication claim boundary

The application does not issue a second custom JWT. The server validates the configured authenticated session and exposes the active user through the request context; protected tRPC procedures then enforce active-session status and role allowlists on every call. The UI labels this as a server-authenticated session; token issuance and cryptographic validation remain owned by the configured authentication layer.

## Real-time notification enhancement

The notification system persists recipient-scoped alerts in the `notifications` table for active operators and supervisors. Request transitions and approval decisions emit `STATE_CHANGED` events; the approval-raise procedure emits `APPROVAL_REQUIRED`. The UI reads unread alerts through protected tRPC procedures, marks them read with an ownership-checked mutation, and refreshes immediately through the protected SSE stream with a 15-second polling fallback.

The current event fan-out is process-local and deliberately best-effort: persisted rows remain the source of truth, while the in-process bus and SSE stream provide low-latency updates to connected sessions on the same runtime instance. For multi-instance or always-on production delivery, use Reserved Hosting or an external durable pub/sub broker so events are not limited to a single process.

## Final acceptance pass

The full-stack implementation now exposes a protected `requests.catalog` query and `requests.create` mutation. The mutation binds the requester to the authenticated server session, resolves equipment and variable references from the engineering catalog, generates a gateway request identifier, executes the nine-step validation pipeline with short-circuit behavior, and atomically persists the request, validation evidence, and `REQUEST_CREATED` audit event. Valid submissions enter `PENDING_OPERATOR`; validation failures are persisted as `REJECTED`. The UI supports both structured Form mode and JSON mode, request search, status/equipment/variable/use-case/priority/date filters, clamped pagination, and explicit catalog-unavailable feedback.

Approval actions now require an explicit confirmation dialog. Approval may proceed without a note, while rejection requires a comment of at least three characters before the protected mutation can be called. Validation no longer renders inferred PASS rows when canonical evidence is absent; it presents a truthful unavailable state instead. Analytics now exposes canonical status, source use-case, priority, SIL class, approval decision, validation-failure, throughput, transition, and approval-latency series with filtered empty states; no percentage or operational value is fabricated.

The OT edge remains disconnected and read-only by design. No plant write or live OPC UA connection is claimed by the application. Simulator baselines are visibly labeled, canonical database rows are preferred when available, and exports include source, filter, timestamp, and boundary metadata.

The final automated suite contains 71 passing tests, including request-creation router coverage for successful and validation-rejected paths, request pagination behavior, approval presentation semantics, validation evidence fallback semantics, detailed analytics aggregation semantics, authentication, RBAC, state transitions, DCS acknowledgment, notifications, CSV/JSON/PDF exports, edge adapter behavior, validation rerun coverage, and simulation controls.

## Premium rework specification reconciliation

The newly supplied premium rework specification was reviewed against the current full-stack implementation. Routed Requests, Approvals, Request Detail, Validation, Audit, and Analytics surfaces now avoid substituting hardcoded operational rows when canonical database data is unavailable. These surfaces expose explicit loading, error, and empty states instead. Pending approvals are returned with canonical request, equipment, variable, unit, SIL, and process-value context; approval decisions remain server-enforced and four-eyes protected. Engineers and administrators can trigger a server-side validation rerun against canonical catalog values, with refreshed evidence and an audit event. Audit and analytics reports support CSV, JSON, and staged PDF export.

## Master repair specification reconciliation

The master repair prompt was audited against the running full-stack application. The implementation now covers the required protected routes, canonical request filters, engineering request-detail context, server-side validation and approval boundaries, persistent audit source, detailed analytics aggregation, JSON/CSV/PDF reporting, truthful simulator/read-only disclosures, and responsive route behavior. Remaining requirements are explicitly treated as integration boundaries rather than simulated features.

The requested mapping, propagation, final mapping verification, OPC UA write, workbook import, and `/api/v1/*` REST surface are not presented as completed features. The current application deliberately remains behind a disconnected, read-only edge boundary and does not fabricate plant connectivity, workbook rows, DCS write success, or source data. These capabilities require an approved plant-integration contract, source dataset import decision, credential/certificate configuration, and controlled FAT/SAT validation before implementation.

## Master repair follow-up

The Operations surface now resolves canonical request rows against the engineering catalog when persisted rows are present, showing source use case, variable name/tag, PV, requested SP, unit, SIL class, and computed delta. The static approval-count badge was removed so navigation does not imply a database count that has not been queried.

System Health now performs a protected database probe and reports database latency/reachability, derived zone readiness, validation engine availability, active-session authentication, audit-store reachability, and notification-stream readiness. The DCS/OPC UA edge remains explicitly disconnected and read-only; no plant status or write capability is inferred from the probe.


## Supplied specification follow-up

The supplied specification requested a dedicated NE178 Compliance surface. The application now exposes `/compliance` behind the protected route gate and navigation. Its six-row matrix links Authentication & Authorization, Verification, Mapping, Propagation, Acceptance, and Mapping Verification to the corresponding evidence route. Propagation and Mapping Verification are visibly marked as gated because the read-only edge adapter has no configured plant write path.

The login boundary remains the configured server-authenticated session/OAuth layer rather than a second custom username/password or certificate issuer. The UI does not collect or persist private credentials or certificate material. This is intentional: production credential issuance, X.509 chain validation, PostgreSQL migration/seed parity, and OPC UA integration require approved deployment contracts and are not simulated.
