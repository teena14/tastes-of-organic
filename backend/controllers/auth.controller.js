import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

/* ─── Helpers ──────────────────────────────────────────── */

// bcryptjs with 12 rounds (stronger than the previous 10).
// argon2id would be ideal but requires native C++ build tools
// which aren't available in this environment. bcryptjs at 12 rounds
// is still considered production-grade for password hashing.
const BCRYPT_ROUNDS = 12;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/** Hash a password with bcryptjs */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/** Verify a password against a bcrypt hash */
const verifyPassword = (password, hash) => {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(password, hash);
};

/* ─── Nodemailer transporter ─────────────────────────── */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup — logs a clear error if credentials are wrong
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error.message);
    console.error("Gmail requires a 16-char App Password (not your regular password).");
    console.error("   Go to: Google Account → Security → 2-Step Verification → App Passwords");
  } else {
    console.log("Email transporter ready");
  }
});

/* ─── Register ───────────────────────────────────────── */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400, "MISSING_FIELDS");
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400, "WEAK_PASSWORD");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", 400, "USER_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/* ─── Login ──────────────────────────────────────────── */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400, "MISSING_FIELDS");
  }

  const user = await User.findOne({ email });

  // Google-only accounts have no password field
  if (!user || !user.password) {
    throw new AppError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }

  // Transparently migrate older hashes (e.g. 10 rounds) to 12 rounds
  try {
    if (bcrypt.getRounds(user.password) < BCRYPT_ROUNDS) {
      user.password = await hashPassword(password);
      await user.save();
    }
  } catch (err) {
    console.warn("Could not check/upgrade password rounds:", err.message);
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/* ─── Google Auth ────────────────────────────────────── */
export const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Google token is required", 400, "MISSING_TOKEN");
  }

  // Fetch user info using the Google Access Token
  const response = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const { sub: googleId, email, name } = response.data;

  // Check if user already exists
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email, googleId });
  } else if (!user.googleId) {
    // Connect Google account to existing user
    user.googleId = googleId;
    await user.save();
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/* ─── Forgot Password — Step 1: Send OTP ─────────────── */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400, "MISSING_EMAIL");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal whether the email exists
    return res.json({ success: true, message: "If that email is registered, a code has been sent." });
  }

  // Generate cryptographically secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  user.resetOtp = hashedOtp;
  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.resetOtpVerified = false;
  await user.save();

  // Send email
  await transporter.sendMail({
    from: `"Tastes of Organic 🌿" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your Password Reset Code",
    html: `
      <div style="font-family:Poppins,sans-serif;max-width:480px;margin:auto;padding:32px;background:#F8F6F0;border-radius:16px;">
        <h2 style="color:#1B5E20;margin-top:0;">Password Reset Request</h2>
        <p style="color:#555;line-height:1.7;">Hi ${user.name},</p>
        <p style="color:#555;line-height:1.7;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="margin:28px 0;text-align:center;">
          <span style="display:inline-block;background:#1B5E20;color:#fff;font-size:32px;font-weight:700;letter-spacing:12px;padding:16px 32px;border-radius:12px;">
            ${otp}
          </span>
        </div>
        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  res.json({ success: true, message: "If that email is registered, a code has been sent." });
});

/* ─── Forgot Password — Step 2: Verify OTP ───────────── */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400, "MISSING_FIELDS");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.resetOtp || !user.resetOtpExpiry) {
    throw new AppError("No reset request found. Please start again.", 400, "NO_RESET_REQUEST");
  }

  if (new Date() > user.resetOtpExpiry) {
    throw new AppError("The code has expired. Please request a new one.", 400, "OTP_EXPIRED");
  }

  const isMatch = await bcrypt.compare(otp, user.resetOtp);
  if (!isMatch) {
    throw new AppError("Incorrect code. Please try again.", 400, "INVALID_OTP");
  }

  user.resetOtpVerified = true;
  await user.save();

  res.json({ success: true, message: "Code verified." });
});

/* ─── Forgot Password — Step 3: Reset Password ───────── */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    throw new AppError("Email and new password are required", 400, "MISSING_FIELDS");
  }

  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400, "WEAK_PASSWORD");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.resetOtpVerified) {
    throw new AppError("Session invalid. Please start the reset process again.", 400, "INVALID_RESET_SESSION");
  }

  if (new Date() > user.resetOtpExpiry) {
    throw new AppError("Session expired. Please start over.", 400, "RESET_SESSION_EXPIRED");
  }

  user.password = await hashPassword(newPassword);

  // Clear OTP fields
  user.resetOtp = null;
  user.resetOtpExpiry = null;
  user.resetOtpVerified = false;
  await user.save();

  res.json({ success: true, message: "Password reset successfully." });
});