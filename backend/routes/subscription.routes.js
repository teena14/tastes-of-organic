import express from "express";
import {
    createSubscription,
    verifySubscriptionPayment,
    getUserSubscriptions,
    cancelSubscription
} from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createSubscription);
router.post("/verify-payment", protect, verifySubscriptionPayment);
router.get("/mine", protect, getUserSubscriptions);
router.patch("/:id/cancel", protect, cancelSubscription);

export default router;
