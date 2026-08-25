import { describe, expect, it } from "vitest";
import { apiUrl, normalizeApiBaseUrl } from "./runtimeConfig";

describe("runtime API configuration", () => {
  it("normalizes optional backend origins without introducing placeholders", () => {
    expect(normalizeApiBaseUrl(undefined)).toBe("");
    expect(normalizeApiBaseUrl("  https://gateway.example.com/// ")).toBe("https://gateway.example.com");
    expect(normalizeApiBaseUrl("localhost:3000")).toBe("localhost:3000");
  });

  it("keeps same-origin paths when no backend origin is configured", () => {
    expect(apiUrl("/api/trpc")).toBe("/api/trpc");
    expect(apiUrl("api/notifications/stream")).toBe("/api/notifications/stream");
  });
});
