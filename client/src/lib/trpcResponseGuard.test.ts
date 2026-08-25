import { describe, expect, it } from "vitest";
import { createNonJsonTrpcResponse, createTransportErrorTrpcResponse, fetchWithTrpcTransportGuard, isJsonResponse } from "./trpcResponseGuard";

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

  it("creates a structured response for a transport failure", async () => {
    const response = createTransportErrorTrpcResponse();
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body[0].error.json.message).toContain("connection");
    expect(body[0].error.json.data.httpStatus).toBe(503);
  });

  it("retries a read-only request after a transient network failure", async () => {
    let attempts = 0;
    const fetchImpl = async () => {
      attempts += 1;
      if (attempts === 1) throw new TypeError("Failed to fetch");
      return new Response("[]", { headers: { "content-type": "application/json" } });
    };
    const response = await fetchWithTrpcTransportGuard("/api/trpc/configuration.policy", undefined, fetchImpl, async () => {});
    expect(attempts).toBe(2);
    expect(response.status).toBe(200);
    expect(isJsonResponse(response)).toBe(true);
  });

  it("does not retry a mutation after a network failure", async () => {
    let attempts = 0;
    const fetchImpl = async () => {
      attempts += 1;
      throw new TypeError("Failed to fetch");
    };
    const response = await fetchWithTrpcTransportGuard("/api/trpc/configuration.updateTrustPolicy", { method: "POST" }, fetchImpl, async () => {});
    expect(attempts).toBe(1);
    expect(response.status).toBe(503);
    expect(isJsonResponse(response)).toBe(true);
  });
});
