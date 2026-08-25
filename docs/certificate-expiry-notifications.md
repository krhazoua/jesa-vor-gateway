# Certificate Expiry Notifications

The gateway now generates operator and supervisor notifications when an active trust anchor is inside the configured warning or critical expiry window. Each alert includes the certificate subject, fingerprint, remaining days, severity, and remediation guidance. Alerts use a stable deduplication key scoped to the anchor, expiry state, and expiry timestamp, so repeated evaluations do not create duplicate recipient rows.

The evaluation endpoint is `POST /api/scheduled/certificate-expiry-alerts`. It accepts only a platform-authenticated Heartbeat caller (`user.isCron === true` with a task UID), returns a JSON result, and never changes trust-anchor status or plant state. An administrator can also run the protected `notifications.evaluateCertificateExpiry` procedure for controlled verification.

After the site is deployed, create a platform-managed project Heartbeat using a six-field UTC cron such as `0 0 6 * * *`, callback path `/api/scheduled/certificate-expiry-alerts`, and a description such as `Daily certificate expiry warning evaluation`. Do not use an in-process timer; the preview sandbox is not a valid production callback target.
