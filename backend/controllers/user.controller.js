import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select(
    "-password -resetOtp -resetOtpExpiry -resetOtpVerified"
  );

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  res.json({
    success: true,
    data: user,
  });
});
