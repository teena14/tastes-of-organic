import express from "express";
import {
  initiatePayment,
  phonePeCallback,
  checkPaymentStatus,
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { initiatePaymentSchema } from "../validators/payment.validator.js";

const router = express.Router();

router.post(
  "/initiate",
  protect,
  validate({ body: initiatePaymentSchema }),
  initiatePayment
);
router.post("/phonepe-callback", phonePeCallback); // PhonePe S2S — signature verified in controller
router.get("/status/:orderId", protect, checkPaymentStatus);

export default router;
