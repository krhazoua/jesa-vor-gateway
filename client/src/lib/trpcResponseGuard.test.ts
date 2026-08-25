import { describe, expect, it } from "vitest";
import { createNonJsonTrpcResponse, isJsonResponse } from "./trpcResponseGuard";

describe("tRPC response guard", () => {
  it("recognizes JSON responses", () => {
    expect(isJsonResponse(new Response("{}", { headers: { "content-type": "application/json" } }))).toBe(true);
    expect(isJsonResponse(new Response("{}", { headers: { "content-type": "application/json; charset=utf-8" } }))).toBe(true);
  });

  it("rejects HTML or missing content types", () => {
    expect(isJsonResponse(new Response("<!doctype html>", { headers: { "content-type": "text/html" } }))).toBe(false);
    expect(isJsonResponse(new Response("fallback"))).toBe(false);
  });

  it("creates a parseable tRPC error response for a non-JSON fallback", async () => {
    const response = createNonJsonTrpcResponse();
    const body = await response.json();
    expect(response.status).toBe(502);
    expect(body[0].error.json.message).toContain("non-JSON");
    expect(body[0].error.json.data.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
