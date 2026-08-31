# Vite HMR WebSocket Troubleshooting

## Symptom

The managed preview reported that Vite could not connect to its WebSocket because the browser was attempting to use the preview URL over HTTP while the development server advertised `localhost:5173` as the HMR endpoint.

## Root cause

The full-stack development server embeds Vite in middleware mode on the application HTTP server. The application selects its runtime port dynamically, but Vite was not told the selected client port. In a managed HTTPS preview, that allowed the HMR client to fall back to Vite's standalone default port instead of the application port exposed through the proxy.

## Fix

`setupVite` now receives the selected application port and configures `server.hmr.clientPort` with a validated value. The server selects its port before mounting Vite, then passes that exact port into the Vite middleware setup. In the managed WebDev preview, where the reverse proxy can close upgraded WebSocket connections during process restarts, HMR is disabled and the transformed HTML has the Vite HMR bootstrap removed, so the preview does not emit an unhandled connection-close error. Development HTML is also served with `Cache-Control: no-store, no-cache, must-revalidate`. As a second defense for a browser holding an older page, managed requests to `/@vite/client` and `/@react-refresh` are intercepted with a compatibility module that preserves CSS injection but exposes no WebSocket transport. WebDev's managed reload strategy remains active. Ordinary local development retains HMR with the application port. Invalid values safely fall back to port `3000`; no production API URL, authentication behavior, or backend boundary was changed.

## Verification

The focused HMR regression suite passes seven tests covering valid and invalid ports, managed-preview detection, query-string bootstrap removal, legacy module-path interception, and the compatibility module. After a clean managed-server restart, the styled Operations route rendered normally, the fresh browser console was empty, the served root HTML contained no HMR bootstrap, and no new HMR WebSocket failure was recorded after the restart; the earlier errors are historical diagnostics from before the mitigation. The complete quality suite also passed: 148 Vitest tests, lint, TypeScript validation, production build, bundle budgets, production HMR-marker scan, and `git diff --check`.

Historical HMR invalidation messages related to Fast Refresh export shape remain in older log entries, but they are not WebSocket connection failures. They trigger a safe full module reload rather than preventing the preview from connecting.
