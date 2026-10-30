import { describe, it } from "node:test";
import assert from "node:assert/strict";
import authorize from "../middleware/authorize.middleware.js";

describe("Authorize Middleware Unit Tests", () => {
  it("should call next() if user role is allowed", () => {
    let nextCalled = false;
    let nextError = null;

    const middleware = authorize("ADMIN");
    const req = { user: { role: "ADMIN" } };
    const res = {};
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
  });

  it("should pass AppError(403) to next() if user role is forbidden", () => {
    let nextError = null;

    const middleware = authorize("ADMIN");
    const req = { user: { role: "USER" } };
    const res = {};
    const next = (err) => {
      nextError = err;
    };

    middleware(req, res, next);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 403);
    assert.equal(nextError.errorCode, "FORBIDDEN");
  });

  it("should pass AppError(401) to next() if req.user is missing", () => {
    let nextError = null;

    const middleware = authorize("ADMIN");
    const req = {};
    const res = {};
    const next = (err) => {
      nextError = err;
    };

    middleware(req, res, next);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 401);
    assert.equal(nextError.errorCode, "NOT_AUTHENTICATED");
  });
});
