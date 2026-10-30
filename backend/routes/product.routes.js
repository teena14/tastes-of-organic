import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from "../validators/product.validator.js";

const router = express.Router();

// Public
router.get("/", validate({ query: getProductsQuerySchema }), getProducts);
router.get("/:id", getProductById);

// Admin only
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  validate({ body: createProductSchema }),
  createProduct
);
router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  validate({ body: updateProductSchema }),
  updateProduct
);

export default router;
