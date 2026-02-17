import express from "express";
import { placeOrder } from "../controllers/order.controller.js";
import { getUserOrders } from "../controllers/order.controller.js";
import { getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/place", placeOrder);
router.get("/user/:userId", getUserOrders);
router.get("/:id", getOrderById);

export default router;