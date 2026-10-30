import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  initiatePhonePeTransaction,
  verifyPhonePeSignature,
  queryPhonePeStatus,
} from "../services/payment.service.js";

const DISCOUNT_MAP = { 3: 10, 6: 15, 12: 20 };

/* ─── Create subscription + initiate PhonePe payment ──── */
export const createSubscription = asyncHandler(async (req, res) => {
  const { products, durationMonths, shippingAddress } = req.body;
  const userId = req.user._id;

  if (!products || products.length === 0) {
    throw new AppError("Select at least one product", 400, "EMPTY_PRODUCTS");
  }

  if (![3, 6, 12].includes(Number(durationMonths))) {
    throw new AppError("Invalid subscription duration", 400, "INVALID_DURATION");
  }

  const discountPercent = DISCOUNT_MAP[durationMonths];

  let monthlyTotal = 0;
  const enrichedProducts = [];

  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product not found: ${item.product}`, 404, "PRODUCT_NOT_FOUND");
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400, "INSUFFICIENT_STOCK");
    }
    if (!product.isSubscriptionAllowed) {
      throw new AppError(`${product.name} is not available for subscription`, 400, "SUBSCRIPTION_NOT_ALLOWED");
    }

    const variant = product.sizes?.find((v) => v.size === item.size);
    const itemPrice = variant ? variant.price : product.price;

    monthlyTotal += itemPrice * item.quantity;
    enrichedProducts.push({
      product: product._id,
      size: item.size,
      quantity: item.quantity,
    });
  }

  const discountedMonthly = monthlyTotal * (1 - discountPercent / 100);
  const totalPaid = discountedMonthly * durationMonths;
  const amountInPaise = Math.round(totalPaid * 100);

  const nextDeliveryDate = new Date();
  nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);

  const subscription = await Subscription.create({
    user: userId,
    products: enrichedProducts,
    durationMonths,
    discountPercent,
    totalPaid,
    nextDeliveryDate,
    status: "PENDING",
  });

  // PhonePe limit for transaction ID is 35 chars
  const merchantTransactionId = `SUB_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/subscription-success/${subscription._id}`;
  const callbackUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/subscriptions/phonepe-callback`;

  const phonePeUrl = await initiatePhonePeTransaction({
    merchantTransactionId,
    amountInPaise,
    userId,
    redirectUrl,
    callbackUrl,
  });

  subscription.phonePeTransactionId = merchantTransactionId;
  await subscription.save();

  return res.json({
    success: true,
    redirectUrl: phonePeUrl,
    subscriptionId: subscription._id,
  });
});

/* ─── PhonePe S2S callback for subscriptions ──────────── */
export const subscriptionPhonePeCallback = asyncHandler(async (req, res) => {
  const { response: encodedResponse } = req.body;
  if (!encodedResponse) {
    throw new AppError("No response payload", 400, "MISSING_PAYLOAD");
  }

  // ── Signature verification ─────────────────────────────
  const receivedChecksum = req.headers["x-verify"];
  if (!verifyPhonePeSignature(encodedResponse, receivedChecksum)) {
    console.error("[SECURITY] Invalid PhonePe subscription callback signature", {
      requestId: req.id,
    });
    throw new AppError("Invalid signature", 401, "INVALID_SIGNATURE");
  }

  const decoded = JSON.parse(
    Buffer.from(encodedResponse, "base64").toString("utf-8")
  );
  const { merchantTransactionId, code } = decoded;

  if (code === "PAYMENT_SUCCESS") {
    await Subscription.findOneAndUpdate(
      { phonePeTransactionId: merchantTransactionId, status: { $ne: "ACTIVE" } },
      { status: "ACTIVE" }
    );
  }

  return res.status(200).send("OK");
});

/* ─── Poll subscription payment status ───────────────── */
export const checkSubscriptionPaymentStatus = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!subscription) {
    throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
  }

  if (subscription.status === "ACTIVE") {
    return res.json({ status: "ACTIVE" });
  }

  const txnId = subscription.phonePeTransactionId;
  if (!txnId) return res.json({ status: subscription.status });

  const { code } = await queryPhonePeStatus(txnId);

  if (code === "PAYMENT_SUCCESS") {
    subscription.status = "ACTIVE";
    await subscription.save();
  }

  return res.json({ status: subscription.status, code });
});

/* ─── Get user's subscriptions ───────────────────────── */
export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .populate("products.product", "name price images sizes isSubscriptionAllowed")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, data: subscriptions });
});

/* ─── Cancel subscription ────────────────────────────── */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, status: "ACTIVE" },
    { status: "CANCELLED" },
    { new: true }
  );

  if (!subscription) {
    throw new AppError("Subscription not found or already cancelled", 404, "SUBSCRIPTION_NOT_FOUND");
  }

  return res.json({ success: true, subscription });
});
