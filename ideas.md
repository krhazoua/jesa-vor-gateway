# VoR Gateway — Design Direction

## Three candidate approaches

### Theme Name: Control Room Ledger
Very dark, high-density OT interface with cobalt status accents, strict traceability cues, and a technical-paper rhythm. It should feel like an operator’s living control ledger rather than a generic SaaS dashboard.
**Probability:** 0.07

### Theme Name: Process Atlas
Warm white engineering workspace with navy structure, amber risk markers, and diagrammatic process context. It would feel like a modern engineering review room with a calmer, documentation-first tone.
**Probability:** 0.03

### Theme Name: Secure Blue Steel
A restrained blue-grey industrial console with hard edges, bright signal colors, and a sense of controlled access. It emphasizes system boundaries, approvals, and security posture more than process storytelling.
**Probability:** 0.09

## Chosen Approach: Control Room Ledger

### Design Movement
Neo-industrial information design, borrowing from SCADA/HMI conventions, aircraft maintenance ledgers, and high-end technical instrumentation. The interface is intentionally dense but composed, with every color and line carrying operational meaning.

### Core Principles
1. **Operational truth over decoration.** Use engineering units, timestamps, request IDs, and check states as the primary visual material.
2. **Traceability as a visible surface.** Every important action should have a visible actor, status, time, or transition cue.
3. **Signal colors are sparse and semantic.** Green means passed/healthy, amber means attention or approval, red means blocked/failure, cobalt is reserved for active system context.
4. **Controlled density.** Prefer compact data rows, split panes, and aligned numeric columns over oversized cards or ornamental whitespace.

### Color Philosophy
The base is a deep graphite-blue-black to reduce glare and evoke a secured control-room surface. JESA cobalt anchors brand recognition and active navigation. Cool steel text creates hierarchy without looking like a consumer app. Amber is reserved for approval and attention, while red is reserved for blocked propagation and failed checks. The emotional intent is **calm authority under scrutiny**.

### Layout Paradigm
Persistent left rail for system context, a slim top telemetry bar for global posture, and an asymmetric workbench: a wide operational canvas on the left with a narrow decision/traceability rail on the right. Sections use hairline dividers, offset labels, and aligned tabular data rather than centered card stacks.

### Signature Elements
- A vertical cobalt “live line” beside the current workflow state.
- Monospace request IDs, timestamps, DCS tags, and rule names to reinforce machine traceability.
- Compact verification pipeline chips that read like an instrument sequence, with a visible short-circuit path.

### Interaction Philosophy
Interactions should feel deliberate and reversible. Hover states reveal context without moving layout; selected rows open a detail drawer; approval actions are explicit, labeled, and visually separated from inspection actions. Any placeholder or non-live action is clearly marked as simulator behavior rather than implying a real plant write.

### Animation
Use restrained 140–220ms transitions for hover, selection, drawers, and status changes. Avoid continuous decorative motion. Use a subtle pulse only for the “simulator connected” indicator and a short progress sweep when the verification pipeline is run. Respect reduced-motion preferences.

### Typography System
Use **IBM Plex Sans** for interface text and **IBM Plex Mono** for request IDs, values, units, rule names, and timestamps. Headlines use compact semibold uppercase with wide tracking; body copy uses 13–14px readable text; numeric data uses tabular figures and monospace alignment.

### Brand Essence
A secure, reviewable request gate for JESA’s phosphoric acid plant APC workflows — built for process engineers and operators who need to know not only what happened, but why it was allowed. **Precise. Watchful. Accountable.**

### Brand Voice
Headlines are concise and procedural. CTAs describe the action and its consequence; microcopy is factual, never promotional.

Example lines:
- “Review the request before it crosses the DMZ boundary.”
- “Propagation blocked — RANGE_CHECK requires operator disposition.”

### Wordmark & Logo
Use the supplied JESA wordmark in the shell, paired with a small abstract “gate” mark: two offset cobalt brackets with a central amber verification tick. The mark is a system symbol, not a decorative app icon; it should be legible at 20–28px.

### Signature Brand Color
**JESA Cobalt — #234A9F**, used selectively for active state, system identity, and trusted navigation.

## Implementation reminders

Every page/component stylesheet or file should preserve this system: dark graphite base, JESA cobalt active state, semantic signal colors, IBM Plex Sans + IBM Plex Mono, compact technical density, and visible traceability. If a choice increases decoration without adding operational meaning, omit it.

## Source handling

Supplied PDFs and text references are treated as authoritative for terminology and disclosed engineering context. The frontend is a static prototype; plant integration, real DCS writes, backend persistence, and formal NE178/SIL certification are not claimed. Simulator data is labeled as such in the interface.

## Style Decisions

- Primary surfaces read as ledger/instrument panes: hairline grids, row IDs, actor/time/state labels, and machine-readable values dominate over freestanding rounded-card dashboard composition.
- The JESA wordmark is always paired with the VoR gate mark: two cobalt offset brackets plus one amber verification tick, used as a system symbol rather than a decorative app icon.
- JESA Cobalt `#234A9F` is reserved for active navigation, live workflow context, and trusted system identity; amber, green, and red remain strictly semantic.
- Request lineage is shown as an explicit APC → psM+O → DMZ → CPC → DCS sequence so the gateway boundary is visible at a glance.
