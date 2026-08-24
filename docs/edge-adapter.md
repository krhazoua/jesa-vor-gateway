# Read-only Edge Adapter Contract

The VoR Gateway currently exposes a **disconnected, read-only edge-adapter contract**. It does not open a network connection to a plant endpoint, read from an OPC UA server, write setpoints, or accept plant credentials.

## Configuration boundary

`server/edgeAdapter.ts` validates a typed configuration with the following rules:

| Field | Disconnected phase | Future live read-only phase |
| --- | --- | --- |
| `mode` | `DISCONNECTED_READ_ONLY` | `LIVE_READ_ONLY` |
| `endpoint` | `null` | HTTPS edge endpoint required |
| `securityPolicy` | `DISABLED` | `MUTUAL_TLS` required |
| `maxSnapshotAgeMs` | 30 seconds by default | Configured per approved data contract |
| `tagAllowlist` | Empty | Explicitly approved PV/interlock tags only |
| `writeEnabled` | `false` | Must remain `false` in this phase |

A live configuration is rejected unless it has an endpoint and mutual TLS. Any configuration that enables writes is rejected.

## Health states

The contract represents `DISCONNECTED`, `HEALTHY`, `STALE`, `TIMEOUT`, `CONFIGURATION_ERROR`, `AUTHENTICATION_ERROR`, and `UNAVAILABLE`. Snapshot age is evaluated deterministically against `maxSnapshotAgeMs`; timeout and unavailability are retryable, while authentication and configuration failures require operator or engineering intervention.

The protected `systemHealth.summary` and `configuration.policy` procedures expose the current truthful state as `DISCONNECTED_READ_ONLY`, with `readOnly: true`, `endpointConfigured: false`, and no last snapshot. The UI labels this boundary as a read-only edge adapter rather than implying plant connectivity.

## Future commissioning gate

Before switching to `LIVE_READ_ONLY`, obtain the approved OT network topology, edge endpoint, mutual-TLS certificate lifecycle, tag allowlist, engineering units, quality semantics, snapshot cadence, and failure/escalation policy. The adapter must remain read-only until a separate, explicitly approved write-control design exists. Existing VoR validation, RBAC, four-eyes approval, state transitions, audit events, and propagation gates remain authoritative.
