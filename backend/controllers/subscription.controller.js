import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const DISCOUNT_MAP = {
    3: 10,
    6: 15,
    12: 20
};

// Create a new subscription (upfront payment required)
export const createSubscription = async (req, res) => {
    try {
        const { products, durationMonths } = req.body;
        const userId = req.user._id;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Select at least one product" });
        }

        if (![3, 6, 12].includes(Number(durationMonths))) {
            return res.status(400).json({ message: "Invalid subscription duration" });
        }

        const discountPercent = DISCOUNT_MAP[durationMonths];

        // Validate products and compute pricing
        let monthlyTotal = 0;
        const enrichedProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            if (!product.isSubscriptionAllowed) {
                return res.status(400).json({ message: `${product.name} is not available for subscription` });
            }
            monthlyTotal += product.price * item.quantity;
            enrichedProducts.push({ product: product._id, quantity: item.quantity });
        }

        const discountedMonthly = monthlyTotal * (1 - discountPercent / 100);
        const totalPaid = discountedMonthly * durationMonths;

        // Create Razorpay order for upfront payment
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalPaid * 100),
            currency: "INR",
            receipt: `sub_${Date.now()}`
        });

        // Compute next delivery date (1 month from now)
        const nextDeliveryDate = new Date();
        nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);

        // Save subscription as PENDING until payment verified
        const subscription = await Subscription.create({
            user: userId,
            products: enrichedProducts,
            durationMonths,
            discountPercent,
            totalPaid,
            nextDeliveryDate,
            status: "PENDING"
        });

        return res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            subscriptionId: subscription._id
        });
    } catch (error) {
        console.error("Create subscription error:", error);
        return res.status(500).json({ message: "Failed to create subscription" });
    }
};

// Verify subscription payment and activate
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            subscriptionId
        } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Subscription payment verification failed" });
        }

        const subscription = await Subscription.findOneAndUpdate(
            { _id: subscriptionId, user: req.user._id },
            { status: "ACTIVE" },
            { new: true }
        ).populate("products.product");

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        return res.json({ success: true, subscription });
    } catch (error) {
        console.error("Verify subscription payment error:", error);
        return res.status(500).json({ message: "Verification failed" });
    }
};

// Get all subscriptions for logged-in user
export const getUserSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id })
            .populate("products.product")
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: subscriptions });
    } catch (error) {
        console.error("Get subscriptions error:", error);
        return res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
};

// Cancel a subscription
export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, status: "ACTIVE" },
            { status: "CANCELLED" },
            { new: true }
        );

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found or already cancelled" });
        }

        return res.json({ success: true, subscription });
    } catch (error) {
        console.error("Cancel subscription error:", error);
        return res.status(500).json({ message: "Failed to cancel subscription" });
    }
};
