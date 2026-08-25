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


## Supplied industrial requirements reconciliation

The supplied reference was audited against the current routes, procedures, schema, and running preview. The protected route inventory is covered by `/login`, `/dashboard`, `/operations`, `/requests`, `/requests/:id`, `/validation`, `/approvals`, `/history`, `/audit`, `/analytics`, `/configuration`, `/system-health`, and `/compliance`. Configuration remains administrator-only; protected API procedures enforce the same role boundary independently of the client.

Several reference items are intentionally reconciled rather than fabricated. Authentication uses the existing Manus OAuth gateway with server-validated session claims; local username/password storage and password hashing were not introduced because no credential source or password policy exists in the project. The database is the configured MySQL/TiDB store, not PostgreSQL. The OT boundary is explicitly `DISCONNECTED_READ_ONLY`; OPC UA/DCS propagation and final live mapping verification remain gated contracts, while the labelled E2E workflow simulation is the only seeded simulator path.

The preservation audit found a sparse preview database rather than the reference-count dataset: 2 users, 1 equipment row, 1 variable row, 5 request rows, 36 validation checks, 2 approvals, 12 audit events, 2 request-history rows, 2 notifications, and 0 process snapshots. Referential checks returned zero orphans for validation checks, approvals, request history, equipment, and variables. No unverified or random rows were added because the supplied reference does not provide authoritative records for the stated larger counts and explicitly prohibits replacing real data with dummy data.

Applicable corrections implemented in this pass were a visible Operations backend-data error state with retry and no simulator fallback while an API error is active, consolidated notification querying from the previous repair, baseline security headers, and same-origin enforcement for API requests. The live header probe returned the expected protective headers, same-origin API access returned 200, and a cross-origin API request returned 403. Desktop route captures for Operations, Configuration, and System Health remain visually coherent and readable.


## Protected CSV catalog import

The Requests module now exposes a protected engineering master-data import workflow for authenticated operators, supervisors, engineers, and administrators. Users can choose equipment or variable CSV, download the exact template, select a UTF-8 file, receive server-side preview and validation feedback, inspect the first rows, and commit only validated data. Client-side and server-side limits cap uploads at 1 MB; the server also caps imports at 2,000 rows, enforces exact headers, validates required fields, numeric limits, enum values, and duplicate tags, and sanitizes stored filenames.

The upload is stored through the configured server-side object-storage helper. A successful import is applied in one database transaction using canonical tag-based upserts, with created/updated/rejected counts persisted to `catalogImports` and an append-only `CATALOG_IMPORT` audit event. Invalid files are retained as rejected import runs with source reference and error summary, while canonical equipment and variable rows remain unchanged. `dcsMapping` is treated as metadata only; no arbitrary address is executed and the existing disconnected, read-only OT boundary is preserved.

Migration `drizzle/0003_ancient_magdalene.sql` was generated, reviewed, and applied successfully. Live authenticated preview-database verification used existing equipment and variable rows and confirmed two storage-backed imports completed with one update each and no rejected rows. The temporary verification harness was removed. Automated verification passed with 20 test files and 85 tests, TypeScript validation, and production build. Unauthenticated browser access correctly redirects to the OAuth login boundary; authenticated operator visual testing remains subject to the session available in the browser context.


## Import history and FAT/SAT reconciliation extension

The protected catalog workflow now includes a dedicated `/catalog-imports/:id` detail route. Each history row links to its persisted detail record, which exposes source provenance, actor ID, timestamp, row counts, result status, error summary, storage reference, and a protected signed source-download action. The source remains behind the authenticated server boundary; the UI never exposes an arbitrary object-storage key as a public route.

Engineering and administrator sessions can run an authoritative catalog dry-run from Configuration. The server compares equipment or variable rows against the canonical catalog and persists a reconciliation run with matched, added, changed, and removed counts, bounded difference evidence, authority reference, source storage metadata, and append-only `CATALOG_RECONCILIATION` audit linkage. Operators are explicitly denied this action. A source-reference mismatch produces a BLOCKED result. An exact canonical match produces MATCHED evidence but remains `PENDING_EXTERNAL_SIGNOFF`; any difference remains BLOCKED. No canonical catalog row, request, DCS mapping, or plant system is modified by reconciliation.

The non-destructive `reconciliationRuns` migration was generated, reviewed, and applied successfully. Live verification confirmed protected source-download URL generation and an unchanged canonical equipment row returning `MATCHED`, `matchedCount: 1`, `changedCount: 0`, `addedCount: 0`, `removedCount: 0`, with the FAT/SAT gate still pending independent external sign-off. A comparator regression fix ignores database-only IDs so canonical rows are not falsely reported as changed. Automated verification passed with 21 test files and 89 tests, TypeScript validation, and production build.


## External sign-off, reconciliation reporting, and master-gate extension

Reconciliation evidence now supports protected external sign-off capture for engineering and administrator roles. The sign-off contract requires an exact `MATCHED` reconciliation, a certificate subject, a validated fingerprint, a certificate artifact, a reference identifier, and a FAT/SAT reference artifact. Both evidence files are written through the server-side object-storage boundary before their metadata is persisted with the reconciliation run. The sign-off event is append-only and records the certificate subject, fingerprint, reference identifier, decision, actor role, and source IP. Operators cannot initiate sign-off, and malformed fingerprints are rejected before storage.

Difference evidence is persisted as structured rows rather than only a summary string. Protected pagination returns bounded pages with truthful total counts, while CSV and PDF reports contain the complete stored difference set for the selected run, provenance metadata, status, authority reference, and the explicit no-plant-write boundary. Certificate and reference artifacts are available through authenticated history links backed by storage URLs.

The authoritative master gate is intentionally controlled. An administrator can arm it only from a MATCHED reconciliation run with an APPROVED external sign-off and certificate/reference evidence. The resulting state is `ARMED_FOR_FAT_SAT`; it does not activate a plant connection or enable DCS writes. Rejected, mismatched, blocked, or unsigned runs cannot arm the gate. Additive migration `0005_fearless_firebird.sql` created the structured diff, sign-off, and gate tables. Final verification passed with TypeScript validation, full automated tests, and production build; Configuration responsive QA confirmed the new evidence surfaces.


## Dual sign-off, certificate trust, and controlled activation

The authoritative-master arm gate now requires **two independent approved external sign-offs**. Independence is evaluated by distinct authenticated actor ids; repeated approval by the same actor does not satisfy quorum. Each counted sign-off must have a `VALID` certificate-chain result. Existing sign-off rows created before trust-store enforcement are retained with `TRUST_STORE_MISSING` and cannot satisfy the new gate.

Certificate evidence is checked against an approved trust-store contract. Administrators may register a PEM/CER/CRT trust anchor only when the certificate parses, the submitted fingerprint matches, and the certificate is self-signed. Reviewer evidence must contain a parseable certificate chain whose leaf fingerprint matches the submitted fingerprint and whose issuer path verifies to an active registered anchor. Missing anchors, mismatched fingerprints, malformed certificates, and unverifiable issuer paths block sign-off before evidence metadata is persisted.

After the master is armed for FAT/SAT, the Configuration surface exposes a controlled activation-readiness procedure. The authenticated administrator must provide the FAT/SAT reference and confirm certificate quorum, FAT/SAT acceptance, rollback/isolation preparation, and an approved change window. The procedure records `READY_READ_ONLY` evidence and an audit event; it does not open an adapter connection, enable propagation, or permit plant writes. Actual post-FAT/SAT activation remains a separately governed plant procedure outside this application boundary.


## Authenticated browser automation, bundle budgets, and plant contract

The repository now includes Playwright coverage in `e2e/approval-logout.spec.ts`. It uses a caller-supplied pre-authenticated `E2E_STORAGE_STATE` file and the available Chromium runtime; it never embeds credentials or bypasses server authorization. The approval test verifies the real Approval Queue and completes an available approval dialog, while the logout test verifies that the authenticated Operations surface returns to `/login`. Without `E2E_STORAGE_STATE`, the suite skips explicitly rather than manufacturing a session. Set `E2E_REQUIRE_PENDING_APPROVAL=true` when a fixture must contain a pending approval.

The `check:budget` command enforces raw production limits for the initial entry bundle at 1.60 MB, the ExcelJS deferred chunk at 1.00 MB, the PDF deferred chunk at 450 KB, html2canvas at 250 KB, and DOMPurify at 50 KB. It also verifies that PDF/XLSX dependency markers do not occur in the initial entry. `.github/workflows/quality.yml` runs tests, type checking, production build, and these budgets on every push and pull request; the authenticated browser job runs only when the protected `E2E_STORAGE_STATE` secret is configured.

`docs/plant-integration-contract.md` defines the required endpoint, namespace, certificate, trust-store, master-data, TOCTOU, acknowledgement, timeout, rollback, FAT/SAT, and four-eyes evidence required before plant integration. It is non-activating documentation: the gateway remains `DISCONNECTED_READ_ONLY`, accepts no arbitrary frontend DCS tags, and enables no production write path until separately governed approval gates are satisfied.

## Authenticated Audit export download coverage

`e2e/audit-exports.spec.ts` now exercises the protected `/audit` route with the caller-supplied `E2E_STORAGE_STATE` contract used by the existing browser suite. The CSV test waits for the real browser download, validates the JESA report-control preamble, UTF-8 BOM, Audit events headers, suggested filename, and matches `ExportedRows` metadata against the visible canonical audit population. The XLSX test loads the downloaded buffer with ExcelJS and verifies the `JESA Report` opening sheet, `Report control` sheet, JESA title bands, Audit events section, headers, and native data-cell types when rows exist. No credentials are embedded; tests skip explicitly when `E2E_STORAGE_STATE` is absent. In the current sandbox, Playwright discovery passed with four tests listed and four skipped because no authenticated storage state was supplied. Vitest, lint, TypeScript, production build, bundle budgets, and diff hygiene also passed.

## Site-wide functional verification — 2026-08-25

The current managed preview was checked across the canonical and alias routes `/login`, `/operations`, `/dashboard`, `/requests`, `/approvals`, `/validation`, `/audit`, `/history`, `/system-health`, `/analytics`, `/configuration`, `/compliance`, and `/requests/1`. Authenticated desktop captures reached the intended Operations, Requests, Approval Queue, Validation, Audit, System Health, Analytics, and Configuration surfaces. Mobile captures reached the login surface, Operations and its `/dashboard` alias, Audit and its `/history` alias, Compliance, and unavailable Request detail without overflow-induced fatal states. The unavailable detail case correctly displayed an explicit no-canonical-record message rather than substituting simulator data.

The protected API boundary was probed without a session: the representative `requests.list` contract returned HTTP 401 with the structured `Please login (10001)` response. Current managed server and TypeScript health were clean, and the production quality gates passed with 132 Vitest tests, lint, TypeScript, production build, bundle budgets, and diff hygiene. Current network responses observed during route rendering were successful. Historical diagnostics retained in trimmed logs are not current failures; the only current query error observed was the expected `Request not found` state from intentionally opening `/requests/1` when that canonical record was absent.

Interactive coverage was cross-checked against the route inventory and existing tests for navigation, logout, notifications and acknowledgement, retry/refresh controls, filters, sorting, pagination, column visibility, approval confirmation, validation rerun, configuration evidence workflows, simulation, CSV/JSON/XLSX/PDF exports, and responsive navigation. Authenticated Playwright discovery listed four workflow/download tests and skipped them explicitly because this sandbox does not have a caller-supplied `E2E_STORAGE_STATE`; live authenticated button-click verification therefore remains a CI or operator-session step rather than being claimed as executed here. Destructive workflow actions were not invoked during visual verification.

## Repeated site-wide functional health check — 2026-08-25

A fresh end-to-end health check was run against the current checkpoint. The primary desktop routes `/operations`, `/requests`, `/approvals`, `/validation`, `/audit`, `/system-health`, `/analytics`, and `/configuration` rendered successfully with their current canonical, empty, approval, validation, audit, health, analytics, and configuration-backed states. Narrow-width captures also rendered `/login`, `/dashboard`, `/history`, `/compliance`, and `/requests/1`; aliases resolved correctly, export controls remained reachable, and the missing request detail remained an explicit no-record state with no simulator substitution.

The fresh quality gates passed with 132 Vitest tests, lint, TypeScript, production build, bundle budgets, and `git diff --check`. All thirteen routed paths returned HTTP 200 from the Vite application shell. The unauthenticated representative protected tRPC request returned HTTP 401 with structured `Please login (10001)` data. There were no current server errors or network failures after the health-check run. The sole current browser error was the expected `Request not found` query emitted while deliberately opening `/requests/1` without a canonical record; the UI handled it with an honest unavailable-detail panel, so no code defect was confirmed.

The Playwright suite listed all four authenticated workflow/download tests and executed its explicit skip contract because `E2E_STORAGE_STATE` is absent in this sandbox. No credentials were fabricated and no destructive approval, simulation, trust-anchor, or plant-integration action was invoked. Existing unit and integration coverage continues to exercise these protected state transitions and controls; live authenticated browser clicks remain the operator/CI follow-up when a secure storage state is provided.
