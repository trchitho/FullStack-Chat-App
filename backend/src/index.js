import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import adminRoutes from "./routes/admin.route.js";
import notificationRoutes from "./routes/notification.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import friendshipRoutes from "./routes/friendship.route.js";

import cors from "cors";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, httpServer } from "./lib/socket.js";

dotenv.config();

const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? [/\.vercel\.app$/, /\.onrender\.com$/, process.env.CLIENT_URL].filter(Boolean)
  : "http://localhost:5173";

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "degraded", database: "disconnected" });
  }
});

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
