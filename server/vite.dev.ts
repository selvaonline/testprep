import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: any) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('setupVite should not be called in production mode');
  }
  
  const { createServer: createViteServer, createLogger } = await import('vite');
  const viteConfig = await import('../vite.config');
  const viteLogger = createLogger();

  const vite = await createViteServer({
    ...viteConfig.default,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
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
  const publicPath = path.join(process.cwd(), "dist", "public");
  const indexPath = path.join(publicPath, "index.html");

  if (!fs.existsSync(publicPath) || !fs.existsSync(indexPath)) {
    throw new Error("Could not find the build directory");
  }

  app.use(express.static(publicPath));
  app.get("*", (_req, res) => res.sendFile(indexPath));
}
