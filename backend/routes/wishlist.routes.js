import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../controllers/wishlist.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", protect, addToWishlist);
router.post("/remove", protect, removeFromWishlist);
router.get("/", protect, getWishlist);

export default router;