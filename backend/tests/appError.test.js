import { describe, it } from "node:test";
import assert from "node:assert/strict";
import AppError from "../utils/AppError.js";

describe("AppError Unit Tests", () => {
  it("should create an operational error with correct status and code", () => {
    const error = new AppError("Item not found", 404, "NOT_FOUND");
    assert.equal(error.message, "Item not found");
    assert.equal(error.statusCode, 404);
    assert.equal(error.errorCode, "NOT_FOUND");
    assert.equal(error.status, "fail");
    assert.equal(error.isOperational, true);
  });

  it("should categorize 5xx status codes as error", () => {
    const error = new AppError("Server failure", 500);
    assert.equal(error.status, "error");
    assert.equal(error.errorCode, "INTERNAL_ERROR");
  });
});
