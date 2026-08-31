import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { randomUUID } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { encodeOAuthState } from "@shared/const";
import * as db from "../db";
import { getRequestOrigin } from "../security";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function configuredOrigins() {
  return new Set(
    (process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map(origin => origin.trim().replace(/\/$/, ""))
      .filter(Boolean)
  );
}

export function resolveOAuthReturnUri(req: Request, returnUri: string | undefined): string | null {
  if (!returnUri) return "/";
  try {
    const parsed = new URL(returnUri);
    const candidateOrigin = parsed.origin.replace(/\/$/, "");
    const requestOrigin = getRequestOrigin(req)?.replace(/\/$/, "");
    if (candidateOrigin !== requestOrigin && !configuredOrigins().has(candidateOrigin)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function stateCookieOptions(req: Request) {
  const secure = getSessionCookieOptions(req).secure;
  return {
    httpOnly: true,
    path: "/",
    maxAge: 10 * 60 * 1000,
    sameSite: secure ? "none" as const : "lax" as const,
    secure,
  };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/start", (req: Request, res: Response) => {
    const requestOrigin = getRequestOrigin(req);
    if (!requestOrigin) {
      res.status(500).json({ error: "OAuth callback origin is unavailable" });
      return;
    }

    const returnUri = resolveOAuthReturnUri(req, getQueryParam(req, "returnUri"));
    if (!returnUri) {
      res.status(400).json({ error: "Invalid OAuth return URI" });
      return;
    }

    const nonce = randomUUID();
    const callbackUri = `${requestOrigin}/api/oauth/callback`;
    const state = encodeOAuthState({ redirectUri: callbackUri, nonce, returnUri });
    const portalUrl = process.env.VITE_OAUTH_PORTAL_URL;
    const appId = process.env.VITE_APP_ID;
    if (!portalUrl || !appId) {
      res.status(500).json({ error: "OAuth is not configured" });
      return;
    }

    res.cookie(OAUTH_STATE_COOKIE, nonce, stateCookieOptions(req));
    const loginUrl = new URL(`${portalUrl.replace(/\/$/, "")}/app-auth`);
    loginUrl.searchParams.set("appId", appId);
    loginUrl.searchParams.set("redirectUri", callbackUri);
    loginUrl.searchParams.set("state", state);
    loginUrl.searchParams.set("type", "signIn");
    res.redirect(302, loginUrl.toString());
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // the backend set before redirecting to the provider. This works for both
    // same-origin and split Netlify/backend deployments.
    const stateData = decodeOAuthState(state);
    const { nonce } = stateData;
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, stateCookieOptions(req));

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const returnUri = resolveOAuthReturnUri(req, stateData.returnUri);
      res.redirect(302, returnUri ?? "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
