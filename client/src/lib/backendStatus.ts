const CONNECTIVITY_MESSAGES = [
  "Gateway connection could not be established",
  "Gateway API returned a non-JSON response",
  "Gateway returned an incomplete tRPC response",
  "Failed to fetch",
  "NetworkError",
  "Load failed",
];

export function isBackendUnavailable(error: unknown) {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return CONNECTIVITY_MESSAGES.some(fragment => message.includes(fragment));
}

export const CONNECTION_CHECK_LABEL = "CHECK CONNECTION";
export const CONNECTION_CHECK_BUSY_LABEL = "CHECKING…";

export function backendUnavailableCopy(offline: boolean) {
  return offline
    ? {
        eyebrow: "LOCAL CONNECTION OFFLINE",
        title: "Backend connection is unavailable",
        body: "The gateway is in a safe read-only fallback. Cached screen context may remain visible, but authoritative data, approvals, validation, notifications, and write actions are unavailable until connectivity returns.",
      }
    : {
        eyebrow: "BACKEND CONNECTION LOST",
        title: "Gateway service could not be reached",
        body: "No authoritative gateway response was received. The interface remains available for navigation, but server-backed data and write actions are paused until the connection recovers.",
      };
}
