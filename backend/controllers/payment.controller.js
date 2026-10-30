import crypto from "crypto";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  initiatePhonePeTransaction,
  verifyPhonePeSignature,
  queryPhonePeStatus,
} from "../services/payment.service.js";
import { decrementInventoryForOrder } from "../services/inventory.service.js";
import { clearCart } from "../services/cart.service.js";

/**
 * Handle successful payment for an order idempotently:
 * 1. Mark order paymentStatus as "paid"
 * 2. Clear user's cart
 * 3. Atomically decrement product stock
 */
const handlePaymentSuccess = async (order, transactionId) => {
  if (!order || order.paymentStatus === "paid") {
    return order;
  }

  // Atomically update payment status if not already paid
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: "paid" } },
    { paymentStatus: "paid", phonePePaymentId: transactionId },
    { new: true }
  );

  if (updatedOrder) {
    // Clear user's cart
    await clearCart(updatedOrder.user);

    // Atomically decrement product stock
    await decrementInventoryForOrder(updatedOrder.items);
  }

  return updatedOrder || order;
};

/* ─── Initiate PhonePe payment ────────────────────────── */
export const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new AppError("Order ID is required", 400, "MISSING_ORDER_ID");
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  // PhonePe limit for transaction ID is 35 chars
  const merchantTransactionId = `TXN_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const amountInPaise = Math.round(order.total * 100);

  const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-success/${orderId}`;
  const callbackUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/payment/phonepe-callback`;

  const phonePeUrl = await initiatePhonePeTransaction({
    merchantTransactionId,
    amountInPaise,
    userId: req.user._id,
    redirectUrl,
    callbackUrl,
  });

  // Save transaction ID on the order for callback verification
  order.phonePeTransactionId = merchantTransactionId;
  await order.save();

  return res.json({ success: true, redirectUrl: phonePeUrl });
});

/* ─── PhonePe server-to-server callback ──────────────── */
export const phonePeCallback = asyncHandler(async (req, res) => {
  const { response: encodedResponse } = req.body;
  if (!encodedResponse) {
    throw new AppError("No response payload", 400, "MISSING_PAYLOAD");
  }

  // ── Signature verification ─────────────────────────────
  const receivedChecksum = req.headers["x-verify"];
  if (!verifyPhonePeSignature(encodedResponse, receivedChecksum)) {
    console.error("[SECURITY] Invalid PhonePe callback signature", {
      requestId: req.id,
    });
    throw new AppError("Invalid signature", 401, "INVALID_SIGNATURE");
  }

  const decoded = JSON.parse(
    Buffer.from(encodedResponse, "base64").toString("utf-8")
  );
  const { merchantTransactionId, transactionId, code } = decoded;

  if (code === "PAYMENT_SUCCESS") {
    const order = await Order.findOne({ phonePeTransactionId: merchantTransactionId });
    if (order) {
      await handlePaymentSuccess(order, transactionId);
    }
  }

  return res.status(200).send("OK");
});

/* ─── Poll payment status (called by frontend) ───────── */
export const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  const txnId = order.phonePeTransactionId;
  if (!txnId) return res.json({ paymentStatus: order.paymentStatus });

  // Query PhonePe status service
  const { code, phonePePaymentId } = await queryPhonePeStatus(txnId);

  if (code === "PAYMENT_SUCCESS" && order.paymentStatus !== "paid") {
    await handlePaymentSuccess(order, phonePePaymentId);
  } else if (code === "PAYMENT_ERROR" && order.paymentStatus !== "paid") {
    order.paymentStatus = "failed";
    await order.save();
  }

  return res.json({ paymentStatus: order.paymentStatus, code });
});
