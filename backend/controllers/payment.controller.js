import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import User from "../models/User.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a Razorpay order (called before checkout payment)
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // amount in paise (INR * 100)

        if (!amount || amount < 100) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const options = {
            amount: Math.round(amount),
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return res.json({
            success: true,
            razorpayOrderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        return res.status(500).json({ message: "Payment initiation failed" });
    }
};

// Verify Razorpay payment signature and update order
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // our DB order ID
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ message: "Missing payment verification fields" });
        }

        // Verify signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed: invalid signature" });
        }

        // Update order
        const order = await Order.findOneAndUpdate(
            { _id: orderId, user: req.user._id },
            {
                paymentStatus: "paid",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Clear cart after successful payment
        await User.findByIdAndUpdate(req.user._id, { cart: [] });

        return res.json({ success: true, order });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({ message: "Payment verification error" });
    }
};
