# Final QA Evidence

The current acceptance pass verified the following route surfaces at desktop (1366×768), tablet-width, and mobile (390×844) breakpoints: `/operations`, `/requests`, `/requests/:id`, `/approvals`, `/validation`, `/audit`, `/system-health`, `/analytics`, and `/configuration`. The `/login` route was opened directly and unauthenticated navigation to `/operations` redirected to `/login`.

| Area | Evidence |
|---|---|
| Authentication and route gate | Direct protected-route browser navigation redirected to `/login`; login page states server-authenticated session semantics. |
| Role access | Configuration is hidden from non-administrator navigation and the server procedure is covered by RBAC integration tests. |
| Request creation | Form and JSON modes are rendered; router tests cover accepted creation, validation-rejected creation, evidence writes, and inactive-session rejection. |
| Approval | Confirmation dialog is rendered; approval/rejection copy and rejection-comment gating have deterministic tests; four-eyes enforcement is covered by integration tests. |
| Validation and analytics | Canonical evidence is shown when present; absent validation evidence and unmatched analytics filters return honest empty states. |
| Audit and exports | Filtered, sorted, paginated audit view and CSV/PDF progress controls are rendered and covered by unit tests. |
| Notifications and simulation | Preview alert, SSE transport, polling fallback, bounded simulation, pause control, and reduced-motion behavior are covered by tests and representative screenshots. |
| Health and boundary | Edge adapter loading/error/disconnected/healthy/stale/write-disabled presentations are covered by component tests and screenshots. |
| Build and repository | 69 Vitest tests pass, TypeScript check passes, production build passes, and focused scans show no personal-name leakage or project-owned `console.log` traces. |

The QA scope is representative rather than a substitute for plant FAT/SAT, live DCS integration testing, certificate-chain testing, or adversarial direct-database testing. The OT edge remains disconnected and read-only.


## Interactive-control verification follow-up

The Operations control inventory was rechecked after the master repair pass. The mobile navigation button now toggles the sidebar; the request filter button focuses the filter field; the request archive button routes to `/requests`; the audit log button routes to `/audit`; the pending-request drawer routes to `/approvals`; logout routes to `/login`; notification, session, simulator pause, retry, export, approval-dialog, pagination, and filter controls retain their existing handlers and regression coverage. Desktop route captures were taken at 1366×768 and mobile captures at 390×844 for the principal surfaces.

The current canonical database scope contains no persisted approval, validation, or audit rows, so mutation success/failure states requiring canonical rows could not be exercised against live records in this preview. Those paths remain covered by the server and integration tests. The latest automated suite contains 73 passing tests, with TypeScript and production build checks passing. This remains representative application QA and does not replace plant FAT/SAT, certificate-chain, or live DCS testing.


## Persisted acknowledgement and seeded workflow simulation

The notification tray now reads both the unread queue and recent persisted notification history. Each persisted notification can be acknowledged by its authenticated recipient, and the tray provides an `ACKNOWLEDGE ALL` control for the recipient's unread rows. The server filters by recipient identity and `readAt IS NULL`; repeated acknowledgement is a no-op. MySQL result-header tuple normalization is covered by regression tests because the database driver returns affected-row metadata in tuple form.

An administrator-only `RUN E2E SIMULATION` action was added to Configuration. It creates or reuses only records tagged `E2E_SIMULATION`, `E2E-ATTACK-REACTOR`, and `E2E-TIC-5210`; it does not write to a plant adapter. The real preview database run produced a tagged request with `ACCEPTED` final status, 9/9 validation checks, four-eyes approval, and 4 audit events. A fresh persisted alert was then acknowledged through the ownership-scoped helper: the first call returned `{ updated: true }` and the second returned `{ updated: false }`. Database verification reported 2 simulation requests, 18 validation checks, 2 approved simulation approvals, 9 simulation audit events, and 0 unread simulation notifications; the extra rows represent the two explicit verification runs and remain clearly tagged.

The seeded simulation is a controlled QA aid, not plant commissioning evidence. It uses an isolated simulator catalog, a non-personal simulation operator identity, a certificate subject marked `E2E-SIMULATION`, and an explicit `NO_PLANT_WRITE / DISCONNECTED DCS EDGE` boundary. Plant FAT/SAT, certificate-chain, adversarial authorization, and live DCS adapter testing remain required before any production OT connection.


## Operations Failed to fetch repair

The reported authenticated `/operations` failure was traced to the initial protected tRPC batch containing two separate `notifications.list` queries—one unread-only and one recent-history query—alongside the Operations data queries. The failing batch returned no HTTP response after approximately 11 seconds. The notification history query was consolidated into a single authenticated recent-alert query; unread alerts are now derived locally from rows whose `readAt` is null. This preserves persisted acknowledgement semantics while reducing the initial batch and eliminating duplicate notification work.

A shared `getUnreadNotifications` helper and regression tests cover unread, acknowledged, and empty states. The authenticated Operations preview was rechecked at desktop and mobile widths. The post-fix network trace showed a single `notifications.list` operation in the Operations batch completing successfully, and no new Failed to fetch console event was observed. Final verification passed with 79 Vitest tests, TypeScript check, and production build. The earlier browser error remains recorded as historical evidence at 15:47; the current browser session itself was unauthenticated and redirected to `/login`, as expected for the isolated browser context.
