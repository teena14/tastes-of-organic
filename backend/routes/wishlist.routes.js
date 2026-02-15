import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);
router.get("/:userId", getWishlist);

export default router;