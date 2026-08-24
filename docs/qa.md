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
