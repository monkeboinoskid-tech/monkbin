import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // Advanced Proxy API to bypass CORS and frame-busting
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send("No target URL provided");
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      
      // Strip frame-busting headers for better compatibility
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Content-Security-Policy", "frame-ancestors *");
      res.setHeader("Access-Control-Allow-Origin", "*");

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).send("Proxy failed to fetch target URL");
    }
  });

  // Gemini AI Chat API
  app.post("/api/ai/chat", async (req, res) => {
    const { prompt, model = "gemini-3-flash-preview", history = [] } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the environment." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const contents = [
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ];

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: "You are Monk AI, the helpful AI assistant for MonkBin OS. You are witty, smart, and concise. MonkBin is a dark, minimal, bento-style OS environment.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini AI error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Mock Data APIs for Wallpapers
  app.get("/api/wallpapers", (req, res) => {
    res.json([
      { id: 'wp1', label: 'Neon City', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop' },
      { id: 'wp2', label: 'Dark Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop' },
      { id: 'wp3', label: 'Abstract Flow', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop' },
      { id: 'wp4', label: 'Cyberpunk Alley', url: 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?q=80&w=2070&auto=format&fit=crop' },
      { id: 'wp5', label: 'Deep Ocean', url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2070&auto=format&fit=crop' },
      { id: 'wp6', label: 'Minimal Sunset', url: 'https://images.unsplash.com/photo-1495312040523-28f041d8e134?q=80&w=2070&auto=format&fit=crop' },
      { id: 'wp7', label: 'Forest Mist', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop' },
      { id: 'wp8', label: 'Retro Grid', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop' }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // For SPA, we need to serve index.html for unknown routes but ensure it's transformed by Vite
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
