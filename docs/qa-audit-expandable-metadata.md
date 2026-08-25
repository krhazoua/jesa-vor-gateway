# Expandable Audit metadata QA

## Scope

The Audit table now keeps the complete canonical audit record alongside the display values and exposes it through an accessible expand/collapse control keyed by the persisted event ID.

## Behavior

Each row has a keyboard-reachable button with `aria-expanded` and `aria-controls`. Expanding a row reveals a formatted JSON payload containing all persisted event fields, including timestamp, request linkage, actor role/id, action, state transition, result, reason, module, certificate subject, source IP, and any nullable values returned by the protected audit query. Existing filtering, sorting, pagination, and exports remain unchanged.

## Visual verification

Authenticated desktop review at 1280px shows the expand controls aligned with the dense audit grid. Authenticated mobile review at 390px keeps the controls, event values, pagination, and filters readable through the stacked layout. The metadata panel uses wrapped monospace text to prevent long evidence values from causing horizontal overflow.
