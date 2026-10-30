import { describe, it } from "node:test";
import assert from "node:assert/strict";
import validate from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
} from "../validators/auth.validator.js";
import {
  addToCartSchema,
  updateCartQuantitySchema,
} from "../validators/cart.validator.js";
import { placeOrderSchema } from "../validators/order.validator.js";
import { createProductSchema } from "../validators/product.validator.js";

describe("Validation Middleware Tests", () => {
  it("should call next() with sanitized data when request body is valid", () => {
    let nextCalled = false;
    let nextError = null;

    const middleware = validate({ body: loginSchema });
    const req = {
      body: {
        email: "  TestUser@Example.com  ",
        password: "SecretPassword1",
      },
    };
    const res = {};
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
    assert.equal(req.body.email, "testuser@example.com"); // trimmed and lowercased
  });

  it("should pass AppError(400) to next() when request body is invalid", () => {
    let nextError = null;

    const middleware = validate({ body: loginSchema });
    const req = {
      body: {
        email: "not-an-email",
        password: "",
      },
    };
    const res = {};
    const next = (err) => {
      nextError = err;
    };

    middleware(req, res, next);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 400);
    assert.equal(nextError.errorCode, "VALIDATION_ERROR");
    assert.ok(Array.isArray(nextError.errors));
    assert.ok(nextError.errors.length > 0);
  });
});

describe("Auth Validators Tests", () => {
  it("should validate strong registration details", () => {
    const valid = registerSchema.safeParse({
      name: "Organic Farmer",
      email: "farmer@organic.com",
      password: "StrongPassword123",
    });
    assert.equal(valid.success, true);
    assert.equal(valid.data.email, "farmer@organic.com");
  });

  it("should reject password without numbers or letters", () => {
    const noNumbers = registerSchema.safeParse({
      name: "Organic Farmer",
      email: "farmer@organic.com",
      password: "onlylettersinpassword",
    });
    assert.equal(noNumbers.success, false);

    const tooShort = registerSchema.safeParse({
      name: "Organic Farmer",
      email: "farmer@organic.com",
      password: "short1",
    });
    assert.equal(tooShort.success, false);
  });

  it("should enforce exact 6-digit numeric OTP", () => {
    const validOtp = verifyOtpSchema.safeParse({
      email: "test@example.com",
      otp: "123456",
    });
    assert.equal(validOtp.success, true);

    const alphaOtp = verifyOtpSchema.safeParse({
      email: "test@example.com",
      otp: "12345a",
    });
    assert.equal(alphaOtp.success, false);

    const shortOtp = verifyOtpSchema.safeParse({
      email: "test@example.com",
      otp: "12345",
    });
    assert.equal(shortOtp.success, false);
  });
});

describe("Cart and Order Validators Tests", () => {
  it("should validate correct Mongo ObjectId for cart items", () => {
    const valid = addToCartSchema.safeParse({
      productId: "507f1f77bcf86cd799439011",
      size: "500g",
    });
    assert.equal(valid.success, true);

    const invalid = addToCartSchema.safeParse({
      productId: "invalid-id-123",
    });
    assert.equal(invalid.success, false);
  });

  it("should enforce valid cart update actions", () => {
    const validIncrease = updateCartQuantitySchema.safeParse({
      productId: "507f1f77bcf86cd799439011",
      action: "increase",
    });
    assert.equal(validIncrease.success, true);

    const invalidAction = updateCartQuantitySchema.safeParse({
      productId: "507f1f77bcf86cd799439011",
      action: "multiply",
    });
    assert.equal(invalidAction.success, false);
  });

  it("should require complete shipping address for orders", () => {
    const validOrder = placeOrderSchema.safeParse({
      shippingAddress: {
        name: "Teena Verma",
        phone: "9876543210",
        addressLine1: "123 Green Valley Lane",
        city: "Jaipur",
        state: "Rajasthan",
        postalCode: "302001",
      },
    });
    assert.equal(validOrder.success, true);

    const incompleteOrder = placeOrderSchema.safeParse({
      shippingAddress: {
        name: "Teena",
        phone: "9876543210",
      },
    });
    assert.equal(incompleteOrder.success, false);
  });
});

describe("Product Validator Tests", () => {
  it("should validate product creation with allowed category and positive price", () => {
    const valid = createProductSchema.safeParse({
      name: "Wild Forest Raw Honey",
      description: "100% natural pure unfiltered organic honey sourced from forest beehives.",
      category: "HONEY",
      price: 499,
      stock: 50,
    });
    assert.equal(valid.success, true);
  });

  it("should reject product with invalid category or negative price", () => {
    const invalidCategory = createProductSchema.safeParse({
      name: "Wild Forest Raw Honey",
      description: "100% natural pure unfiltered organic honey sourced from forest beehives.",
      category: "ELECTRONICS",
      price: 499,
      stock: 50,
    });
    assert.equal(invalidCategory.success, false);

    const negativePrice = createProductSchema.safeParse({
      name: "Wild Forest Raw Honey",
      description: "100% natural pure unfiltered organic honey sourced from forest beehives.",
      category: "HONEY",
      price: -50,
      stock: 50,
    });
    assert.equal(negativePrice.success, false);
  });
});
