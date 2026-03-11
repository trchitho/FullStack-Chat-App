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

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start the server
const PORT = process.env.PORT;

// Convert __filename, __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Serve production build
if (process.env.NODE_ENV === 'production') {
    const distPath = join(__dirname, '../../frontend/dist');
    app.use(express.static(distPath));
  
    app.get('*', (req, res) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  }

httpServer.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
  connectDB();
});
