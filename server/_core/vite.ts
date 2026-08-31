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
    .replace(/\s*<script[^>]+src=["']\/\@vite\/client(?:\?[^"']*)?["'][^>]*><\/script>/g, "")
    .replace(/\s*<script[^>]+src=["']\/\@react-refresh(?:\?[^"']*)?["'][^>]*><\/script>/g, "");
}

export function isManagedHmrModulePath(url: string | undefined): boolean {
  const pathname = (url ?? "").split("?", 1)[0];
  return pathname === "/@vite/client" || pathname === "/@react-refresh";
}

export function managedHmrNoopModule(): string {
  return [
    "/* Managed preview HMR is disabled; compatibility exports preserve CSS without opening a WebSocket. */",
    "const noop = () => {};",
    "export function createHotContext() { return { accept: noop, prune: noop, dispose: noop, decline: noop, invalidate: noop, on: noop, off: noop, send: noop }; }",
    "export function updateStyle(id, content) { if (typeof document === 'undefined') return; let style = Array.from(document.querySelectorAll('style')).find((node) => node.getAttribute('data-vite-dev-id') === id); if (!style) { style = document.createElement('style'); style.setAttribute('data-vite-dev-id', id); document.head.appendChild(style); } style.textContent = content; }",
    "export function removeStyle(id) { if (typeof document === 'undefined') return; document.querySelectorAll('style').forEach((node) => { if (node.getAttribute('data-vite-dev-id') === id) node.remove(); }); }",
    "export function injectQuery(url) { return url; }",
  ].join("\n");
}

export async function setupVite(app: Express, server: Server, port: number) {
  const disableManagedHmr = shouldDisableManagedHmr(process.env);
  const serverOptions = {
    middlewareMode: true,
    // The managed preview proxy can close upgraded WebSocket connections while
    // the application process is restarting. WebDev already reloads the preview
    // on source changes, so avoid emitting a noisy, non-retryable HMR failure in
    // that environment. Ordinary local development retains HMR.
    hmr: disableManagedHmr
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

  if (disableManagedHmr) {
    // A browser may still hold an older HTML document from before managed HMR
    // was disabled. Stub the legacy module paths so that cached pages cannot
    // open a WebSocket or pull the refresh runtime during their lifetime.
    app.use((req, res, next) => {
      if (!isManagedHmrModulePath(req.url)) return next();
      res
        .status(200)
        .set({
          "Content-Type": "application/javascript",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        })
        .end(managedHmrNoopModule());
    });
  }

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      const managedPage = stripManagedHmrClient(
        page,
        disableManagedHmr
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
