import crypto from "crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import "dotenv/config";
import logger from "./utils/logger.js";

import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

import errorHandler from "./middleware/error.middleware.js";
import AppError from "./utils/AppError.js";

const app = express();

// ── Request correlation ID ───────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// ── Structured HTTP request logger ────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    // Suppress health check polling logs unless error occurs
    if ((req.originalUrl === "/health" || req.originalUrl === "/api/health") && res.statusCode < 400) {
      return;
    }
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`, {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });
  next();
});

// ── Trust Proxy ──────────────────────────────────────────
// Required for accurate client IP identification behind reverse proxies (Nginx/Cloudflare)
app.set("trust proxy", 1);

// ── Security Middleware ──────────────────────────────────
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header (e.g. Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "X-VERIFY",
      "X-MERCHANT-ID",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: "_" });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  next();
});

// ── Rate limiting ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many auth requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many OTP attempts, please try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many payment requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/forgot-password", otpLimiter);
app.use("/api/auth/verify-otp", otpLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/orders/place", paymentLimiter);
app.use("/api", apiLimiter);

// ── Routes ───────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// ── Health & Readiness Probes ────────────────────────────
const healthCheckHandler = (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const mem = process.memoryUsage();

  const healthData = {
    status: isDbConnected ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    services: {
      database: {
        status: dbStatusMap[mongoose.connection.readyState] || "unknown",
        readyState: mongoose.connection.readyState,
      },
    },
    memory: {
      heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    },
    version: process.env.npm_package_version || "1.0.0",
  };

  // Return 200 if connected or in test environment; 503 if DB is disconnected in production
  const statusCode =
    isDbConnected || process.env.NODE_ENV === "test" || !process.env.NODE_ENV
      ? 200
      : 503;

  return res.status(statusCode).json(healthData);
};

app.get("/health", healthCheckHandler);
app.get("/api/health", healthCheckHandler);

// ── 404 handler for unmatched routes ─────────────────────
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"));
});

// ── Centralized error handler (must be last) ─────────────
app.use(errorHandler);

export default app;
