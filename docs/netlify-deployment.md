# Netlify frontend deployment

This project remains a full-stack React, tRPC, and server application. Netlify is prepared as a **frontend-only** deployment target; the existing backend, database, server-enforced authentication, RBAC, NE178 workflow, audit trail, exports, and read-only OT boundary remain outside Netlify.

## Build configuration

The repository uses Vite. `netlify.toml` runs `pnpm build`, publishes `dist/public`, provides the SPA fallback to `/index.html`, disables caching for the entry document and API paths, and caches hashed assets immutably. Direct navigation or refresh of `/operations`, `/requests`, `/validation`, `/approvals`, `/audit`, `/analytics`, `/compliance`, `/configuration`, and `/system-health` therefore remains a client-side route operation.

## Public environment configuration

Set `VITE_API_BASE_URL` in Netlify Environment Variables only after the backend has a public HTTPS origin. The value must be the origin without a trailing slash, for example `https://gateway.example.com`; do not use a placeholder, `localhost`, `127.0.0.1`, a database URL, a JWT secret, a private key, an OPC UA password, or a certificate private key. When the variable is absent, the frontend intentionally uses same-origin `/api/trpc` and `/api/notifications/stream`, preserving the current managed deployment behavior.

The frontend now centralizes this decision in `client/src/lib/runtimeConfig.ts`. Both tRPC and the notification EventSource derive their paths through `apiUrl()`. SSE uses credentials so the backend can authenticate the browser session; the backend must allow the exact Netlify origin through its server-only `CORS_ALLOWED_ORIGINS` configuration and must not use wildcard origins.

## Backend prerequisites

Before using the separate Netlify frontend, deploy the backend at a stable HTTPS origin, set server-only `CORS_ALLOWED_ORIGINS=https://<NETLIFY_DOMAIN>`, configure the OAuth provider to use the backend callback `https://<BACKEND_DOMAIN>/api/oauth/callback`, and ensure the session cookie policy supports the chosen cross-origin architecture. The frontend login action starts at `https://<BACKEND_DOMAIN>/api/oauth/start?returnUri=https://<NETLIFY_DOMAIN>/`; the backend sets the HttpOnly state cookie, validates the return URI against the exact allowlist, and redirects back after session creation. The backend must continue to enforce JWT sessions, role authorization, protected procedures, logout, and session expiry independently of the frontend.

The backend must expose the existing tRPC and notification SSE contracts over HTTPS. If production SSE is unavailable, the UI retains its existing bounded polling fallback where supported; no fake operational data is introduced. Production propagation to the plant remains disabled until the approved plant integration contract and authorization gates are satisfied.

## Headers and deployment checks

The Netlify configuration applies `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and conservative cache controls. After configuring the backend origin, run `pnpm build`, `pnpm check`, `pnpm test`, and direct-route checks against the Netlify preview. Confirm that the browser requests use the configured HTTPS backend, protected routes redirect to `/login` without a session, authenticated routes load the server session, and no frontend environment contains backend secrets.
