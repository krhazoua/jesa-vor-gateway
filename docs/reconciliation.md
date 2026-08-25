# VoR Gateway Requirement Reconciliation

## Scope and source precedence

The supplied final audit specification and engineering references were compared against the current JESA VoR Gateway repository before targeted corrections. The existing implementation is the baseline: changes preserve its React, tRPC, Express, Drizzle, authentication, and protected-route architecture. The application remains specifically focused on the PAP Attack Reactor, UC1 workflow, NE178-aligned governance, five request statuses, three logical security zones, and the disconnected read-only OT boundary.

## Current full-stack implementation

The project uses signed server-authenticated session cookies, typed protected tRPC procedures, Drizzle persistence, server-side role middleware, and a canonical schema for requests, validation checks, approvals, audit events, request history, equipment, variables, notifications, certificate trust anchors, reconciliation evidence, and activation gates. Protected procedures independently enforce authentication and role allowlists. Configuration is administrator-only. Approval decisions require an independent authenticated actor and are committed with the approval, request status, history, and audit event in one transaction. Illegal terminal-state transitions are rejected server-side.

The login and route boundary protects `/dashboard`, `/requests`, `/validation`, `/approvals`, `/history`, `/analytics`, `/configuration`, and `/system-health`; unauthenticated access is redirected to `/login`. The UI uses role-based identity language and does not expose private credentials or personal-name content. No production secret is placed in frontend source.

## Functional route coverage

The routed application includes Operations/Dashboard, Requests, Request Detail, Approvals, Validation, Audit, System Health, Analytics, NE178 Compliance, and Configuration. Data-driven surfaces use protected backend queries and provide loading, empty, error, retry, and success states where applicable. Requests support search, equipment, variable, status, priority, use-case, date, sorting, and bounded pagination. Request Detail exposes process context, validation, decision, approval, mapping, propagation, final-verification, and audit evidence from the backend.

Validation executes the persisted nine-check pipeline with fatal short-circuit behavior and displays backend-derived results rather than inferred frontend rows. Approvals show only eligible pending requests, require explicit confirmation, block requester self-approval, and require a meaningful rejection comment. Audit uses persistent history and decision data, supports filtering, sorting, pagination, CSV/JSON/PDF export, and expandable complete metadata payloads. Analytics derives status, transition, approval-latency, throughput, SIL, use-case, priority, and validation-failure series from persisted data.

## Governance and certificate controls

The catalog workflow supports protected CSV import with validation, object-storage provenance, row counts, and append-only import audit events. Engineering reconciliation is a dry-run comparison against the local authoritative catalog and never mutates canonical rows or plant systems. Exact matches remain pending external sign-off; mismatches block the FAT/SAT gate. External sign-off requires certificate-chain validation against an active, non-expired trust anchor and independent reviewers. Trust-anchor expiry policy is configurable, expiry alerts are idempotent, rotation evidence is persisted, and administrator retirement/revocation requires a distinct active replacement plus verified evidence. Retired and revoked anchors cannot validate certificates.

The master gate can arm only after the required reconciliation, sign-off, certificate, and FAT/SAT controls are satisfied. Activation readiness records evidence and remains plant-write-disabled. Configuration shows the source as `LOCAL AUTHORITATIVE DATASET` and the production adapter as `NOT CONFIGURED`; accessible tooltips explain both states.

## Authoritative engineering master boundary

The application now exposes a local `EngineeringMasterRepository` abstraction backed by the existing canonical database. Reconciliation routes through this abstraction, so the prototype has a coherent authoritative source without inventing a production endpoint, protocol, credential, or catalog API. A future production adapter may implement the same interface after an approved integration contract is supplied. Until then, the local data source is explicitly authoritative for the prototype, and the production adapter remains `NOT CONFIGURED`.

## OT, propagation, and mapping boundary

The edge adapter contract is explicitly disconnected and read-only. Its configuration requires `writeEnabled: false`; live read-only mode requires an endpoint and mutual TLS, while disconnected mode has no endpoint. System Health reports the edge as disconnected or not configured rather than implying OPC UA or plant availability. Simulator behavior is visibly labeled as simulation and is not presented as a real plant write. Mapping, propagation, final mapping verification, workbook import, and `/api/v1/*` REST exposure remain integration boundaries unless a formally approved plant contract is supplied.

## Notifications and system health

Recipient-scoped notifications are persisted for request transitions, approval requirements, and certificate-expiry warning/critical windows. Stable deduplication keys make scheduled expiry evaluation safe to repeat. The platform-managed cron-only callback is ready for deployment scheduling; no in-process timer is used. The notification stream uses protected SSE with a polling fallback. System Health performs a protected database probe, reports backend subsystem states, refreshes automatically every 30 seconds while active, and exposes a manual refresh control with explicit error feedback.

## Security and audit limitations

Audit and request-history writes are append-only at the application contract: no update or delete procedures are exposed, and governance mutations create new audit events. The connected TiDB environment does not support the database trigger strategy used by some append-only designs; database permissions or a database engine with appropriate trigger support would be required if adversarial direct SQL access is in scope. Certificate material is validated server-side and stored through protected evidence paths. Secrets are not exposed in the frontend.

## Verification record

The latest requirements pass includes full Vitest coverage, TypeScript validation, production build verification, authenticated desktop route review, responsive Configuration and Audit review, browser/server log inspection, and documentation updates. The suite currently contains 111 passing tests. Historical Vite diagnostics from earlier iterations remain in trimmed development logs, but no current build, TypeScript, test, or route-rendering failures were observed after the latest corrections.

The remaining deployment prerequisite is operational rather than fabricated in code: schedule the certificate-expiry callback after deployment and supply an approved production master contract before binding any external engineering system. The application is otherwise designed to remain functional on its local canonical dataset and disconnected read-only edge.
