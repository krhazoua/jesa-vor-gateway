# Netlify Backend Contract

This document defines the production contract between the existing JESA VoR Gateway frontend hosted on Netlify and its separately deployed backend. It deliberately uses placeholders and must not be populated with invented domains or credentials.

## Origins

| Contract item | Required value |
|---|---|
| Frontend origin | `https://<NETLIFY_DOMAIN>` |
| Backend origin | `https://<BACKEND_DOMAIN>` |
| Frontend configuration | `VITE_API_BASE_URL=https://<BACKEND_DOMAIN>` set in Netlify Environment Variables only after the real backend is deployed |

The browser must never connect directly to PostgreSQL, TiDB, OPC UA, DCS, or any plant integration endpoint. All access remains through the existing protected backend.

## CORS

The backend must allow only the exact production Netlify origin, for example `CORS_ORIGINS=https://<NETLIFY_DOMAIN>`. Credentialed requests must not use `Access-Control-Allow-Origin: *`. Development may use an explicitly configured localhost origin, but production must use the real Netlify origin and must enable credentials only where required by the existing session model.

Required response behavior includes `Access-Control-Allow-Origin` matching the request origin, `Access-Control-Allow-Credentials: true` when cookie-backed authentication requires it, and an appropriate `Access-Control-Allow-Headers` list for `Content-Type`, `Accept`, and any existing authorization header.

## API contract

The backend must expose the existing routes over HTTPS without changing their protected procedure semantics.

| Capability | Required endpoint/behavior |
|---|---|
| Authentication | Existing OAuth/session entry and callback contract, registered for the real frontend and backend domains |
| Protected API | `POST`/`GET https://<BACKEND_DOMAIN>/api/trpc` with the existing tRPC and SuperJSON response contract |
| Realtime notifications | `GET https://<BACKEND_DOMAIN>/api/notifications/stream` or the existing registered SSE path, authenticated and credential-compatible |
| Health | Existing protected system-health procedure/API used by the System Health route |
| Error behavior | Structured 401, 403, 404, 409, 422, 500, and transport-failure responses; no internal stack traces to the browser |

Requests should retain `Content-Type: application/json` where applicable and `Accept: application/json`. SSE responses must use `Content-Type: text/event-stream`, `Cache-Control: no-cache`, and `Connection: keep-alive` where supported by the hosting layer.

## Authentication and session requirements

The existing authentication boundary remains server-enforced. If cookies are used, production cookies must be `Secure`, `HttpOnly`, and configured with an intentional `SameSite` policy compatible with the chosen frontend/backend origin relationship. If a bearer token is used by the existing contract, it must not be placed in public build-time configuration or persisted unnecessarily in local storage.

Register the real OAuth URLs only after domains exist:

- `https://<NETLIFY_DOMAIN>/login`
- `https://<NETLIFY_DOMAIN>/dashboard`
- `https://<BACKEND_DOMAIN>/api/oauth/callback`
- Any provider-specific authorization and logout callback URLs required by the existing OAuth integration.

## SSE lifecycle

The frontend uses the centralized `VITE_API_BASE_URL` helper for SSE construction. The backend must authenticate the stream, support HTTPS, close it on logout, and tolerate controlled reconnects without creating duplicate subscriptions. No simulated or fabricated SSE data is part of this contract.

## Health and OT boundary

The backend must provide the current protected health contract used by the System Health surface. Until formal plant authorization and FAT/SAT acceptance are complete, the edge adapter remains `DISCONNECTED_READ_ONLY` and the plant write path remains disabled. The Netlify frontend must not introduce propagation or plant-write capability.

## Deployment acceptance

Before production acceptance, validate login, protected tRPC requests, logout, notification SSE, the System Health route, exact-origin CORS, secure cookies, direct SPA refreshes, and the protected Playwright suite. Store `E2E_STORAGE_STATE` only as a protected CI secret; never commit it, expose it in chat, or place it in Netlify public variables.
