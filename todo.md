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
- [ ] Save a new post-upgrade checkpoint after all gaps are closed.
