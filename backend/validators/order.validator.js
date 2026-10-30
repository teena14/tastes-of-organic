import { z } from "zod";

export const placeOrderSchema = z.object({
  shippingAddress: z.object({
    name: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits"),
    addressLine1: z
      .string({ required_error: "Address line 1 is required" })
      .trim()
      .min(3, "Address line 1 must be at least 3 characters")
      .max(250, "Address line 1 must not exceed 250 characters"),
    addressLine2: z.string().trim().optional().default(""),
    city: z
      .string({ required_error: "City is required" })
      .trim()
      .min(2, "City must be at least 2 characters")
      .max(60, "City must not exceed 60 characters"),
    state: z
      .string({ required_error: "State is required" })
      .trim()
      .min(2, "State must be at least 2 characters")
      .max(60, "State must not exceed 60 characters"),
    postalCode: z
      .string({ required_error: "Postal code is required" })
      .trim()
      .min(3, "Postal code must be at least 3 characters")
      .max(10, "Postal code must not exceed 10 characters"),
  }),
});
