import express from "express";
import {
    createSubscription,
    subscriptionPhonePeCallback,
    checkSubscriptionPaymentStatus,
    getUserSubscriptions,
    cancelSubscription
} from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",                      protect, createSubscription);
router.post("/phonepe-callback",               subscriptionPhonePeCallback); // PhonePe S2S
router.get("/status/:id",             protect, checkSubscriptionPaymentStatus);
router.get("/mine",                   protect, getUserSubscriptions);
router.patch("/:id/cancel",           protect, cancelSubscription);

export default router;
