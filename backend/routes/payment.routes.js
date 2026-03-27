import express from "express";
import { initiatePayment, phonePeCallback, checkPaymentStatus } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/initiate",              protect, initiatePayment);
router.post("/phonepe-callback",               phonePeCallback);   // PhonePe S2S — no auth
router.get("/status/:orderId",        protect, checkPaymentStatus);

export default router;
