import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleAuth,
} from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate({ body: registerSchema }), registerUser);
router.post("/login", validate({ body: loginSchema }), loginUser);
router.post("/google", validate({ body: googleAuthSchema }), googleAuth);
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), forgotPassword);
router.post("/verify-otp", validate({ body: verifyOtpSchema }), verifyOtp);
router.post("/reset-password", validate({ body: resetPasswordSchema }), resetPassword);

export default router;