import express from "express";
import { placeOrder } from "../controllers/order.controller.js";

const router = express.Router();

// POST /api/orders/place
router.post("/place", placeOrder);

export default router;