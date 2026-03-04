import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
} from "../controllers/product.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/products?search=&category=&sort=&featured=
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only - will add role middleware later
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);

export default router;
