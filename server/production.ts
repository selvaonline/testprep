import express from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: express.Express) {
  const publicPath = path.join(process.cwd(), "dist", "public");
  const indexPath = path.join(publicPath, "index.html");

  if (!fs.existsSync(publicPath) || !fs.existsSync(indexPath)) {
    throw new Error("Could not find the build directory");
  }

  app.use(express.static(publicPath));
  app.get("*", (_req, res) => res.sendFile(indexPath));
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}
