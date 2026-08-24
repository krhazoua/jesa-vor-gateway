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
