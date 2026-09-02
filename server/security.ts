import type { NextFunction, Request, Response } from "express";

function firstForwardedValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(",", 1)[0]?.trim() || undefined;
}

function configuredCorsOrigins() {
  return new Set(
    (process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map(origin => origin.trim().replace(/\/$/, ""))
      .filter(Boolean)
  );
}

export function getRequestOrigin(req: Pick<Request, "protocol" | "get" | "headers">) {
  const forwardedProtocol = firstForwardedValue(req.headers["x-forwarded-proto"]);
  const forwardedHost = firstForwardedValue(req.headers["x-forwarded-host"]);
  const protocol = forwardedProtocol || req.protocol;
  const host = forwardedHost || req.get("host");
  return host ? `${protocol}://${host}` : null;
}

export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const origin = typeof req.headers.origin === "string" ? req.headers.origin.replace(/\/$/, "") : undefined;
  if (origin && req.path.startsWith("/api/")) {
    const expectedOrigin = getRequestOrigin(req);
    const isSameOrigin = Boolean(expectedOrigin && origin === expectedOrigin);
    const isConfiguredCrossOrigin = configuredCorsOrigins().has(origin);
    if (!isSameOrigin && !isConfiguredCrossOrigin) {
      res.status(403).json({ error: "Cross-origin API access is not permitted" });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
  }

  next();
}
