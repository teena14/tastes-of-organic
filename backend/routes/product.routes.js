import express from "express";
import {
  getAllProducts,
  getProductById
} from "../controllers/product.controller.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", getAllProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", getProductById);

export default router;
