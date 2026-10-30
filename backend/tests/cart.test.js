import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateCartTotals } from "../services/cart.service.js";

describe("Cart Service Unit Tests", () => {
  it("should calculate correct subtotal and apply delivery fee for orders under ₹500", () => {
    const items = [
      {
        product: { _id: "p1", name: "Wild Honey", price: 200, sizes: [] },
        quantity: 2,
        size: "",
      },
    ];

    const result = calculateCartTotals(items);
    assert.equal(result.subtotal, 400);
    assert.equal(result.delivery, 50); // Under 500 gets ₹50 delivery
    assert.equal(result.total, 450);
    assert.equal(result.totalItems, 2);
  });

  it("should provide free delivery for orders ₹500 and above", () => {
    const items = [
      {
        product: { _id: "p1", name: "Cold Pressed Oil", price: 300, sizes: [] },
        quantity: 2,
        size: "",
      },
    ];

    const result = calculateCartTotals(items);
    assert.equal(result.subtotal, 600);
    assert.equal(result.delivery, 0); // Free delivery >= 500
    assert.equal(result.total, 600);
    assert.equal(result.totalItems, 2);
  });

  it("should calculate variant pricing accurately", () => {
    const items = [
      {
        product: {
          _id: "p1",
          name: "Organic Honey",
          price: 200,
          sizes: [
            { size: "250g", price: 150 },
            { size: "500g", price: 280 },
          ],
        },
        quantity: 3,
        size: "500g",
      },
    ];

    const result = calculateCartTotals(items);
    assert.equal(result.subtotal, 280 * 3); // 840
    assert.equal(result.delivery, 0);
    assert.equal(result.total, 840);
    assert.equal(result.totalItems, 3);
  });

  it("should gracefully ignore deleted/null products", () => {
    const items = [
      {
        product: null, // deleted product
        quantity: 2,
        size: "",
      },
      {
        product: { _id: "p2", name: "Flour", price: 100, sizes: [] },
        quantity: 1,
        size: "",
      },
    ];

    const result = calculateCartTotals(items);
    assert.equal(result.items.length, 1);
    assert.equal(result.subtotal, 100);
    assert.equal(result.delivery, 50);
    assert.equal(result.total, 150);
  });
});
