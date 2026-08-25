# VoR Gateway Rebuild Checklist

- [x] Inspect the complete contents of all newly supplied pasted references.
- [x] Inspect the current repository structure, source files, routes, and package scripts.
- [x] Compare new requirements with existing frontend behavior and document conflicts or unsupported backend requirements.
- [x] Add functional route/page coverage for every requested sidebar destination.
- [x] Add a prototype authentication entry flow and protected-route behavior within frontend scope.
- [x] Add role-aware UI visibility and explicit simulator/prototype boundaries.
- [x] Improve request detail, approvals, validation, audit, system health, analytics, and configuration surfaces with coherent data models.
- [x] Run type check, build, repository compliance scan, and interaction/navigation verification.
- [x] Save a final checkpoint and deliver the updated project.

- [x] Resolve full-stack scaffold merge conflicts and preserve the JESA frontend.
- [x] Add canonical VoR schema for requests, validation checks, approvals, audit events, and state history.
- [x] Implement server-enforced JWT session claims and role-based procedures.
- [x] Implement four-eyes approval enforcement and immutable audit/state transitions.
- [x] Add tRPC procedures for request listing, detail, approval, validation, audit, health, and analytics.
- [x] Wire frontend pages to protected tRPC queries and mutations.
- [x] Generate and apply the database migration, then verify the schema.
- [x] Add and run Vitest coverage for auth, RBAC, approvals, audit immutability, and transitions.
- [x] Run the full build and end-to-end verification, then save the upgraded checkpoint.

- [x] Clarify and enforce server-auth claim semantics without overstating custom JWT issuance beyond Manus OAuth session cookies.
- [x] Add database-supported or application-enforced append-only audit protection with explicit test coverage.
- [x] Wire validation, system health, analytics, configuration, and request detail to protected tRPC procedures.
- [x] Add direct approval mutation tests and audit immutability tests.
- [x] Save a new post-upgrade checkpoint after all gaps are closed.

- [x] Add protected analytics aggregations for request state transitions and average approval times.
- [x] Build visual transition and approval-time charts in the Analytics module with honest empty-state fallbacks.
- [x] Add tests for analytics aggregation output and run the full verification suite.
- [x] Save and deliver the analytics enhancement checkpoint.

- [x] Add protected analytics inputs for date range and department, with server-side filtering.
- [x] Add date-range and department controls to the Analytics dashboard and preserve selected filter state.
- [x] Add tests for date filtering, department filtering, and filtered chart payloads.
- [x] Save and deliver the analytics filter enhancement checkpoint.

- [x] Add router- or DB-helper-level tests proving filtered analytics payloads change for date and department filters, including empty-result behavior.

- [x] Add integration fixtures for authenticated login and server authorization context.
- [x] Add integration coverage for all five VoR statuses and legal lifecycle transitions.
- [x] Add integration coverage for validation short-circuiting and propagation blocking.
- [x] Add a DCS acknowledgment contract and integration coverage for accepted, rejected, and blocked propagation.
- [x] Run the full integration test suite, type check, and production build.
- [x] Save and deliver the integration-test checkpoint.

- [x] Assert every legal transition from PENDING_OPERATOR succeeds: ACCEPTED, REJECTED, DUPLICATED, and EXPIRED.
- [x] Exercise the protected dcs.acknowledge procedure with success, non-accepted blocking, and failed-evidence blocking fixtures.

- [x] Inspect the current request-state and approval mutation seams for notification event creation.
- [x] Add persisted notifications and recipient/read-state schema with migration.
- [x] Emit notifications for request state changes and approval-required events.
- [x] Add protected notification queries, read-state mutations, and realtime delivery with a fallback polling path.
- [x] Add operator and supervisor notification UI with unread counts and read controls.
- [x] Add tests for recipient filtering, event creation, read-state changes, and realtime/polling behavior.
- [x] Run migration, integration tests, build, and visual verification.
- [x] Save and deliver the notification-system checkpoint.

- [x] Add integration tests proving transition and approval mutations create the correct persisted notification events.
- [x] Add read-state ownership tests and transport/fallback coverage for notification delivery.
- [x] Capture desktop and mobile screenshots showing the notification tray and unread alert controls.

- [x] Add persistence-level notification row assertions for transition and approval-required event creation.
- [x] Add notification read ownership and SSE/polling fallback integration tests.
- [x] Add a deterministic preview-only unread alert state for visual verification without seeding production data.
- [x] Capture desktop and mobile screenshots with the unread alert tray visible.

- [x] Assert notification insert rows contain recipient ids, event types, severity, and request linkage.
- [x] Assert read-state updates cannot cross recipient ownership boundaries.
- [x] Test the protected SSE stream handshake and event delivery.
- [x] Test polling fallback refresh behavior when the realtime stream is unavailable.

- [x] Assert notification insert rows contain recipient ids, event types, severity, and request linkage.
- [x] Assert read-state updates cannot cross recipient ownership boundaries with affected-row behavior.
- [x] Test the protected SSE stream handshake and event delivery directly.
- [x] Test the polling fallback contract used when EventSource is unavailable.

- [x] Test notifications.markRead against another recipient’s notification and assert updated=false through the actual protected procedure.
- [x] Add a client notification refresh helper and test polling refetch when EventSource is unavailable.

- [x] Ensure Vitest discovers the client notification fallback test and rerun it.
- [x] Wire the notification fallback helper into the SSE/polling UI flow.
- [x] Add a direct notificationReadResult affected-row ownership test.
- [x] Save a new checkpoint after the notification changes.

- [x] Add a direct notificationReadResult test covering successful ownership and cross-recipient/zero-row rejection.

- [x] Remove the secondary logo mark beside the JESA wordmark.
- [x] Refine the overall dashboard composition, typography, spacing, surfaces, and status treatments so the interface feels intentionally authored and less generative.
- [x] Re-run tests, production build, and desktop/mobile visual verification for the design refinement.
- [x] Save a checkpoint for the refined dashboard.

- [x] Remove any remaining secondary gate-mark logo from routed module shells.
- [x] Apply and verify the refined authored visual treatment consistently across module pages.
- [x] Save a new post-refinement checkpoint after all remaining gaps are closed.

- [x] Visually verify approvals, analytics, and configuration routed pages after the shared shell refinement.
- [x] Save a final checkpoint after broader routed-page verification.

- [x] Save the post-refinement checkpoint after approvals, analytics, and configuration verification.

- [x] Define a disconnected read-only edge adapter contract and configuration model.
- [x] Add explicit adapter health, stale-data, timeout, and configuration failure states without plant connectivity.
- [x] Add contract tests for configuration validation, read-only snapshots, failure mapping, and no-write guarantees.
- [x] Update system health and configuration UI to expose the disconnected adapter boundary honestly.
- [x] Run tests, type check, production build, and save the adapter checkpoint.

- [x] Save the post-adapter checkpoint after the disconnected read-only verification.

- [x] Create a reusable edge-adapter health and configuration dashboard component.
- [x] Integrate the component into Operations and System Health views with loading and failure states.
- [x] Add component contract tests and responsive visual verification.
- [x] Save a checkpoint for the edge-adapter dashboard component.

- [x] Add EdgeAdapterHealthCard tests for loading, disconnected, healthy, configuration, and error presentation states.
- [x] Save a new checkpoint after the edge-adapter dashboard component changes and verification are complete.

- [x] Save the post-component checkpoint after expanded tests and responsive verification.

- [x] Tighten the operations shell around current plant context, alarm priority, and control-room data hierarchy.
- [x] Refine status, request, audit, and adapter surfaces for industrial readability and actionable states.
- [x] Standardize routed modules and responsive behavior while preserving explicit prototype/readiness boundaries.
- [x] Add or update tests and perform desktop/mobile visual verification for the industrial refinement.
- [x] Save a checkpoint for the industrial-ready UI refinement.
- [x] Fix the System Health boundary-lineage strip so its nodes remain horizontal and readable.
- [x] Perform mobile visual verification for the industrial UI refinement after the latest Operations/System Health styling changes.
- [x] Save a new checkpoint after the industrial-ready UI refinement passes final verification.
- [x] Save the post-industrial-refinement checkpoint after final mobile review.

- [x] Add reusable CSV export helpers for audit and filtered analytics data.
- [x] Add PDF report export helpers with source, filters, timestamps, and report metadata.
- [x] Integrate CSV/PDF export controls into Audit and Analytics views.
- [x] Add export contract tests and verify desktop/tablet/mobile interactions.
- [x] Resolve export report typing for canonical analytics metrics that omit simulator-only department and day fields.
- [x] Narrow Analytics report rows to export-safe scalar values for the generic report contract.
- [x] Save a checkpoint for audit and analytics exports.
- [x] Save the post-export checkpoint after CSV/PDF tests and responsive verification.

- [x] Add PDF-generation loading, progress, completion, and error states to the export action group.
- [x] Add the typed async PDF progress helper consumed by the export action group.
- [x] Keep CSV export available while PDF generation is active and preserve accessible status messaging.
- [x] Add deterministic tests for PDF progress state transitions and verify responsive presentation.
- [x] Save a checkpoint for the PDF progress-feedback enhancement.
- [x] Save the post-progress checkpoint after PDF state tests and responsive review.

- [x] Add typed audit-table sorting with accessible column controls.
- [x] Add paginated audit navigation with page-size and result-count context.
- [x] Preserve full filtered audit exports while making on-screen pagination clear.
- [x] Add sorting/pagination contract tests and verify desktop/tablet/mobile layouts.
- [x] Correct the malformed aria-sort JSX expression in the audit table header.
- [x] Rename the derived audit page model to avoid shadowing the numeric page state.
- [x] Replace all remaining derived audit page property references after the rename.
- [x] Save a checkpoint for the audit table navigation enhancement.
- [x] Save the post-audit-navigation checkpoint after filtering, sorting, pagination, and tablet verification.

- [x] Reconcile and document the supplied acceptance specification against the current OAuth/session architecture and live read-only OT boundary.
- [x] Harden direct unauthenticated route behavior to redirect to /login and preserve server-enforced authorization.
- [x] Verify and close role visibility gaps, especially ADMIN-only Configuration navigation and access behavior.
- [x] Import the Settings2 icon required by the Operations Configuration navigation entry.
- [x] Close the Configuration branch after adding the explicit 403 fallback so the routed module compiles.
- [x] Complete missing request search/filter/pagination/data workflow interactions without replacing protected backend contracts.
- [x] Align Operations KPI mapping with canonical request fields that do not expose unit or SIL columns.
- [x] Complete approval modal/result feedback and validation/audit/analytics workflow gaps found in the specification audit.
- [x] Remove hardcoded analytics use-case percentages and show an honest unavailable state when the backend contract lacks UC aggregation.
- [x] Complete representative route-by-route loading, empty, error, retry, export, SSE, simulator, accessibility, and responsive QA across all routed surfaces; document limits.
- [x] Verify representative loading/empty/export/SSE/simulator/accessibility/responsive states across the final routed surfaces.
- [x] Add and update README, architecture, deployment, API, validation, process, QA, reconciliation, and logging-boundary documentation.
- [x] Update reconciliation documentation and remove misleading product claims found in the final audit.
- [x] Replace generic personal-name test fixture text with role-based identity wording.
- [x] Run final repository, browser, API, and visual QA, then save a final acceptance checkpoint.
- [x] Add request-list pagination and targeted request-creation contract coverage.
- [x] Replace fabricated validation fallback rows with an honest unavailable/empty state.
- [x] Add targeted tests for analytics fallback semantics alongside approval and validation presentation tests.
- [x] Implement actual Audit filtering and export the filtered full dataset independently of pagination.
- [x] Capture and verify a tablet-width screenshot of the updated sortable/paginated Audit table.

- [x] Add a bounded client-side simulation clock for telemetry and request-flow updates.
- [x] Animate telemetry values, stream indicators, timestamps, and pipeline activity without plant connectivity.
- [x] Label simulated states explicitly and respect prefers-reduced-motion.
- [x] Add tests and perform desktop/mobile visual verification for the simulation layer.
- [x] Save a checkpoint for the simulated real-time update experience.
- [x] Save the post-simulation checkpoint after deterministic model tests and desktop/mobile review.

- [x] Replace the predominantly dark visual system with a premium light JESA corporate industrial theme.
- [x] Redesign the shared header, sidebar, status hierarchy, typography, and surfaces without changing routing or backend flows.
- [x] Refine Operations, request detail, approvals, validation, audit, system health, analytics, configuration, and login for enterprise industrial usability.
- [x] Preserve explicit simulated/disconnected boundaries, semantic status colors, authentication, and NE178 workflow visibility.
- [x] Remove personal names, development traces, and misleading production claims found during the redesign audit.
- [x] Replace remaining fictional operator identity and external auth-provider labels in user-facing UI/documentation with role-based or generic security language.
- [x] Add or update tests and perform full desktop/tablet/mobile visual verification.
- [x] Normalize analytics filter controls and role-matrix values to the light JESA palette and readable role labels.
- [x] Remove the duplicated Configuration caption wording introduced during the routed-module cleanup.
- [x] Save a checkpoint for the light corporate industrial redesign.
- [x] Replace the remaining provider-specific auth wording in reconciliation documentation with neutral technical language.
- [x] Add an executable redesign regression test for role-based identity and neutral sign-in copy.
- [x] Correct the Operations session toast to interpolate the shared neutral security copy instead of showing a literal token.
- [x] Capture and verify a tablet-width screenshot for the redesigned routes.
- [x] Prevent tablet header breadcrumb and gateway-status crowding in the shared shell.
- [x] Capture tablet-width screenshots for Requests, Approvals, Validation, Audit, and Configuration and verify shared-shell consistency.
- [x] Implement a bounded client-side simulation state model for telemetry, request recency, and displayed timestamps.
- [x] Extend paused-state behavior and simulation labels across the explicit simulation model.
- [x] Add deterministic tests for simulated-state output, timestamp progression, and paused-state behavior.
- [x] Correct the simulation tick normalization so the bounded 120-tick window wraps deterministically.

# Premium Rework Specification — 2026-08-24

- [x] Inspect the complete premium rework specification and reconcile every applicable requirement with the current full-stack implementation.
- [x] Verify the Operations KPIs, request monitor filters, request detail, approval, validation, audit, health, analytics, and configuration behaviors against the new specification.
- [x] Verify authentication, role enforcement, simulator/read-only disclosures, and no-personal-name constraints against the new specification.
- [x] Implement newly identified functional gaps without replacing the existing protected tRPC/database contracts.
- [x] Run applicable automated, browser, responsive, and repository verification for the new specification.
- [x] Update reconciliation and QA documentation with the new specification findings and save an updated checkpoint.
- [x] Remove non-canonical fallback rows from routed Requests, Audit, Analytics, and Request Detail pages; show honest empty/loading/error states instead.
- [x] Replace the static approval card with canonical pending-approval rows and real detail links while preserving four-eyes mutation enforcement.
- [x] Add request selection and engineer-authorized validation rerun through the backend validation engine.
- [x] Add JSON audit export and expose additional canonical audit metadata where available.
- [x] Reconcile the new prompt’s propagation/mapping and workbook-import requirements against the explicit disconnected read-only boundary without fabricating plant connectivity or source data.

# Canonical Analytics Expansion

- [x] Define detailed canonical analytics measures and series from persisted request, history, approval, and validation rows.
- [x] Extend the protected analytics procedure with typed filtered aggregations and truthful no-data behavior.
- [x] Add dashboard visualizations for status, use-case, validation-failure, SIL, throughput, and approval-latency insights.
- [x] Extend analytics report exports and add aggregation/presentation regression tests.
- [x] Run tests, type check, production build, responsive visual QA, and save a checkpoint.

# Master Repair Specification Audit — 2026-08-24

- [x] Complete the master prompt audit across routes, backend contracts, authentication, authorization, database, simulator, SSE, edge adapter, documentation, and tests.
- [x] Reconcile the master prompt’s required request filters, engineering detail fields, KPI semantics, and validation evidence with the existing canonical schema.
- [x] Identify and implement applicable defects without fabricating plant data, DCS writes, workbook rows, or unsupported REST contracts.
- [x] Verify real-data/empty/error behavior and remove any remaining fake counters, fake charts, fake approvals, or dead controls.
- [x] Verify authentication and RBAC boundaries, including direct URL access and administrator-only configuration.
- [x] Run the full automated, route, API, desktop/mobile, and repository verification suite.
- [x] Update repair documentation and save a final checkpoint for this master audit.
- [x] Add canonical request-list filters for status, equipment, variable, source use case, priority, and date range with clamped pagination.
- [x] Extend request detail with canonical equipment, variable tag/unit, PV/SP delta, SIL, priority, TTL, reason, and signature context.
- [x] Add canonical analytics KPIs for acceptance/rejection rates, average validation time, SIL-1 volume, expired/duplicated counts, and equipment/variable distributions.
- [x] Add a canonical acceptance/rejection trend series and include all new analytics dimensions in report exports.
- [x] Verify request actions and audit filtering against the master prompt, adding only controls backed by existing protected contracts.
- [x] Replace hardcoded System Health subsystem statuses with backend-derived database, validation, authentication, audit, and SSE health fields; keep OPC UA explicitly read-only/disconnected.
- [x] Remove the remaining static approval-count badge from the Operations navigation so no fake pending count is displayed.
- [x] Document backend-derived subsystem health and Operations canonical catalog enrichment in the master repair reconciliation and operations guide.
- [x] Correct Analytics KPI grid layout so labels, values, and context text remain readable at desktop and mobile widths.
- [x] Correct Audit filter-toolbar wrapping and export-control placement at the 1366px workstation target and mobile widths.

# Supplied Specification Follow-up — 2026-08-24

- [x] Finish reading and reconcile the supplied specification against the synced repository and reference-file boundaries.
- [x] Add only applicable remaining fields and behaviors for request detail, validation, audit correlation, system health, and role permissions.
- [x] Verify login and direct-route behavior without embedding production credentials or pretending a certificate upload is connected when the OAuth boundary owns authentication.
- [x] Run complete automated, build, route, responsive, and repository verification and save a new checkpoint.
- [x] Add a dedicated NE178 Compliance route with a clickable six-step matrix linked to implemented modules and evidence states.
- [x] Style the NE178 Compliance matrix as a readable industrial table with responsive horizontal handling and visible evidence hierarchy.

# Configuration-backed NE178 Evidence

- [x] Define a protected configuration-backed compliance evidence contract without introducing plant-write claims.
- [x] Replace route-level compliance links with persisted/derived evidence records and clear gated states.
- [x] Add regression coverage and responsive visual verification for the compliance matrix.
- [x] Update reconciliation/operations documentation and save a checkpoint.
- [x] Improve configuration-backed compliance metadata spacing and source/evidence hierarchy so values do not run together in the matrix.
- [x] Add protected `/dashboard` and `/history` aliases to the existing Operations and Audit modules so all specified URLs are covered without duplicating workflow code.

# Supplied Master Repair Acceptance Audit — 2026-08-24

- [x] Audit the existing VoR Gateway against the complete supplied acceptance specification without creating a new project or deleting working functionality.
- [x] Verify all required protected route aliases, authentication boundaries, role permissions, workflow states, backend procedures, and logout behavior.
- [x] Verify real-data, empty, error, simulator, export, traceability, and configuration-backed compliance behavior without fabricated operational data.
- [x] Implement applicable remaining fixes, run the application and test workflows, correct all discovered errors, and save a working checkpoint.
- [x] Add canonical validation-result and request-reason context to pending approvals so the confirmation modal shows the required evidence.

# Interactive Control Verification — 2026-08-24

- [x] Inventory and exercise navigation, authentication, logout, filters, pagination, exports, dialogs, mutations, simulator controls, and retry actions across all protected routes.
- [x] Fix any non-functional, misleading, inaccessible, or unhandled interactive controls discovered during the verification.
- [x] Add regression coverage for repaired controls and verify desktop/mobile behavior through the existing protected workflow contracts, full automated suite, and responsive route captures.
- [x] Document verified controls and save a checkpoint.


# Persisted Notification Acknowledgement and Seeded Workflow Simulation — 2026-08-24

- [x] Add persisted notification acknowledgement/read-state behavior with protected ownership enforcement and unread-count semantics.
- [x] Add operator-facing acknowledgement controls, clear feedback, loading/error states, and responsive presentation.
- [x] Add an explicitly isolated seeded end-to-end workflow simulation for Submit → Validate → Approve → Audit without seeding production records by default.
- [x] Add integration/unit coverage for acknowledgement ownership, idempotency, workflow state transitions, audit linkage, and cleanup/reset behavior.
- [x] Run migrations if required, full tests, TypeScript check, production build, responsive route QA, documentation updates, and save a checkpoint.


# Operations Failed-Fetch Repair — 2026-08-24

- [x] Trace the authenticated `/operations` Failed to fetch request through browser console, network log, and server runtime logs.
- [x] Apply the smallest safe fix and preserve protected session, notification, and Operations query behavior.
- [x] Add regression coverage for the failure path and verify the authenticated Operations route at desktop and mobile widths.
- [x] Run full tests, TypeScript check, production build, document the repair, and save a checkpoint.


# Supplied Industrial Requirements Audit — 2026-08-24

- [x] Audit all supplied routes, protected procedures, data counts, health probes, security boundaries, and interactive controls against the new reference.
- [x] Reconcile requirements that are already implemented, intentionally disconnected/read-only, or incompatible with the existing OAuth architecture without fabricating capabilities.
- [x] Implement applicable corrections discovered during the audit in the existing project without restarting the application.
- [x] Add regression coverage and execute route, security, workflow, data-integrity, and responsive QA for changed behavior.
- [x] Update the audit documentation, run final checks, and save a verified checkpoint.


# Protected CSV Catalog Import — 2026-08-24

- [x] Add persisted import-run metadata with source-file reference, actor, counts, status, and audit linkage.
- [x] Add strict equipment/variable CSV parsing, validation, duplicate handling, bounded file size, and atomic row persistence.
- [x] Store uploaded CSV source files through the configured server-side object storage boundary.
- [x] Add protected RBAC procedures for upload, preview/import, and import history without exposing arbitrary DCS addresses.
- [x] Add an operator-facing Configuration/catalog import workflow with template guidance, preview, errors, progress, and responsive feedback.
- [x] Add regression coverage for parsing, validation, authorization, atomicity, auditability, and catalog/request integration.
- [x] Generate/apply the migration, run full QA, update documentation, and save a verified checkpoint.


# Import History, Dry-Run Diff, and FAT/SAT Reconciliation — 2026-08-24

- [x] Add protected import-history detail and source-download contracts with ownership-safe access.
- [x] Add dry-run catalog diff reporting that never mutates canonical rows or plant systems.
- [x] Add authoritative equipment/variable reconciliation evidence and an explicit FAT/SAT readiness gate.
- [x] Add responsive UI flows for history detail, source download, dry-run diffs, and reconciliation status.
- [x] Add regression coverage for authorization, source references, diff semantics, reconciliation gating, and no-write guarantees.
- [x] Run migration if required, full QA, documentation, and save a verified checkpoint.


# External Sign-off, Reconciliation Reports, and Master Gate — 2026-08-24

- [x] Add persisted external sign-off evidence with certificate/reference source metadata and immutable audit linkage.
- [x] Add paginated reconciliation difference retrieval and downloadable CSV/PDF reconciliation reports.
- [x] Add a controlled authoritative engineering-master integration gate that cannot activate before valid FAT/SAT sign-off.
- [x] Add protected responsive UI for sign-off capture, diff pagination, report download, and integration-gate status.
- [x] Add regression coverage for certificate validation, role enforcement, report pagination, no-write behavior, and gate activation.
- [x] Run migration if required, full QA, documentation, and save a verified checkpoint.


# Dual Sign-off, Trust Store, and Controlled Activation — 2026-08-24

- [x] Add persisted dual independent external sign-off evidence and enforce distinct actors before FAT/SAT arm authorization.
- [x] Add approved trust-store configuration and certificate-chain validation for uploaded certificate evidence.
- [x] Add a documented and protected post-FAT/SAT controlled adapter activation procedure with explicit readiness checks and no implicit plant writes.
- [x] Add responsive UI for sign-off quorum, certificate validation results, and activation procedure status.
- [x] Add regression coverage for sign-off distinctness, certificate validation, gate activation, and no-write safeguards.
- [x] Run migration if required, full QA, documentation, and save a verified checkpoint.

# Authoritative Engineering Master Connection — 2026-08-24

- [x] Define the post-FAT/SAT authoritative-master connection contract with explicit read-only and authorization states.
- [x] Add persisted master-connection configuration, sync runs, evidence, and failure-state records.
- [x] Add protected procedures for connection validation, read-only synchronization, sync evidence, and explicit authorization.
- [x] Enforce FAT/SAT acceptance, certificate/trust evidence, and distinct authorization before any propagation gate can open.
- [x] Build responsive Configuration UI for connection status, sync evidence, and downstream authorization readiness.
- [x] Add tests proving the authoritative master cannot mutate the canonical catalog or plant systems before authorization.
- [x] Run migration, full QA, documentation review, and save a verified checkpoint.

# Certificate Expiry and Trust-Anchor Rotation — 2026-08-24
- [x] Add operator-configurable certificate expiry warning and critical thresholds.
- [x] Persist trust-anchor rotation evidence with actor, reason, old/new fingerprints, and reference artifact metadata.
- [x] Add protected procedures for expiry policy read/update, rotation evidence capture, and trust-store status.
- [x] Surface certificate expiry state and rotation history in the Configuration governance panel.
- [x] Add tests for warning boundaries, expired-certificate blocking, role enforcement, and append-only rotation evidence.
- [x] Run migration, full QA, documentation review, and save a verified checkpoint.

# Trust-Anchor Retirement Workflow — 2026-08-25

- [x] Add administrator-only retirement/revocation procedure requiring a verified replacement and rotation evidence.
- [x] Persist retirement evidence with actor, reason, reference artifact, and old/new fingerprints in append-only storage.
- [x] Ensure retired anchors cannot validate certificate chains and cannot be retired twice.
- [x] Build responsive Configuration controls for selecting, reviewing, and retiring an existing active anchor.
- [x] Add tests for replacement gating, role enforcement, duplicate retirement blocking, chain invalidation, and audit evidence.
- [x] Run full QA, documentation review, and save a verified checkpoint.

# Configuration masterGate query repair — 2026-08-25

- [x] Ensure the protected masterGate query returns a defined empty-state object when no gate exists.
- [x] Preserve armed-gate fields and Configuration UI behavior for existing gates.
- [x] Add regression coverage for empty and armed masterGate responses.
- [x] Run full QA, verify /configuration, and save a repair checkpoint.

# Configuration governance audit log — 2026-08-25

- [x] Add a protected configuration audit query for trust-anchor, gate, and activation authorization events.
- [x] Display rotation, retirement, gate-arm, and activation-readiness history with actor, result, reference, timestamp, and boundary context.
- [x] Add loading, empty, error, and responsive states without exposing personal-name data.
- [x] Add regression coverage, run full QA, verify /configuration, and save a checkpoint.

# Certificate expiry notifications and trust-anchor retirement — 2026-08-25

- [x] Add idempotent certificate-expiry alert generation for warning and critical windows.
- [x] Add operator/admin notification presentation with certificate, anchor, expiry state, and remediation context.
- [x] Add administrator-only evidence-gated revoke/retire workflow for active trust anchors after verified rotation.
- [x] Ensure revoked/retired anchors are excluded from validation and duplicate retirement is blocked.
- [x] Add regression coverage for expiry boundaries, notification idempotency, role enforcement, and retirement preconditions.
- [x] Run full QA, document the workflow, and save a verified checkpoint.

# Configuration mutation response-transform repair — 2026-08-25

- [x] Identify the Configuration mutation whose response cannot be transformed by the client.
- [x] Return a transformer-safe response while preserving server authorization and mutation semantics.
- [x] Add regression coverage for the corrected response contract.
- [x] Run full QA, verify /configuration, and save a repair checkpoint.

# Audit duplicate React key repair — 2026-08-25

- [x] Identify the Audit row renderer producing duplicate composite keys.
- [x] Use a stable unique audit-event key without changing filtering, sorting, pagination, or exports.
- [x] Add regression coverage for duplicate-key inputs.
- [x] Run full QA, verify /audit responsively, and save a repair checkpoint.

# Expandable Audit metadata rows — 2026-08-25

- [x] Preserve the full canonical audit record alongside the display row through filtering, sorting, and pagination.
- [x] Add accessible expand/collapse controls with stable event IDs and complete metadata payload rendering.
- [x] Keep metadata safe and readable for dates, nulls, nested objects, and arrays without exposing unrelated records.
- [x] Add responsive styles and loading/empty behavior consistent with the Audit table.
- [x] Add regression coverage, run full QA, verify desktop/mobile behavior, document, and save a checkpoint.

# Confirmed master requirements specification — 2026-08-25
- [x] Read and reconcile the remaining requirements in the supplied specification against the current implementation.
- [x] Audit all protected routes, backend contracts, roles, validation, approvals, audit, health, analytics, configuration, simulator boundaries, and responsive states.
- [x] Implement every applicable gap without fabricated data, personal names, plant writes, or a new application.
- [x] Add regression coverage for each implemented correction and verify important interactions.
- [x] Run final tests, TypeScript, production build, route QA, and documentation review.
- [x] Save a verified checkpoint for the completed applicable requirements.
- [x] Add automatic System Health refresh and a manual refresh control with loading/error feedback.

# Engineering data-source status tooltips — 2026-08-25

- [x] Add informative hover and keyboard-focus tooltips for LOCAL AUTHORITATIVE DATASET.
- [x] Add informative hover and keyboard-focus tooltips for PRODUCTION ADAPTER NOT CONFIGURED.
- [x] Preserve read-only and no-connection semantics, responsive layout, and accessible labeling.
- [x] Add regression coverage, run QA, verify desktop/mobile states, document, and save a checkpoint.

# Confirmed final full-audit specification — 2026-08-25

- [x] Read the complete supplied specification and map every acceptance criterion to the existing application.
- [x] Verify every required route, backend contract, authentication/RBAC boundary, data source, control, form, loading state, empty state, error state, refresh path, and export.
- [x] Implement every genuine remaining gap in place without fabricated data, personal names, unexplained production claims, or plant writes.
- [x] Verify the nine-step validation engine, four-eyes approval, audit trail, notifications, health states, configuration governance, analytics, and local authoritative-master boundary.
- [x] Run full automated QA, TypeScript, production build, browser/console/network review, responsive review, documentation update, and save a final checkpoint.

- [x] Reconcile stale prototype-scope documentation with the current full-stack protected implementation and explicitly retain the disconnected read-only integration limits.

# Operations notification and approval summary widget — 2026-08-25

- [x] Add a protected backend summary contract for recent certificate-expiry notifications and pending four-eyes approvals.
- [x] Enforce recipient scoping, role-safe approval visibility, bounded result sizes, and canonical request context.
- [x] Add the summary widget to Operations with loading, empty, error, retry, and navigation states.
- [x] Add regression coverage, responsive QA, documentation, and a verified checkpoint.

# Branded CSV and PDF export enhancement — 2026-08-25

- [x] Audit current CSV/PDF export helpers, report contracts, and JESA logo asset references.
- [x] Enhance CSV exports with a professional JESA report header, metadata, stable column structure, and preserved machine-readable records.
- [x] Enhance PDF exports with an embedded JESA logo, branded header/footer, improved typography, tables, metadata, and page-break handling.
- [x] Add regression tests for branded CSV/PDF output and verify downloaded files structurally and visually.
- [x] Update export documentation, run full QA, and save a verified checkpoint.

# Supplied industrial specification audit — 2026-08-25

- [x] Read and map the complete supplied specification against the current JESA VoR Gateway.
- [x] Audit all specified routes, backend contracts, authentication/RBAC, data models, validation, exports, UI states, responsive behavior, and diagnostics.
- [x] Implement every applicable remaining gap in place without duplicate routes, fabricated industrial data, personal names, or plant writes.
- [x] Add regression coverage and complete automated, browser, responsive, API, and no-fabrication verification.
- [x] Update traceability documentation, close this checklist, and save a verified checkpoint.
- [x] Remove the residual secondary gate-mark and simulated certificate toggle from the public login surface; keep the existing server-mediated secure authentication boundary explicit.
