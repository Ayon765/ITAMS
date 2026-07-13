import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import JSZip from "jszip";
import http from "http";
import dotenv from "dotenv";
import {
  testTursoConnection,
  initializeTursoTables,
  executeTursoSql,
  saveStateToTurso,
  fetchStateFromTurso
} from "./src/server/turso";

// Load environment variables from .env file if it exists
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON request body
  app.use(express.json({ limit: "50mb" }));

  // Create HTTP Server
  const server = http.createServer(app);

  // Helper to recursively add files to zip
  async function addDirectoryToZip(zip: JSZip, dirPath: string, relativePath = "") {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (
        file === "node_modules" ||
        file === "dist" ||
        file === ".git" ||
        file === ".cursor" ||
        file === ".github" ||
        file === ".cache" ||
        file === ".npm"
      ) {
        continue;
      }
      const fullPath = path.join(dirPath, file);
      const fileRelativePath = relativePath ? `${relativePath}/${file}` : file;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const folder = zip.folder(fileRelativePath);
        if (folder) {
          await addDirectoryToZip(zip, fullPath, fileRelativePath);
        }
      } else {
        const content = fs.readFileSync(fullPath);
        zip.file(fileRelativePath, content);
      }
    }
  }

  // API Route to download the website source as a zip
  app.get("/api/download-zip", async (req, res) => {
    try {
      console.log("Creating website source zip...");
      const zip = new JSZip();
      await addDirectoryToZip(zip, process.cwd());
      const content = await zip.generateAsync({ type: "nodebuffer" });
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=it_asset_manager_website.zip");
      res.send(content);
    } catch (err: any) {
      console.error("Error creating zip:", err);
      res.status(500).json({ error: err.message || "Failed to create zip" });
    }
  });

  // Turso Database endpoints
  app.post("/api/turso/test", async (req, res) => {
    const { url, authToken } = req.body;
    const result = await testTursoConnection({ url, authToken });
    res.json(result);
  });

  app.post("/api/turso/init", async (req, res) => {
    const { url, authToken } = req.body;
    const result = await initializeTursoTables({ url, authToken });
    res.json(result);
  });

  app.post("/api/turso/query", async (req, res) => {
    const { url, authToken, sql, args } = req.body;
    const result = await executeTursoSql({ url, authToken }, sql, args);
    res.json(result);
  });

  app.post("/api/turso/save-state", async (req, res) => {
    const { url, authToken, key, data } = req.body;
    const success = await saveStateToTurso({ url, authToken }, key, data);
    res.json({ success });
  });

  app.get("/api/turso/load-state/:key", async (req, res) => {
    const { key } = req.params;
    const url = req.query.url as string;
    const authToken = req.query.authToken as string;
    const data = await fetchStateFromTurso({ url, authToken }, key);
    res.json({ success: data !== null, data });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on Server instead of App directly (vital for WebSockets)
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
