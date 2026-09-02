import { apiUrl } from "@/lib/runtimeConfig";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It has a navigation side effect and must be called from an event handler.
// The backend mints the one-time nonce, sets the HttpOnly state cookie, and
// owns the OAuth callback so this also works when Netlify and the API use
// different HTTPS origins. Do not call it during render.
export const startLogin = () => {
  // The backend owns the OAuth state cookie and callback. This is required for
  // a split Netlify frontend/backend deployment because a frontend cookie
  // cannot be sent to a different backend host.
  const returnUri = `${window.location.origin}/`;
  const url = new URL(apiUrl("/api/oauth/start"), window.location.origin);
  url.searchParams.set("returnUri", returnUri);
  window.location.href = url.toString();
};
