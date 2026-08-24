import type { NextFunction, Request, Response } from "express";

export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const origin = req.headers.origin;
  if (origin && req.path.startsWith("/api/")) {
    const expectedOrigin = `${req.protocol}://${req.get("host")}`;
    if (origin !== expectedOrigin) {
      res.status(403).json({ error: "Cross-origin API access is not permitted" });
      return;
    }
  }

  next();
}
