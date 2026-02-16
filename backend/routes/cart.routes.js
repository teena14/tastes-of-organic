import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartQuantity
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.get("/:userId", getCart);
router.post("/update", updateCartQuantity);

export default router;