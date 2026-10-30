import User from "../models/User.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  validateInventoryForCart,
  restoreInventoryForOrder,
} from "../services/inventory.service.js";
import { getUserCartWithTotals } from "../services/cart.service.js";
import { isValidStatusTransition } from "../constants/orderStatus.js";

/* ─── Place order (creates pending order) ────────────── */
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const userId = req.user._id;

  const cartData = await getUserCartWithTotals(userId);

  if (!cartData.items || cartData.items.length === 0) {
    throw new AppError("Cart is empty", 400, "CART_EMPTY");
  }

  if (
    !shippingAddress ||
    !shippingAddress.name ||
    !shippingAddress.phone ||
    !shippingAddress.addressLine1 ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.postalCode
  ) {
    throw new AppError(
      "All required shipping address fields must be filled",
      400,
      "INVALID_SHIPPING_ADDRESS"
    );
  }

  // Validate stock for all items
  validateInventoryForCart(cartData.items);

  const orderItems = cartData.items.map((item) => {
    const variant = item.product.sizes?.find((v) => v.size === item.size);
    const itemPrice = variant ? variant.price : item.product.price;

    return {
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || "",
      price: itemPrice,
      size: item.size,
      quantity: item.quantity,
    };
  });

  const subtotal = cartData.subtotal;
  const delivery = cartData.delivery;
  const total = cartData.total;

  // Checkout Idempotency: prevent accidental duplicate order creation within 60s
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const existingPendingOrder = await Order.findOne({
    user: userId,
    paymentStatus: "pending",
    orderStatus: "placed",
    total,
    createdAt: { $gte: oneMinuteAgo },
  });

  if (existingPendingOrder) {
    return res.json({
      success: true,
      order: existingPendingOrder,
      isDuplicate: true,
    });
  }

  // Create order with pending payment status
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    subtotal,
    delivery,
    total,
    paymentMethod: "online",
    paymentStatus: "pending",
    orderStatus: "placed",
  });

  // Save shipping address to user profile for autofill next time
  await User.findByIdAndUpdate(userId, { address: shippingAddress });

  return res.json({
    success: true,
    order,
  });
});

/* ─── Get all orders for current user ────────────────── */
export const getUserOrders = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };

  if (req.query.page || req.query.limit) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  }

  // Backwards-compatible path returning full list with .lean()
  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

  return res.json({
    success: true,
    data: orders,
  });
});

/* ─── Get single order by ID ─────────────────────────── */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  return res.json({
    success: true,
    data: order,
  });
});

/* ─── Cancel order (user or admin) ───────────────────── */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const query =
    req.user.role === "ADMIN" ? { _id: id } : { _id: id, user: userId };
  const order = await Order.findOne(query);

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
    throw new AppError(
      `Cannot cancel order with status '${order.orderStatus}'`,
      400,
      "CANNOT_CANCEL_ORDER"
    );
  }

  // Restore inventory if order was paid
  if (order.paymentStatus === "paid") {
    await restoreInventoryForOrder(order.items);
  }

  order.orderStatus = "cancelled";
  await order.save();

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});

/* ─── Update order status (Admin only) ───────────────── */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError("Status is required", 400, "MISSING_STATUS");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  if (!isValidStatusTransition(order.orderStatus, status)) {
    throw new AppError(
      `Invalid order status transition from '${order.orderStatus}' to '${status}'`,
      400,
      "INVALID_STATUS_TRANSITION"
    );
  }

  // If transitioning to cancelled and was paid, restore stock
  if (status === "cancelled" && order.paymentStatus === "paid") {
    await restoreInventoryForOrder(order.items);
  }

  order.orderStatus = status;
  await order.save();

  res.json({
    success: true,
    data: order,
  });
});
