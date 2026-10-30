import logger from "../utils/logger.js";

/**
 * Centralized error-handling middleware.
 *
 * Catches all errors forwarded via next(err) or thrown in async handlers.
 * Normalises Mongoose, JWT, body-parser, and AppError instances into a consistent
 * JSON response. Keeps `message` at the top level for backward
 * compatibility with the existing frontend (`err.response.data.message`).
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errorCode = err.errorCode || "INTERNAL_ERROR";

  // ── Body-parser JSON syntax error ───────────────────────
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && "body" in err) {
    statusCode = 400;
    errorCode = "INVALID_JSON";
    message = "Malformed JSON payload in request body";
  }

  // ── Body-parser payload too large ───────────────────────
  if (err.type === "entity.too.large" || statusCode === 413) {
    statusCode = 413;
    errorCode = "PAYLOAD_TOO_LARGE";
    message = "Request payload exceeds size limit (10kb)";
  }

  // ── Mongoose validation error ──────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(". ");
  }

  // ── Mongoose CastError (invalid ObjectId, etc.) ────────
  if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose duplicate key ─────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = "DUPLICATE_ENTRY";
    const field = Object.keys(err.keyValue || {}).join(", ");
    message = `Duplicate value for: ${field}`;
  }

  // ── JWT errors ─────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Token has expired";
  }

  // ── Build response ─────────────────────────────────────
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    success: false,
    // Top-level `message` kept for frontend backward compat
    message: isProduction && statusCode === 500 ? "Internal Server Error" : message,
    error: {
      code: errorCode,
      message: isProduction && statusCode === 500 ? "Internal Server Error" : message,
    },
  };

  // Include stack in development for debugging
  if (!isProduction && statusCode >= 500) {
    response.error.stack = err.stack;
  }

  // Log server errors (not client errors)
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl}`, {
      requestId: req.id,
      errorCode,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json(response);
};

export default errorHandler;

