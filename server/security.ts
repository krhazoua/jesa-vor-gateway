import type { NextFunction, Request, Response } from "express";

function firstForwardedValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(",", 1)[0]?.trim() || undefined;
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

  const origin = req.headers.origin;
  if (origin && req.path.startsWith("/api/")) {
    const expectedOrigin = getRequestOrigin(req);
    if (!expectedOrigin || origin !== expectedOrigin) {
      res.status(403).json({ error: "Cross-origin API access is not permitted" });
      return;
    }
  }

  next();
}
