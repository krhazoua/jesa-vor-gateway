# Validation Rules

The server executes checks in this order: equipment reference, signature posture, engineering unit, duplicate identity, TTL, hard range, SIL classification, rate of change, and interlock state.

Validation is short-circuiting. The first failed rule stops downstream execution and the failure is persisted as evidence; the request enters `REJECTED`. A valid request enters `PENDING_OPERATOR` for independent review. A SIL-1 request is marked `REQUIRES_APPROVAL` in the evidence sequence and cannot be propagated without an independent decision.

Propagation requires `ACCEPTED` state, non-empty validation evidence, and no `FAIL`, `NOT_EXECUTED`, or `REQUIRES_APPROVAL` result. When canonical evidence is unavailable, the UI presents an unavailable state rather than inferring PASS.
