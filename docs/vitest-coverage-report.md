# Vitest Coverage Report

## Scope and method

Coverage was generated on 25 August 2026 with Vitest’s V8 provider using the complete current suite. The suite contains **31 test files and 124 passing tests**. The report includes server and client sources; generated UI primitives and framework scaffolding are separated from application-owned modules in the analysis below.

## Aggregate results

| Scope | Statements | Functions | Branches |
|---|---:|---:|---:|
| Application-owned source, including routed UI | 31.6% (1,121 / 3,547) | 54.8% (92 / 168) | 78.9% (450 / 570) |
| Critical server modules, excluding `server/_core` | 79.1% (635 / 803) | 54.5% (60 / 110) | 80.9% (301 / 372) |
| Client logic under `client/src/lib` | 87.5% (447 / 511) | 75.0% (27 / 36) | 78.8% (130 / 165) |

The low aggregate statement percentage for application-owned source is primarily caused by routed React pages and UI components not being mounted in the current Node-based Vitest environment. It should not be interpreted as low coverage of the backend governance logic.

## Critical application-module coverage

| Module | Statements | Functions | Branches | Assessment |
|---|---:|---:|---:|---|
| `server/vor.ts` | 100% | 100% | 65.7% | Core state/validation logic is executed; additional edge-branch tests could improve confidence. |
| `server/analytics.ts` | 100% | 100% | 97.3% | Strong coverage of canonical analytics aggregation. |
| `server/edgeAdapter.ts` | 100% | 100% | 89.7% | Strong read-only boundary coverage. |
| `server/certificateTrust.ts` | 65.6% | 77.8% | 70.6% | **Priority gap:** certificate-chain and trust-anchor negative paths need more direct coverage. |
| `server/db.ts` | 5.1% | 4.9% | 100% | **Priority gap:** database helper functions are mostly mocked or bypassed by pure-contract tests. |
| `server/storage.ts` | 1.4% | 0% | 100% | **Priority gap:** storage upload/download error and success paths are not exercised directly. |
| `server/routers.ts` | 99.2% | 50% | 57.1% | Statements are covered through procedure calls, but procedure-function and branch metrics show untested router permutations. |
| `client/src/lib/reportExport.ts` | 82.9% | 52.9% | 87.5% | Export values and branding are covered; browser download and asset-failure paths remain partial. |
| `client/src/lib/auditTable.ts` | 96.6% | 100% | 73.1% | Main filtering/sorting/pagination logic is covered; rare branch combinations remain. |
| `client/src/components/EdgeAdapterHealthCard.tsx` | 58.5% | 75% | 92.3% | **Priority gap:** rendered loading, error, compact, and ready states are not fully mounted in tests. |

## Uncovered routed UI and scaffold modules

The following application-facing modules currently show 0% coverage because they are not mounted by the Node test environment: `client/src/pages/Home.tsx`, `client/src/pages/ModulePage.tsx`, `client/src/pages/Login.tsx`, `client/src/pages/NotFound.tsx`, `client/src/components/ReconciliationEvidencePanel.tsx`, `client/src/components/ReportExportActions.tsx` (10.4% statements), and `client/src/components/ErrorBoundary.tsx`. The shared `DashboardLayout` and skeleton also show 0% coverage, as do optional scaffold components such as `AIChatBox`, `Map`, and `ComponentShowcase`.

These are not equivalent risks. The routed pages and reconciliation/export components are operationally important and should receive browser/component tests. Optional scaffold components are lower priority because they are not part of the VoR Gateway’s active route surface.

## Recommended next coverage work

The highest-value next step is to add a browser-capable component test layer for the active routed surfaces. Prioritize login/session-expiry behavior, Operations loading/error/empty states, request submission/detail flows, approval confirmation and four-eyes rejection, Validation short-circuit rendering, Audit filters and export-action failure states, Configuration admin restriction, and System Health retry/refresh behavior.

On the server side, add direct integration tests around database helper success and failure paths, storage failures, certificate-chain parsing edge cases, and router permutations that currently account for the branch/function gaps. Keep the current pure-contract tests because they provide strong deterministic coverage of the NE178 state machine, analytics, notification transport, and read-only edge boundary.

## Generated artifacts

The detailed HTML report is available under `coverage/index.html`, and the raw instrumented data is under `coverage/coverage-final.json`. The project now includes the compatible `@vitest/coverage-v8` development dependency and `scripts/summarize-coverage.mjs` for repeatable application-focused summaries.
