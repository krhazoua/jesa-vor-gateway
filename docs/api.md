# Protected API Reference

All application procedures are exposed through the typed tRPC router and require an active server session unless explicitly documented otherwise. Role policy is enforced server-side.

| Procedure | Purpose | Minimum role |
|---|---|---|
| `requests.catalog` | Read engineering equipment and variable references | Operator |
| `requests.list` / `requests.detail` | Read request records and evidence | Authenticated |
| `requests.create` | Create a validated request and audit evidence | Operator |
| `requests.transition` | Apply a legal lifecycle transition | Supervisor |
| `approvals.pending` / `approvals.decide` | Review and commit independent approval decisions | Supervisor |
| `validation.list` | Read canonical validation evidence | Engineer |
| `audit.list` | Read append-only audit events | Engineer |
| `analytics.summary` | Read filtered state and approval-time aggregations | Engineer |
| `systemHealth.summary` | Read boundary health | Authenticated |
| `notifications.list` / `notifications.markRead` | Read and acknowledge owned alerts | Authenticated |
| `dcs.acknowledge` | Acknowledge accepted requests when evidence permits | Supervisor |
| `configuration.policy` | Read gateway policy | Administrator |

Mutations bind actor identity to the session context, validate input with Zod, and use the canonical persistence layer. No frontend-only role check is considered an authorization control.
