import dotenv from "dotenv";
dotenv.config();

/* ─── Required variables — the server will refuse to start without these ─── */
const REQUIRED = [
  "MONGO_URI",
  "JWT_SECRET",
  "PHONEPE_MERCHANT_ID",
  "PHONEPE_SALT_KEY",
];

/* ─── Optional variables — defaults applied if missing ─── */
const DEFAULTS = {
  PORT: "5000",
  NODE_ENV: "development",
  PHONEPE_SALT_INDEX: "1",
  PHONEPE_BASE_URL: "https://api-preprod.phonepe.com/apis/pg-sandbox",
  FRONTEND_URL: "http://localhost:5173",
  BACKEND_URL: "http://localhost:5000",
};

/**
 * Validate that all required env vars are present.
 * Call this once at startup, before connecting to the database.
 */
export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `\n❌  Missing required environment variables:\n   ${missing.join(", ")}\n`
    );
    console.error("   See .env.example for the required configuration.\n");
    process.exit(1);
  }

  // Apply defaults for optional vars
  for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }
}

/**
 * Convenience accessors (read-only).
 * Import as:  import env from "./config/env.js";
 */
const env = {
  get port() {
    return parseInt(process.env.PORT, 10) || 5000;
  },
  get nodeEnv() {
    return process.env.NODE_ENV || "development";
  },
  get isProduction() {
    return this.nodeEnv === "production";
  },
  get mongoUri() {
    return process.env.MONGO_URI;
  },
  get jwtSecret() {
    return process.env.JWT_SECRET;
  },
  get phonepe() {
    return {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      saltKey: process.env.PHONEPE_SALT_KEY,
      saltIndex: process.env.PHONEPE_SALT_INDEX || "1",
      baseUrl:
        process.env.PHONEPE_BASE_URL ||
        "https://api-preprod.phonepe.com/apis/pg-sandbox",
    };
  },
  get frontendUrl() {
    return process.env.FRONTEND_URL || "http://localhost:5173";
  },
  get backendUrl() {
    return process.env.BACKEND_URL || "http://localhost:5000";
  },
  get email() {
    return {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    };
  },
};

export default env;
