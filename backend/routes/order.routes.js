import express from "express";
import {
  placeOrder,
  getUserOrders,
  getOrderById
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/place", protect, placeOrder);
router.get("/user", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

export default router;