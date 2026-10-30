import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSubscriptionSchema = z.object({
  products: z
    .array(
      z.object({
        product: z
          .string({ required_error: "Product ID is required" })
          .regex(objectIdRegex, "Invalid Product ID format"),
        quantity: z
          .number({ required_error: "Quantity is required" })
          .int()
          .positive("Quantity must be greater than zero"),
        size: z.string().optional(),
      })
    )
    .min(1, "Select at least one product for subscription"),
  durationMonths: z.coerce
    .number({ required_error: "Duration is required" })
    .refine((v) => [3, 6, 12].includes(v), {
      message: "Subscription duration must be 3, 6, or 12 months",
    }),
  shippingAddress: z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters"),
      phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
      addressLine1: z.string().trim().min(3, "Address line 1 is required"),
      addressLine2: z.string().trim().optional().default(""),
      city: z.string().trim().min(2, "City is required"),
      state: z.string().trim().min(2, "State is required"),
      postalCode: z.string().trim().min(3, "Postal code is required"),
    })
    .optional(),
});
