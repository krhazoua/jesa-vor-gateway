# JESA VoR Gateway

JESA VoR Gateway is an industrial OT/IT application prototype for Verification of Request governance around the PAP Attack Reactor. It provides authenticated, role-aware request handling between APC and a disconnected read-only DCS edge boundary.

## Current implementation

The full-stack application uses React, Express, tRPC, Drizzle, and TiDB/MySQL. It includes server-enforced session and role controls, canonical request creation, nine-step NE178-aligned validation evidence, five-state lifecycle handling, four-eyes approvals, append-only application audit events, notification delivery, analytics, CSV/PDF reports, and a bounded simulator for disconnected demonstrations.

## Verification

Use `pnpm test`, `pnpm check`, and `pnpm build` before creating a checkpoint. The current repository includes Vitest coverage for domain rules, router contracts, request creation, analytics, notifications, exports, edge-adapter behavior, and UI presentation helpers.

## Boundaries

The edge adapter is intentionally disconnected and read-only. Simulator values are labeled and are not plant telemetry. No live OPC UA connection, DCS write, or production certificate issuance is claimed by this repository.

See `docs/architecture.md`, `docs/operations.md`, `docs/reconciliation.md`, `docs/deployment.md`, `docs/api.md`, `docs/validation.md`, and `docs/process.md` for the maintained technical boundaries.
