import express from "express";
import {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { placeOrderSchema } from "../validators/order.validator.js";

const router = express.Router();

router.post("/place", protect, validate({ body: placeOrderSchema }), placeOrder);
router.get("/user", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelOrder);
router.patch("/:id/status", protect, authorize("ADMIN"), updateOrderStatus);

export default router;