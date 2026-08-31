# JESA VoR Gateway — Netlify Deployment Checklist

**Scope:** Frontend deployment of the existing JESA VoR Gateway. The browser must communicate with the existing backend over HTTPS; it must never connect directly to the database or plant edge.

## Final readiness summary

| Readiness category | Status | Meaning |
|---|---|---|
| Code readiness | **READY** | Existing frontend and backend code passed the available automated, type, lint, build, bundle, route, security, and responsive checks. |
| Netlify frontend readiness | **READY FOR CONFIGURATION** | `netlify.toml`, SPA fallback, security headers, cache policy, and optional backend-origin handling are prepared. |
| Backend infrastructure readiness | **EXTERNAL DEPENDENCY** | A real public HTTPS backend, exact-origin CORS, OAuth/session callbacks, cookie policy, tRPC, SSE, and health endpoint remain to be supplied and configured. |
| E2E environment readiness | **PENDING PROTECTED SECRET** | CI references `E2E_STORAGE_STATE` securely, but credentialed browser execution requires that protected secret. |

## Pre-deployment gates

| Gate | Status | Verification or action |
|---|---|---|
| Production build passes | [x] | `pnpm build` passes. |
| Tests pass | [x] | 153 Vitest tests pass, including nameless OAuth-session, exact-origin CORS, and split-origin OAuth return-URI regression coverage. |
| TypeScript passes | [x] | `pnpm check` passes. |
| Lint passes | [x] | Scoped Prettier lint passes. |
| SPA routing works | [x] | Direct route and refresh checks return the application shell for major routes. |
| Authentication works | [x] | Server-enforced OAuth/session boundary is preserved. OAuth now starts at the backend, sets the HttpOnly CSRF state cookie on the backend host, validates the return URI, and nameless OAuth profiles receive a valid verification-safe session claim derived from `openId`. |
| Protected routes work | [x] | Protected route rendering and structured unauthenticated API behavior are verified. |
| No frontend secrets | [x] | No tracked secret-like files or deployable frontend credentials found. |
| API URL configurable | [x] | `VITE_API_BASE_URL` is centralized, optional, and has no placeholder production value. |
| SSE URL configurable | [x] | SSE construction uses the same runtime backend-origin helper. |
| Security headers configured | [x] | Netlify headers include CSP, frame protection, MIME protection, referrer policy, permissions policy, and HTTPS-aware configuration. |
| CORS contract documented | [x] | `CORS_ALLOWED_ORIGINS` is an exact-origin server configuration; `docs/netlify-deployment.md` and `docs/netlify_backend_contract.md` describe credentials, preflight, and no-wildcard requirements. |

## Netlify settings

| Setting | Status | Required value or action |
|---|---|---|
| Build command | [x] | `pnpm build` |
| Publish directory | [x] | `dist/public` |
| `VITE_API_BASE_URL` | [ ] | Set only after the real backend exists: `https://<BACKEND_DOMAIN>`; no credentials, localhost, loopback, or temporary URL. |
| SPA redirect | [x] | `/*` → `/index.html` with status `200`. |
| Production domain | [ ] | Set the real Netlify production domain and use it in backend CORS and OAuth allowlists. |
| Static asset caching | [x] | Hashed assets use immutable caching; HTML/API responses are not cached. |
| Favicon and JESA branding | [x] | Existing JESA title, branding, logo references, and favicon behavior are preserved. |

## Backend contract

| Gate | Status | Required action |
|---|---|---|
| HTTPS backend | [ ] | Deploy the existing backend at a stable public HTTPS origin. |
| Exact-origin CORS | [ ] | Allow only the exact Netlify origin; never use `*` with credentials. |
| OAuth/session callbacks | [ ] | Register `https://<BACKEND_DOMAIN>/api/oauth/callback` with the provider and use the backend `/api/oauth/start` entry point with the real Netlify `returnUri` after domains exist. |
| Authentication | [ ] | Validate secure session behavior from the Netlify origin, including cookie scope and redirect behavior. |
| tRPC API | [ ] | Expose `/api/trpc` over HTTPS with the existing protected procedures and response contract. |
| SSE | [ ] | Expose the authenticated SSE endpoint over HTTPS with credential-compatible headers and controlled reconnects. |
| Health endpoint | [ ] | Expose the protected health contract required by the System Health surface. |
| Database boundary | [x] | Keep database access server-side; no direct browser database connection is allowed. |
| OT/plant boundary | [x] | Preserve `DISCONNECTED_READ_ONLY` and `NO PLANT WRITE` until formal authorization. |

## Post-deployment checks

Run these checks only after the real backend and domains are configured.

| Check | Status | Action |
|---|---|---|
| Login | [ ] | Complete normal OAuth login from the Netlify origin after the real backend domain, `CORS_ALLOWED_ORIGINS`, provider callback allowlist, cookie policy, and `VITE_API_BASE_URL` are configured. Local regression coverage confirms both the prior null-name login-loop defect and split-origin return-URI validation. |
| Dashboard | [ ] | Confirm authenticated summary data loads. |
| Operations | [ ] | Confirm live canonical query, filters, sorting, columns, notifications, and refresh. |
| Validation | [ ] | Confirm nine-step evidence and protected rerun behavior. |
| Requests | [ ] | Confirm canonical request data, imports, and audit-safe mutations. |
| Approvals | [ ] | Confirm four-eyes details, authorization, decision, comment, transition, and audit entry. |
| History | [ ] | Confirm immutable history and detail navigation. |
| Audit Trail | [ ] | Confirm persisted fields, expandable metadata, and CSV/XLSX/PDF exports. |
| Configuration | [ ] | Confirm administrator policy, trust-store workflow, reconciliation, and no plant write path. |
| System Health | [ ] | Confirm API, database, edge/simulator mode, timestamps, refresh, degraded, and unavailable states. |
| Analytics | [ ] | Confirm filters, aggregations, charts, and export behavior. |
| Logout | [ ] | Confirm logout closes protected session behavior and realtime connections. |
| Mobile layout | [ ] | Repeat the route and workflow checks at a narrow mobile viewport. |
| Protected E2E suite | [ ] | Run `pnpm test:e2e` with protected CI `E2E_STORAGE_STATE`; retain traces and downloaded report artifacts. |

## Go / no-go rule

The frontend is **ready for Netlify configuration**, not for final production operation. Go-live requires all external backend and post-deployment gates above to pass. Do not substitute a fake backend origin, fabricated storage state, wildcard credentialed CORS, or browser-side plant connectivity.
