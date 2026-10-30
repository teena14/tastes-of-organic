import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    throw new AppError("Product ID is required", 400, "MISSING_PRODUCT_ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const alreadyExists = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (!alreadyExists) {
    user.wishlist.push(productId);
    await user.save();
  }

  return res.json({
    success: true,
    wishlist: user.wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    throw new AppError("Product ID is required", 400, "MISSING_PRODUCT_ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );

  await user.save();

  return res.json({ success: true, wishlist: user.wishlist });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate("wishlist");
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return res.json({
    success: true,
    data: user.wishlist,
  });
});