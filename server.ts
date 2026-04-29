import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { scanDatabaseSchema, getStoredProcedures, getKeys } from "./src/services/dbScanner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/scan", express.json(), async (req, res) => {
    try {
      const { connectionString } = req.body;
      const results = await scanDatabaseSchema(connectionString);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Failed to scan database" });
    }
  });

  app.post("/api/procedures", express.json(), async (req, res) => {
    try {
      const { connectionString } = req.body;
      const results = await getStoredProcedures(connectionString);
      res.json(results.recordset);
    } catch (err) {
      res.status(500).json({ error: "Failed to scan procedures" });
    }
  });

  app.post("/api/keys", express.json(), async (req, res) => {
    try {
      const { connectionString } = req.body;
      const results = await getKeys(connectionString);
      res.json(results.recordset);
    } catch (err) {
      res.status(500).json({ error: "Failed to scan keys" });
    }
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
