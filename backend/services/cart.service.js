import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

/**
 * Calculates cart pricing totals based on current product prices & variants.
 * @param {Array<object>} items
 * @returns {{ items: Array<object>, subtotal: number, delivery: number, total: number, totalItems: number }}
 */
export const calculateCartTotals = (items) => {
  let subtotal = 0;
  let totalItems = 0;

  const validItems = items.filter((item) => item.product);

  validItems.forEach((item) => {
    const variant = item.product.sizes?.find((v) => v.size === item.size);
    const itemPrice = variant ? variant.price : item.product.price;
    subtotal += itemPrice * item.quantity;
    totalItems += item.quantity;
  });

  const delivery = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + delivery;

  return {
    items: validItems,
    subtotal,
    delivery,
    total,
    totalItems,
  };
};

/**
 * Retrieves or creates a Cart document for a user.
 * Automatically performs transparent on-the-fly migration if user has legacy embedded cart items.
 * @param {string} userId
 * @returns {Promise<import("mongoose").Document>}
 */
export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    // Check if user has legacy cart items embedded in User document
    const user = await User.findById(userId);
    const initialItems = (user && Array.isArray(user.cart) && user.cart.length > 0)
      ? user.cart.map((item) => ({
          product: item.product,
          size: item.size || "",
          quantity: item.quantity || 1,
        }))
      : [];

    cart = await Cart.create({
      user: userId,
      items: initialItems,
    });

    // Clear legacy embedded cart on User to free space
    if (user && user.cart?.length > 0) {
      await User.findByIdAndUpdate(userId, { cart: [] });
    }
  }

  return cart;
};

/**
 * Fetches user's cart populated with product details and calculated totals.
 * @param {string} userId
 */
export const getUserCartWithTotals = async (userId) => {
  let cart = await getOrCreateCart(userId);
  await cart.populate("items.product");

  // Remove any deleted products
  const hadDeletedProducts = cart.items.some((item) => !item.product);
  if (hadDeletedProducts) {
    cart.items = cart.items.filter((item) => item.product);
    await cart.save();
  }

  return calculateCartTotals(cart.items);
};

/**
 * Adds an item to the user's cart after validating product existence and stock.
 * @param {string} userId
 * @param {string} productId
 * @param {string} [size=""]
 */
export const addItemToCart = async (userId, productId, size = "") => {
  const [cart, product] = await Promise.all([
    getOrCreateCart(userId),
    Product.findById(productId),
  ]);

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && item.size === size
  );

  const currentQuantity = existingItem ? existingItem.quantity : 0;
  if (product.stock <= currentQuantity) {
    throw new AppError(
      `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
      400,
      "INSUFFICIENT_STOCK"
    );
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      product: productId,
      size,
      quantity: 1,
    });
  }

  await cart.save();
  return cart.items;
};

/**
 * Updates quantity of an item in the cart.
 * @param {string} userId
 * @param {string} productId
 * @param {string} size
 * @param {"increase"|"decrease"} action
 */
export const updateItemQuantity = async (userId, productId, size = "", action) => {
  const cart = await getOrCreateCart(userId);

  const item = cart.items.find(
    (i) => i.product.toString() === productId && i.size === size
  );

  if (!item) {
    throw new AppError("Item not found in cart", 404, "CART_ITEM_NOT_FOUND");
  }

  if (action === "increase") {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }
    if (product.stock <= item.quantity) {
      throw new AppError(
        `Cannot add more. Only ${product.stock} available in stock.`,
        400,
        "INSUFFICIENT_STOCK"
      );
    }
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i.product.toString() === productId && i.size === size)
      );
    }
  }

  await cart.save();
  return cart.items;
};

/**
 * Removes an item from the cart.
 * @param {string} userId
 * @param {string} productId
 * @param {string} size
 */
export const removeItemFromCart = async (userId, productId, size = "") => {
  const cart = await getOrCreateCart(userId);

  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && item.size === size)
  );

  await cart.save();
  return cart.items;
};

/**
 * Clears all items from user's cart.
 * @param {string} userId
 */
export const clearCart = async (userId) => {
  await Promise.all([
    Cart.findOneAndUpdate({ user: userId }, { items: [] }),
    User.findByIdAndUpdate(userId, { cart: [] }),
  ]);
};
