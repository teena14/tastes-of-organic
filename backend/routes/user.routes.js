import express from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/users/me
router.get("/me", protect, getUserProfile);

export default router;
