import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartQuantity
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/update", protect, updateCartQuantity);
router.post("/remove", protect, removeFromCart);

export default router;