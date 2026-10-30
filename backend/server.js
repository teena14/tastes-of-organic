import mongoose from "mongoose";
import { validateEnv } from "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js";
import logger from "./utils/logger.js";

// Validate environment variables before anything else
validateEnv();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(
      `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
    );
  });

  /* ─── Graceful shutdown ─────────────────────────────── */
  const shutdown = async (signal) => {
    logger.warn(`${signal} received. Starting graceful shutdown…`);

    server.close(async () => {
      logger.info("HTTP server closed");
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
      } catch (err) {
        logger.error("Error closing MongoDB connection", { error: err.message });
      }
      process.exit(signal === "unhandledRejection" ? 1 : 0);
    });

    // Force-kill after 10 s if graceful shutdown stalls
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection detected", {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception thrown", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error("Failed to start server", { error: err.message, stack: err.stack });
  process.exit(1);
});

