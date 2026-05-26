import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

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

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

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
    await connectDB();
  });
}

export default app;
