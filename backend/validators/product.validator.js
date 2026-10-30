import { z } from "zod";

const CATEGORIES = [
  "HONEY",
  "PULSES",
  "WHEAT",
  "MILLET",
  "SPICES",
  "OILS",
  "JUICE",
  "JUICES",
  "FLOUR",
  "COMBOS",
];

export const createProductSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must not exceed 200 characters"),
  description: z
    .string({ required_error: "Product description is required" })
    .trim()
    .min(5, "Description must be at least 5 characters"),
  category: z.enum(
    [
      "HONEY",
      "PULSES",
      "WHEAT",
      "MILLET",
      "SPICES",
      "OILS",
      "JUICE",
      "JUICES",
      "FLOUR",
      "COMBOS",
    ],
    {
      errorMap: () => ({ message: "Invalid product category" }),
    }
  ),
  price: z
    .number({ required_error: "Price is required" })
    .positive("Price must be greater than zero"),
  mrp: z.number().nonnegative().optional().default(0),
  stock: z
    .number({ required_error: "Stock is required" })
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative")
    .default(0),
  images: z.array(z.string()).optional().default([]),
  comboItems: z.array(z.string()).optional(),
  comboCategories: z.array(z.string()).optional(),
  sizes: z
    .array(
      z.object({
        size: z.string().min(1, "Size is required"),
        price: z.number().positive("Variant price must be greater than zero"),
        mrp: z.number().nonnegative().optional().default(0),
      })
    )
    .optional(),
  isSubscriptionAllowed: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  concern: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.string().optional(),
  concern: z.string().optional(),
  sort: z
    .enum(["price-asc", "price-desc", "rating", "newest", ""])
    .optional(),
  search: z.string().trim().optional(),
  featured: z.enum(["true", "false", ""]).optional(),
});
