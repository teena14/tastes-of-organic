import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

/**
 * Validates that all cart items have sufficient stock available.
 * @param {Array<{ product: object, quantity: number }>} cartItems
 */
export const validateInventoryForCart = (cartItems) => {
  for (const item of cartItems) {
    if (!item.product) {
      throw new AppError(
        "A product in your cart is no longer available",
        400,
        "PRODUCT_UNAVAILABLE"
      );
    }

    if (item.product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, requested: ${item.quantity}.`,
        400,
        "INSUFFICIENT_STOCK"
      );
    }
  }
};

/**
 * Atomically decrements product stock for paid order items.
 * Uses MongoDB $inc with $gte to prevent overselling.
 * @param {Array<{ product: string|object, quantity: number }>} orderItems
 */
export const decrementInventoryForOrder = async (orderItems) => {
  if (!Array.isArray(orderItems)) return;

  for (const item of orderItems) {
    const productId = item.product?._id || item.product;
    if (productId && item.quantity > 0) {
      const result = await Product.updateOne(
        { _id: productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount === 0) {
        console.warn(
          `[INVENTORY] Insufficient stock to decrement for product ${productId}.`
        );
      }
    }
  }
};

/**
 * Restores product stock when an order is cancelled or refunded.
 * @param {Array<{ product: string|object, quantity: number }>} orderItems
 */
export const restoreInventoryForOrder = async (orderItems) => {
  if (!Array.isArray(orderItems)) return;

  for (const item of orderItems) {
    const productId = item.product?._id || item.product;
    if (productId && item.quantity > 0) {
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: item.quantity } }
      );
    }
  }
};
