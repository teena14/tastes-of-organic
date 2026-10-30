/**
 * Production-ready structured logger with correlation ID support.
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel =
  LOG_LEVELS[process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")] ??
  LOG_LEVELS.info;

const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();

  if (process.env.NODE_ENV === "production") {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  }

  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const metaString = Object.keys(meta).length > 0 ? " " + JSON.stringify(meta) : "";
  return `${prefix} ${message}${metaString}`;
};

export const logger = {
  debug: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.debug(formatLog("debug", message, meta));
    }
  },
  info: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.info(formatLog("info", message, meta));
    }
  },
  warn: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatLog("warn", message, meta));
    }
  },
  error: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatLog("error", message, meta));
    }
  },
};

export default logger;
