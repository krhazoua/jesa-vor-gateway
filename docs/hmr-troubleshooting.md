# Vite HMR WebSocket Troubleshooting

## Symptom

The managed preview reported that Vite could not connect to its WebSocket because the browser was attempting to use the preview URL over HTTP while the development server advertised `localhost:5173` as the HMR endpoint.

## Root cause

The full-stack development server embeds Vite in middleware mode on the application HTTP server. The application selects its runtime port dynamically, but Vite was not told the selected client port. In a managed HTTPS preview, that allowed the HMR client to fall back to Vite's standalone default port instead of the application port exposed through the proxy.

## Fix

`setupVite` now receives the selected application port and configures `server.hmr.clientPort` with a validated value. The server selects its port before mounting Vite, then passes that exact port into the Vite middleware setup. In the managed WebDev preview, where the reverse proxy can close upgraded WebSocket connections during process restarts, HMR is disabled and the managed HTML handler runs before Vite's HTML fallback so the transformed document is cleaned before it reaches the browser. Development HTML is served with `Cache-Control: no-store, no-cache, must-revalidate`; Vite remains available for source modules and assets. WebDev's managed reload strategy remains active. Ordinary local development retains HMR with the application port. Invalid values safely fall back to port `3000`; no production API URL, authentication behavior, or backend boundary was changed.

## Verification

The focused HMR regression suite passes four tests covering valid and invalid ports, managed-preview detection, and managed HMR bootstrap removal. After a clean managed-server restart, a fresh HTML probe returned HTTP 200 with no `/@vite/client` or `/@react-refresh`; a cache-busted browser load rendered Login with no console output. Historical WebSocket entries remain in the diagnostic log, but no new fresh-page failure was reproduced. The complete quality suite passed: 143 Vitest tests, lint, TypeScript validation, production build, bundle budgets, and `git diff --check`.

Historical HMR invalidation messages related to Fast Refresh export shape remain in older log entries, but they are not WebSocket connection failures. They trigger a safe full module reload rather than preventing the preview from connecting.
