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

- [ ] Save the post-refinement checkpoint after approvals, analytics, and configuration verification.
