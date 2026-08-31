import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

describe("session cookie options", () => {
  it("uses a secure cross-site cookie over HTTPS", () => {
    const options = getSessionCookieOptions({
      protocol: "https",
      headers: {},
    } as never);

    expect(options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("uses a safe same-site cookie for HTTP local development", () => {
    const options = getSessionCookieOptions({
      protocol: "http",
      headers: {},
    } as never);

    expect(options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("honors the trusted forwarded HTTPS protocol", () => {
    const options = getSessionCookieOptions({
      protocol: "http",
      headers: { "x-forwarded-proto": "https, http" },
    } as never);

    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe("none");
  });
});
