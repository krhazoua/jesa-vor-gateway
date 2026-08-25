# Audit duplicate-key repair QA

## Scope

The Audit route previously generated React keys from timestamp, request, and action/module display values. Two canonical events could share those values, producing a duplicate-key warning and risking unstable row reconciliation.

## Repair

Audit entries now retain the canonical persisted audit-event ID through filtering, sorting, and pagination. The table uses that ID as the row key and uses an ID/index pair for each cell. Export rows remain unchanged and do not include the internal ID.

## Verification

The focused audit-table regression covers colliding display values with distinct event IDs. The full suite passed with 108 tests, TypeScript validation passed, and the production build passed.

Authenticated desktop review at 1280px showed both identical `CATALOG_IMPORT / CONFIGURATION` events rendered as separate rows without a duplicate-key warning. Authenticated mobile review at 390px showed the stacked filters, export controls, rows, and pagination remained readable and usable.
