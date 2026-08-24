# Process Context

The PAP Attack Reactor workflow governs proposed APC setpoint changes before any controlled DCS propagation. Operators submit requests; supervisors or engineers provide independent review according to role policy; the gateway records validation evidence, state transitions, approval decisions, notifications, and audit events.

The five request states are `PENDING_OPERATOR`, `ACCEPTED`, `REJECTED`, `DUPLICATED`, and `EXPIRED`. Terminal states are closed. The four-eyes rule prevents the requester from approving their own request. The edge adapter remains read-only until the plant integration boundary is formally approved.

This document describes application behavior and does not replace the plant's approved operating procedures, safety instrumented function documentation, cybersecurity policy, or change-management process.
