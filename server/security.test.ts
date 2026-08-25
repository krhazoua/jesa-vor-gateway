import { describe, expect, it, vi } from "vitest";
import { applySecurityHeaders, getRequestOrigin } from "./security";

function response() {
  const headers = new Map<string, string>();
  return {
    headers,
    setHeader: (key: string, value: string) => headers.set(key, value),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("applySecurityHeaders", () => {
  it("sets baseline protective headers and allows same-origin API traffic", () => {
    const res = response();
    const next = vi.fn();
    applySecurityHeaders({ path: "/api/trpc", protocol: "https", get: () => "gateway.example", headers: { origin: "https://gateway.example" } } as never, res as never, next);

    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(next).toHaveBeenCalledOnce();
  });

  it("allows same-site API traffic when the public origin is forwarded by the trusted proxy", () => {
    const res = response();
    const next = vi.fn();
    applySecurityHeaders({ path: "/api/trpc", protocol: "http", get: () => "localhost:3000", headers: { origin: "https://public.gateway.example", "x-forwarded-proto": "https", "x-forwarded-host": "public.gateway.example" } } as never, res as never, next);

    expect(getRequestOrigin({ protocol: "http", get: () => "localhost:3000", headers: { "x-forwarded-proto": "https, http", "x-forwarded-host": "public.gateway.example, localhost:3000" } } as never)).toBe("https://public.gateway.example");
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("blocks cross-origin API requests", () => {
    const res = response();
    const next = vi.fn();
    applySecurityHeaders({ path: "/api/trpc", protocol: "https", get: () => "gateway.example", headers: { origin: "https://evil.example" } } as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Cross-origin API access is not permitted" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an API origin when no trusted request host is available", () => {
    const res = response();
    const next = vi.fn();
    applySecurityHeaders({ path: "/api/trpc", protocol: "https", get: () => undefined, headers: { origin: "https://gateway.example" } } as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
