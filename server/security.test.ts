import { describe, expect, it, vi } from "vitest";
import { applySecurityHeaders } from "./security";

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
    applySecurityHeaders({ path: "/api/trpc", protocol: "https", get: () => "gateway.example", headers: {} } as never, res as never, next);

    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks cross-origin API requests", () => {
    const res = response();
    const next = vi.fn();
    applySecurityHeaders({ path: "/api/trpc", protocol: "https", get: () => "gateway.example", headers: { origin: "https://evil.example" } } as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Cross-origin API access is not permitted" });
    expect(next).not.toHaveBeenCalled();
  });
});
