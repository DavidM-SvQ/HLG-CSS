import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy endpoint for Google Sheets to bypass CORS and prevent type-casting loss
  app.get("/api/proxy-sheet", async (req, res) => {
    const sheetUrl = req.query.url as string;
    if (!sheetUrl) {
      return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    try {
      console.log(`[Proxy] Fetching Sheet URL: ${sheetUrl}`);
      const response = await fetch(sheetUrl);
      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }
      const data = await response.text();
      
      // Set appropriate content type and encoding
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(data);
    } catch (error: any) {
      console.error("[Proxy] Error fetching sheet:", error);
      res.status(500).json({ error: error.message || "Failed to fetch spreadsheet data" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware setup for development, otherwise serve static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
