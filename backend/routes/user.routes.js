import express from "express";
import { getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/users/:userId
router.get("/:userId", getUserProfile);

export default router;
