import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import adminRoutes from "./routes/admin.route.js";
import notificationRoutes from "./routes/notification.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import friendshipRoutes from "./routes/friendship.route.js";
import profileRoutes from "./routes/profile.route.js";
import postRoutes from "./routes/post.route.js";

import cors from "cors";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, io, httpServer } from "./lib/socket.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requestContext, securityHeaders } from "./middlewares/security.middleware.js";
import { logger } from "./lib/logger.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";

dotenv.config();

const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? [/\.vercel\.app$/, /\.onrender\.com$/, process.env.CLIENT_URL].filter(Boolean)
  : "http://localhost:5173";

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(requestContext);
app.use(securityHeaders);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

let requestCount = 0;
let errorCount = 0;

// Request latency monitoring and logging
app.use((req, res, next) => {
  requestCount++;
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    if (res.statusCode >= 400) {
      errorCount++;
    }
    logger.info("request_completed", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      latencyMs: duration,
      ip: req.ip || req.headers["x-forwarded-for"] || "",
    }, req.id, req.user?._id);
  });
  next();
});

// Uptime and Health endpoints (unlimited)
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    const uptime = process.uptime();
    const clientCount = io ? io.engine.clientsCount : 0;
    res.status(200).json({
      status: "ok",
      uptime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: "connected",
      activeSockets: clientCount,
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.get("/api/ready", async (req, res) => {
  try {
    const conn = await connectDB();
    if (conn && conn.readyState === 1) {
      return res.status(200).json({ status: "ready" });
    }
    return res.status(503).json({ status: "not_ready" });
  } catch {
    return res.status(503).json({ status: "not_ready" });
  }
});

app.get("/api/metrics", (req, res) => {
  const clientCount = io ? io.engine.clientsCount : 0;
  res.status(200).json({
    uptime: process.uptime(),
    requestCount,
    errorCount,
    activeSocketCount: clientCount,
    memoryUsage: process.memoryUsage(),
  });
});

// Apply API limit and Database connection check to rest of the API
app.use("/api", apiLimiter);

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ message: "Database connection failed" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/friends", friendshipRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", notFoundHandler);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;

// Convert __filename, __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Serve production build outside Vercel. Vercel serves frontend/dist directly.
if (isProduction && !isVercel) {
  const distPath = join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

if (!isVercel) {
  httpServer.listen(PORT, async () => {
    console.log("Server is running on port:" + PORT);
    try {
      await connectDB();
    } catch (error) {
      console.error("Initial database connection failed:", error.message);
    }
  });
}

export default app;
