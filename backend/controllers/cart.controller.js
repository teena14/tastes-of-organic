import asyncHandler from "../utils/asyncHandler.js";
import {
  getUserCartWithTotals,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
} from "../services/cart.service.js";

/* ─── Get current user's cart ────────────────────────── */
export const getCart = asyncHandler(async (req, res) => {
  const data = await getUserCartWithTotals(req.user._id);

  return res.json({
    success: true,
    data,
  });
});

/* ─── Add item to cart ───────────────────────────────── */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const items = await addItemToCart(req.user._id, productId, size || "");

  return res.json({
    success: true,
    cart: items,
  });
});

/* ─── Update item quantity ───────────────────────────── */
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { productId, size, action } = req.body;
  const items = await updateItemQuantity(
    req.user._id,
    productId,
    size || "",
    action
  );

  return res.json({
    success: true,
    cart: items,
  });
});

/* ─── Remove item from cart ──────────────────────────── */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const items = await removeItemFromCart(req.user._id, productId, size || "");

  return res.json({
    success: true,
    cart: items,
  });
});