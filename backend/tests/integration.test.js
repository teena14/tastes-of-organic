import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../app.js";

describe("HTTP API Integration Tests", () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = "test";
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("GET /health should return 200 with structured health and readiness data", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.status === "healthy" || data.status === "degraded");
    assert.ok(typeof data.uptime === "number");
    assert.ok(data.services?.database);
    assert.ok(typeof data.services.database.readyState === "number");
    assert.ok(data.memory?.heapUsedMB);
    assert.ok(data.version);
  });

  it("GET /api/health alias should match /health response", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.timestamp);
    assert.ok(data.services?.database);
  });

  it("GET /api/unmatched-endpoint should return 404 with ROUTE_NOT_FOUND AppError", async () => {
    const res = await fetch(`${baseUrl}/api/unmatched-endpoint-path-987`);
    assert.equal(res.status, 404);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "ROUTE_NOT_FOUND");
    assert.match(data.message, /Route GET \/api\/unmatched-endpoint-path-987 not found/);
  });

  it("should auto-generate X-Request-ID when not provided by client", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const reqId = res.headers.get("x-request-id");
    assert.ok(reqId);
    assert.match(
      reqId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("should preserve client-supplied X-Request-ID header in response", async () => {
    const customId = "client-trace-id-xyz-999";
    const res = await fetch(`${baseUrl}/health`, {
      headers: { "x-request-id": customId },
    });
    const echoedId = res.headers.get("x-request-id");
    assert.equal(echoedId, customId);
  });

  it("should send security headers configured by Helmet", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });

  it("OPTIONS preflight should return appropriate CORS headers for whitelisted origin", async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    });

    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
  });

  it("should return 400 INVALID_JSON when body contains malformed JSON", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"email": "broken-json-without-closing-brace',
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "INVALID_JSON");
    assert.equal(data.message, "Malformed JSON payload in request body");
  });

  it("should return 413 PAYLOAD_TOO_LARGE when body exceeds 10kb limit", async () => {
    const largeString = "a".repeat(15 * 1024); // 15kb
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: largeString }),
    });

    assert.equal(res.status, 413);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "PAYLOAD_TOO_LARGE");
  });

  it("POST /api/auth/register with empty body should be rejected by Zod validation (400)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "VALIDATION_ERROR");
  });

  it("GET /api/cart without Authorization header should return 401 NO_TOKEN", async () => {
    const res = await fetch(`${baseUrl}/api/cart`);
    assert.equal(res.status, 401);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "NO_TOKEN");
  });

  it("GET /api/cart with malformed Bearer token should return 401 INVALID_TOKEN", async () => {
    const res = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: "Bearer bogus.jwt.token" },
    });
    assert.equal(res.status, 401);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "INVALID_TOKEN");
  });

  it("POST /api/products without token should be blocked by auth middleware (401 NO_TOKEN)", async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Organic Honey" }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error?.code, "NO_TOKEN");
  });
});
