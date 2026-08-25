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

## Governance attention summary

The protected `dashboard.operationsSummary` procedure returns a bounded Operations summary for the authenticated recipient. Certificate-expiry alerts are selected from that recipient’s persisted notification rows and limited to five summary entries. Pending four-eyes approval details are returned only to supervisors, engineers, and administrators, with a maximum of five entries; other roles receive an explicit role-restricted contract with no approval count or detail.

The Operations dashboard renders loading, query-error with retry, empty, authorized, and role-restricted states. Alert rows preserve acknowledgement state and approval rows navigate to canonical request detail; the approval queue remains available only through its existing server-enforced route. The summary refreshes on the same interval as persisted notification polling and does not fabricate expiry alerts or approvals when the database is empty.

## Branded report exports

Audit, analytics, and reconciliation report downloads now use a consistent JESA Digital Engineering presentation. CSV files retain the original machine-readable section and row structure, add a UTF-8 BOM for spreadsheet compatibility, and include a branded metadata preamble with the report title, UTC generation time, data-boundary statement, and stable JESA wordmark reference. PDF files include the JESA wordmark when the managed asset is available, a navy/cobalt report header, report metadata panel, alternating table rows, section bands, and confidential footer pagination. If the browser cannot load the optional logo asset, PDF generation completes with the same branded layout and a text-only header rather than failing or changing the report data.

## Supplied specification audit outcome

The supplied industrial specification was reviewed against the existing routes, protected tRPC contracts, schema, validation engine, approval workflow, notification transport, edge adapter, exports, and responsive surfaces. The current implementation retains the safer managed OAuth/session architecture rather than introducing an unbacked username/password or client-side certificate credential flow. The login surface now presents one JESA wordmark and describes certificate-aware server authentication without exposing or collecting private certificate material. Protected routes and backend procedures remain session- and role-enforced, while the disconnected edge adapter remains explicitly read-only until an approved plant integration contract exists.

## Branded Excel workbooks

The report export controls now include an XLSX option for audit, analytics, and reconciliation reports. The workbook is generated from the same report definition as CSV, JSON, and PDF, preserving the canonical sections and row values. It includes a JESA wordmark image when the managed asset is available, JESA Digital Engineering title bands, report-control metadata, styled section headers, alternating data rows, readable column sizing, frozen headers, worksheet filters, and a confidential footer. ExcelJS is lazy-loaded only when an XLSX export is requested so normal route loading remains unaffected.

## Site-wide export standard

All audit, analytics, and reconciliation report downloads now use the shared JESA export helper. CSV files use a UTF-8 BOM, a consistent JESA Digital Engineering metadata preamble, report title and UTC generation context, visible JESA control text, and unchanged section headers and row values. Excel downloads use a two-sheet structure: a branded `Report control` cover sheet with the JESA logo, document-control metadata, and a link to `JESA Report`, followed by the detailed data sheet with the embedded JESA logo, styled report bands, filterable tables, frozen headers, controlled widths, alternating rows, and confidential pagination. This standard prevents individual pages from producing visually inconsistent report files.

## CSV organization correction

CSV exports now begin with a clearly labeled JESA report-control block, followed by a separate report-metadata block and a data-section index. Each data section includes its title, column count, row count, original column headers, and original data rows with a blank separator before the next section. The CSV uses visible JESA control text only. A CSV file cannot carry a rendered bitmap image; the embedded JESA logo remains available in the XLSX and PDF formats without adding logo packaging or binary content to the CSV.

## Vite HMR reload recovery

The reported `/audit` HMR messages for `index.css`, `ReportExportActions.tsx`, and `ReconciliationEvidencePanel.tsx` were investigated against the current source and server diagnostics. The current stylesheet and module graph compile successfully; the failure was a stale HMR state left behind during rapid related source updates rather than an active syntax or missing-module defect. Restarting the managed development server rebuilt the module graph cleanly. Authenticated `/audit` verification now renders the export controls and audit table without reload failures, and the production build remains successful.

## CSV format

The direct `CSV DATA` export is intentionally text-only. It contains the organized JESA report-control block and canonical report data, while the actual JESA bitmap remains embedded in the XLSX and PDF exports. This keeps the CSV portable and machine-readable without attaching binary packaging to the data file.

## Excel value preservation

The detailed `JESA Report` worksheet writes section rows using their native report values. Numeric process values remain numeric Excel cells for sorting and calculation, zero values remain zero, text remains text, and null or undefined source values become intentionally blank cells. The report-control sheet and all visual styling remain unchanged. This keeps the downloaded workbook useful for engineering review rather than making it a text-only presentation.

## Excel opening-sheet correction

The downloaded workbook previously placed `Report control` before `JESA Report`, which made the file appear to contain only text when opened because the control sheet was the active first sheet. The workbook now creates `JESA Report` first, so the downloaded file opens directly on the populated detailed report with canonical section rows and values. `Report control` remains available as the second worksheet for document-control metadata and navigation.

## Canonical Operations data boundary

The Operations request monitor and telemetry rail now use the protected canonical request and engineering-catalog queries exclusively. When no canonical rows are available, the interface shows an explicit empty state rather than substituting hardcoded plant-looking records. The former preview-stream utility remains isolated from the live page for deterministic test coverage only; no synthetic request row or process value is presented as live operational data.

## Operations filtering and sorting

The Operations request monitor provides a canonical-data filter bar for free-text search, status, equipment, variable, priority, source UC, and UTC date range. Filters apply to the protected request and engineering-catalog responses already loaded for the authenticated session; no synthetic rows are introduced. Sortable headers cover request identity, equipment, variable, requested value, and decision state. Priority sorting follows CRITICAL, HIGH, NORMAL, LOW, and equal values use the request identifier as a deterministic tie-breaker. Created time remains newest-first by default.

The monitor displays the visible-row count against the canonical population, offers a clear-filters action only when filters are active, and preserves explicit API-error and no-record states. On narrow layouts, controls reflow into a two-column grid and the request table remains horizontally scrollable so engineering values are not truncated. Controls are semantic inputs and buttons with keyboard focus support.

## Operations column visibility

The request monitor includes a `COLUMNS` control for reducing visual density during tablet and mobile review. Operators can independently show or hide equipment, source UC, variable/tag, delta request, and decision columns while the request identity/time column remains visible as the stable row anchor. The menu uses native checkbox controls, exposes a `RESET` action, and keeps filtering, sorting, row selection, and canonical data unchanged when presentation columns are hidden. The table grid recalculates to the visible set so headers and cells remain aligned; narrow layouts retain horizontal safety for the remaining engineering values.
