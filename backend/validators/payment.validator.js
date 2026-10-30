import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const initiatePaymentSchema = z.object({
  orderId: z
    .string({ required_error: "Order ID is required" })
    .regex(objectIdRegex, "Invalid Order ID format"),
});
