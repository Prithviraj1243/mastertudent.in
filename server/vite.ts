import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Only apply Vite middleware to non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return vite.middlewares(req, res, next);
  });
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip API routes - let them be handled by the API router
    if (url.startsWith('/api/')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      
      // Inject route context for admin panel detection
      template = template.replace(
        `<div id="root"></div>`,
        `<div id="root" data-route="${url}"></div>`
      );
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Vite builds to dist/public (configured in vite.config.ts outDir)
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  const altPath  = path.resolve(process.cwd(), "dist", "public");
  const resolvedPath = fs.existsSync(distPath) ? distPath
    : fs.existsSync(altPath) ? altPath : null;

  if (!resolvedPath) {
    throw new Error(
      `Could not find the build directory. Tried:\n  ${distPath}\n  ${altPath}\nMake sure to run 'npm run build' first.`,
    );
  }

  app.use(express.static(resolvedPath, { index: false }));

  // Serve index.html for all non-asset routes, injecting runtime config
  // so the frontend works even when VITE_* env vars weren't set at build time.
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(resolvedPath, "index.html");
    try {
      let html = fs.readFileSync(indexPath, "utf-8");

      // Build runtime config from server env vars (available at runtime)
      const runtimeConfig = {
        SUPABASE_URL:    process.env.SUPABASE_URL    || process.env.VITE_SUPABASE_URL    || "",
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "",
      };

      // Inject as the very first script in <head>
      const configScript = `<script>window.__RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig)};</script>`;
      html = html.replace("<head>", `<head>\n  ${configScript}`);

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch {
      res.sendFile(indexPath);
    }
  });
}
