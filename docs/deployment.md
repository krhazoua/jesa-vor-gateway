# Deployment Checklist

Before release, confirm managed authentication and database environment variables are configured, then run `pnpm test`, `pnpm check`, and `pnpm build`. Review the live preview at desktop, tablet, and mobile widths. Save a checkpoint before publishing.

The default application is suitable for managed autoscale hosting because it is request-driven and persists canonical state in the database. The notification stream is best-effort and process-local; a production multi-instance deployment should use durable pub/sub or a hosting mode that preserves the intended event-delivery topology.

Do not enable a plant endpoint or DCS write path until certificate policy, allowlists, integration tests, rollback controls, and operational ownership have been approved outside this prototype.
