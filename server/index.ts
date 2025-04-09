import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import eventsRouter from './routes/events';
import blogRouter from './routes/blog';
import boardRouter from './routes/board';
// Remove the documents router import as we're using the one in routes.ts
import { errorHandler } from './middleware/errorHandler';
import { initPins } from './init-firebase';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Middleware: log API routes with response timing and short JSON output
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/blog', blogRouter);
app.use('/api/board', boardRouter);
// Remove the documents router since we're using the one in routes.ts

(async () => {
  // Initialize Firebase pins collection
  try {
    await initPins();
  } catch (error) {
    console.error('Error initializing Firebase pins, continuing anyway:', error);
  }
  
  const server = await registerRoutes(app);

  // Error handler
  app.use(errorHandler);

  // Vite in dev, static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Cross-platform + Replit safe server binding
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  const isReplit = !!process.env.REPL_ID;
  const host = isReplit ? "0.0.0.0" : "127.0.0.1";

  server.listen(port, host, () => {
    log(`Server running at http://${host}:${port}`);
  });
})();
