# Backend-unavailable and offline fallback

The gateway now distinguishes a missing authenticated session from a backend connectivity failure. Protected routes continue to require a server-authenticated session; the offline experience never treats cached browser state as proof of authorization.

When the browser is offline, or when a tRPC request returns a recognized transport failure, the application shows a compact industrial warning banner with a retry action. If a protected route cannot establish a session at all, it shows a dedicated backend-unavailable panel instead of redirecting the operator into an unnecessary login loop. The retry action refetches active queries through the existing tRPC client.

If a previously authenticated route still has cached query data, that context may remain visible while the banner identifies the state as a safe read-only fallback. The message explicitly states that authoritative data, approvals, validation, notifications, and write actions are unavailable until the backend connection recovers. No plant measurements, workflow states, approvals, or audit records are synthesized locally.

The connectivity classifier recognizes the gateway transport errors produced by the shared response guard, while preserving normal unauthorized-session behavior. The monitor subscribes to the React Query cache so failures from any active protected route can surface the global banner; a successful query clears the transient backend-error indicator. Browser online/offline events update the same state without polling the network independently.

Verification includes focused classifier and copy tests, the complete Vitest suite, lint, TypeScript, production build, bundle budgets, diff hygiene, and authenticated desktop route screenshots for Operations, NE178 Compliance, and System Health. The fallback is intentionally not used to enable plant writes or bypass the server boundary.

## Visual verification

Authenticated desktop captures for Operations, NE178 Compliance, and System Health reached their intended data-backed surfaces after the change. A narrow 390px capture of Operations, Compliance, and Configuration also rendered without a fatal state; the dense compliance matrix retains its established horizontally dense engineering layout. The connectivity banner is intentionally absent while the gateway is healthy, so it does not compete with normal operational content.

## Manual connection check

The global warning banner now exposes an explicit **CHECK CONNECTION** button. Activating it refetches active React Query requests through the existing authenticated tRPC client; it does not bypass the session boundary or claim recovery without a successful response. While the check is running, the control is disabled, announces `CHECKING…`, and shows the existing refresh indicator. The control has an accessible name and title for keyboard and assistive-technology users. The protected fallback panel uses the same label so the recovery action is consistent across the global and route-level states.

The manual-check labels are covered by focused regression tests. The complete suite, lint, TypeScript validation, production build, bundle budgets, and diff hygiene checks pass after this enhancement.

## Manual connection check

The global connectivity warning now includes an accessible **CHECK CONNECTION** button. It actively refetches all active queries through the authenticated tRPC client and displays `CHECKING…` while requests are in flight. A successful response clears the transient backend-error banner; a failed response leaves the warning visible so users are not given a false recovery signal. The protected route-level fallback uses the same control label and does not bypass authentication or enable writes.

Regression coverage protects the exact available and busy labels. The focused and full quality suites, lint, TypeScript, production build, bundle budgets, diff hygiene, and desktop/mobile route captures passed after the enhancement.
