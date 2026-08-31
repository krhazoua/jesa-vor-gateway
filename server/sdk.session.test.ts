import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";

describe("OAuth session payloads", () => {
  it("keeps nameless OAuth users verifiable by falling back to openId", async () => {
    const token = await sdk.createSessionToken("oauth-user-without-name", {
      name: "",
      expiresInMs: 60_000,
    });

    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "oauth-user-without-name",
      name: "oauth-user-without-name",
    });
  });

  it("preserves a provided display name in the session payload", async () => {
    const token = await sdk.createSessionToken("named-oauth-user", {
      name: "Operator",
      expiresInMs: 60_000,
    });

    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "named-oauth-user",
      name: "Operator",
    });
  });
});

