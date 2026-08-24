# JESA VoR Gateway Architecture

The application is a React 19 and TypeScript control-room interface backed by Express, tRPC 11, Drizzle ORM, and TiDB/MySQL. Browser requests use typed tRPC contracts; protected procedures derive the authenticated user from the server session context and enforce active-session and role policy before reading or mutating canonical data.

The workflow is organized around the NE178-aligned request path: APC source identity enters the gateway, the server resolves engineering catalog references, the DMZ validation pipeline records ordered evidence, CPC state transitions and four-eyes approvals are persisted atomically, and the DCS edge remains a disconnected read-only boundary until an approved plant integration is introduced.

The simulator is intentionally client-side and bounded. It provides visual continuity for telemetry and request-flow demonstrations but is labeled as simulator data and never represents a plant write. Canonical database rows take precedence whenever available. Audit and request-history writes are append-only at the application contract; the deployed database must additionally constrain direct SQL access if adversarial database users are in scope.
