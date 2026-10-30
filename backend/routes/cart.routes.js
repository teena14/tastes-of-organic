import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartQuantity,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  addToCartSchema,
  updateCartQuantitySchema,
  removeFromCartSchema,
} from "../validators/cart.validator.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, validate({ body: addToCartSchema }), addToCart);
router.post(
  "/update",
  protect,
  validate({ body: updateCartQuantitySchema }),
  updateCartQuantity
);
router.post(
  "/remove",
  protect,
  validate({ body: removeFromCartSchema }),
  removeFromCart
);

export default router;