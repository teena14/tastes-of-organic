import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
});

export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "New password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),
});

export const googleAuthSchema = z.object({
  token: z
    .string({ required_error: "Google token is required" })
    .min(10, "Invalid Google token"),
});
