import express from "express";
import {
  createSubscription,
  subscriptionPhonePeCallback,
  checkSubscriptionPaymentStatus,
  getUserSubscriptions,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createSubscriptionSchema } from "../validators/subscription.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validate({ body: createSubscriptionSchema }),
  createSubscription
);
router.post("/phonepe-callback", subscriptionPhonePeCallback); // PhonePe S2S — signature verified in controller
router.get("/status/:id", protect, checkSubscriptionPaymentStatus);
router.get("/mine", protect, getUserSubscriptions);
router.patch("/:id/cancel", protect, cancelSubscription);

export default router;
