import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addToCartSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid Product ID format"),
  size: z.string().optional(),
});

export const updateCartQuantitySchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid Product ID format"),
  size: z.string().optional(),
  action: z.enum(["increase", "decrease"], {
    errorMap: () => ({ message: "Action must be 'increase' or 'decrease'" }),
  }),
});

export const removeFromCartSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid Product ID format"),
  size: z.string().optional(),
});
