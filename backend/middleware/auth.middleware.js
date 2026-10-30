import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Protect middleware — verifies JWT and attaches req.user.
 * Sensitive fields (password, OTP data) are excluded from the query.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, no token", 401, "NO_TOKEN");
  }

  // jwt.verify throws JsonWebTokenError / TokenExpiredError on failure —
  // both are caught by asyncHandler and handled by the error middleware.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select(
    "-password -resetOtp -resetOtpExpiry -resetOtpVerified"
  );

  if (!user) {
    throw new AppError("Not authorized, user not found", 401, "USER_NOT_FOUND");
  }

  req.user = user;
  next();
});