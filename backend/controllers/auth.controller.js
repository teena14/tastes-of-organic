import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
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
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ─── Login ──────────────────────────────────────────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ─── Google Auth ────────────────────────────────────── */
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Fetch user info using the Google Access Token
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const { sub: googleId, email, name, picture } = response.data;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        name,
        email,
        googleId,
      });
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
        email: user.email
      }
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google Authentication failed" });
  }
};

/* ─── Forgot Password — Step 1: Send OTP ─────────────── */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ success: true, message: "If that email is registered, a code has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
          <img src="cid:logo" alt="Tastes of Organic" style="height:48px;margin-bottom:24px;" />
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

  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Failed to send reset code. Please try again." });
  }
};

/* ─── Forgot Password — Step 2: Verify OTP ───────────── */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "No reset request found. Please start again." });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "The code has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect code. Please try again." });
    }

    user.resetOtpVerified = true;
    await user.save();

    res.json({ success: true, message: "Code verified." });

  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

/* ─── Forgot Password — Step 3: Reset Password ───────── */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtpVerified) {
      return res.status(400).json({ message: "Session invalid. Please start the reset process again." });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "Session expired. Please start over." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetOtpVerified = false;
    await user.save();

    res.json({ success: true, message: "Password reset successfully." });

  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Password reset failed. Please try again." });
  }
};