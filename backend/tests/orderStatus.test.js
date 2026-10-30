import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ORDER_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
  isValidStatusTransition,
} from "../constants/orderStatus.js";
import { validateInventoryForCart } from "../services/inventory.service.js";
import {
  generatePhonePeChecksum,
  verifyPhonePeSignature,
} from "../services/payment.service.js";

describe("Order Lifecycle State Machine Tests", () => {
  it("should allow legal state transitions", () => {
    assert.equal(isValidStatusTransition(ORDER_STATUS.PLACED, ORDER_STATUS.PROCESSING), true);
    assert.equal(isValidStatusTransition(ORDER_STATUS.PLACED, ORDER_STATUS.CANCELLED), true);
    assert.equal(isValidStatusTransition(ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED), true);
    assert.equal(isValidStatusTransition(ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED), true);
    assert.equal(isValidStatusTransition(ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED), true);
  });

  it("should reject illegal state transitions", () => {
    // Cannot skip states
    assert.equal(isValidStatusTransition(ORDER_STATUS.PLACED, ORDER_STATUS.DELIVERED), false);
    // Cannot backtrack
    assert.equal(isValidStatusTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PLACED), false);
    assert.equal(isValidStatusTransition(ORDER_STATUS.SHIPPED, ORDER_STATUS.PROCESSING), false);
    // Terminal states cannot transition
    assert.equal(isValidStatusTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED), false);
    assert.equal(isValidStatusTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.PLACED), false);
  });
});

describe("Inventory Service Unit Tests", () => {
  it("should pass validation when cart products have sufficient stock", () => {
    const validCart = [
      {
        product: { _id: "prod1", name: "Honey", stock: 10 },
        quantity: 2,
      },
      {
        product: { _id: "prod2", name: "Millet", stock: 5 },
        quantity: 5,
      },
    ];

    assert.doesNotThrow(() => validateInventoryForCart(validCart));
  });

  it("should throw AppError when cart item exceeds available stock", () => {
    const oversoldCart = [
      {
        product: { _id: "prod1", name: "Cold Pressed Oil", stock: 3 },
        quantity: 4,
      },
    ];

    assert.throws(
      () => validateInventoryForCart(oversoldCart),
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.errorCode, "INSUFFICIENT_STOCK");
        return true;
      }
    );
  });

  it("should throw AppError when cart product was deleted", () => {
    const deletedProductCart = [
      {
        product: null,
        quantity: 1,
      },
    ];

    assert.throws(
      () => validateInventoryForCart(deletedProductCart),
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.errorCode, "PRODUCT_UNAVAILABLE");
        return true;
      }
    );
  });
});

describe("PhonePe Payment Service Tests", () => {
  it("should generate deterministic checksums with salt key and index", () => {
    const payload = Buffer.from(JSON.stringify({ test: 123 })).toString("base64");
    const checksum1 = generatePhonePeChecksum("/pg/v1/pay", payload);
    const checksum2 = generatePhonePeChecksum("/pg/v1/pay", payload);
    assert.equal(checksum1, checksum2);
    assert.ok(checksum1.includes("###"));
  });

  it("should verify PhonePe signatures correctly", () => {
    const payload = Buffer.from(JSON.stringify({ code: "PAYMENT_SUCCESS" })).toString("base64");
    const validChecksum = generatePhonePeChecksum("", payload); // callback uses payload + saltKey
    const isValid = verifyPhonePeSignature(payload, validChecksum);
    assert.equal(isValid, true);

    const fakeChecksum = "forged_checksum###1";
    assert.equal(verifyPhonePeSignature(payload, fakeChecksum), false);
    assert.equal(verifyPhonePeSignature(null, validChecksum), false);
  });
});
