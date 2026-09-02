import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export function resolveHmrClientPort(port: number): number {
  return Number.isInteger(port) && port >= 1 && port <= 65_535 ? port : 3000;
}

export function shouldDisableManagedHmr(env: Record<string, string | undefined>): boolean {
  return Boolean(env.MANUS_WEBDEV_PROJECT_ID);
}

export function stripManagedHmrClient(html: string, disableHmr: boolean): string {
  if (!disableHmr) return html;
  return html
    .replace(/\s*<script[^>]+src=["']\/\@vite\/client["'][^>]*><\/script>/g, "")
    .replace(/\s*<script[^>]+src=["']\/\@react-refresh["'][^>]*><\/script>/g, "");
}

export async function setupVite(app: Express, server: Server, port: number) {
  const serverOptions = {
    middlewareMode: true,
    // The managed preview proxy can close upgraded WebSocket connections while
    // the application process is restarting. WebDev already reloads the preview
    // on source changes, so avoid emitting a noisy, non-retryable HMR failure in
    // that environment. Ordinary local development retains HMR.
    hmr: shouldDisableManagedHmr(process.env)
      ? false
      : { server, clientPort: resolveHmrClientPort(port) },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Handle document navigations before Vite's HTML fallback. Otherwise Vite can
  // serve a cached/transformed document with /@vite/client before the managed
  // HMR stripping guard has a chance to run.
  app.use(async (req, res, next) => {
    const acceptsHtml = req.method === "GET" && (req.headers.accept ?? "").includes("text/html");
    if (!acceptsHtml) return next();

    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      const managedPage = stripManagedHmrClient(
        page,
        shouldDisableManagedHmr(process.env)
      );
      res
        .status(200)
        .set({
          "Content-Type": "text/html",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        })
        .end(managedPage);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Vite continues to serve transformed source modules and static assets.
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
