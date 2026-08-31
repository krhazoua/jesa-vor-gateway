import { afterEach, describe, expect, it } from "vitest";
import { resolveOAuthReturnUri } from "./_core/oauth";

const originalOrigins = process.env.CORS_ALLOWED_ORIGINS;

function request() {
  return {
    protocol: "https",
    headers: {},
    get: (name: string) => (name.toLowerCase() === "host" ? "gateway.example" : undefined),
  } as never;
}

afterEach(() => {
  if (originalOrigins === undefined) delete process.env.CORS_ALLOWED_ORIGINS;
  else process.env.CORS_ALLOWED_ORIGINS = originalOrigins;
});

describe("resolveOAuthReturnUri", () => {
  it("defaults legacy callbacks to the backend root", () => {
    expect(resolveOAuthReturnUri(request(), undefined)).toBe("/");
  });

  it("allows the backend origin for same-origin deployments", () => {
    expect(resolveOAuthReturnUri(request(), "https://gateway.example/operations")).toBe(
      "https://gateway.example/operations"
    );
  });

  it("allows an explicitly configured Netlify origin", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://jesa-vor.netlify.app";
    expect(resolveOAuthReturnUri(request(), "https://jesa-vor.netlify.app/")).toBe(
      "https://jesa-vor.netlify.app/"
    );
  });

  it("rejects unconfigured external redirect targets", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://jesa-vor.netlify.app";
    expect(resolveOAuthReturnUri(request(), "https://evil.example/steal")).toBeNull();
  });
});
