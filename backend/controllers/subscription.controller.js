import crypto from "crypto";
import axios from "axios";
import Subscription from "../models/Subscription.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const MERCHANT_ID    = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY       = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX     = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE   = "https://api-preprod.phonepe.com/apis/pg-sandbox";

const DISCOUNT_MAP = { 3: 10, 6: 15, 12: 20 };

// Create a new subscription and initiate PhonePe payment
export const createSubscription = async (req, res) => {
    try {
        const { products, durationMonths, shippingAddress } = req.body;
        const userId = req.user._id;

        if (!products || products.length === 0)
            return res.status(400).json({ message: "Select at least one product" });

        if (![3, 6, 12].includes(Number(durationMonths)))
            return res.status(400).json({ message: "Invalid subscription duration" });

        const discountPercent = DISCOUNT_MAP[durationMonths];

        let monthlyTotal = 0;
        const enrichedProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product)
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            if (product.stock < item.quantity)
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            if (!product.isSubscriptionAllowed)
                return res.status(400).json({ message: `${product.name} is not available for subscription` });
            monthlyTotal += product.price * item.quantity;
            enrichedProducts.push({ product: product._id, quantity: item.quantity });
        }

        const discountedMonthly = monthlyTotal * (1 - discountPercent / 100);
        const totalPaid = discountedMonthly * durationMonths;
        const amountInPaise = Math.round(totalPaid * 100);

        const nextDeliveryDate = new Date();
        nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);

        const subscription = await Subscription.create({
            user: userId,
            products: enrichedProducts,
            durationMonths,
            discountPercent,
            totalPaid,
            nextDeliveryDate,
            status: "PENDING"
        });

        // PhonePe limit for transaction ID is 35 chars
        const merchantTransactionId = `SUB_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/subscription-success/${subscription._id}`;
        const callbackUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/subscriptions/phonepe-callback`;

        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId,
            merchantUserId: userId.toString(),
            amount: amountInPaise,
            redirectUrl,
            callbackUrl,
            redirectMode: "REDIRECT",
            paymentInstrument: { type: "PAY_PAGE" },
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
        const checksumStr   = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const checksum      = crypto.createHash("sha256").update(checksumStr).digest("hex") + "###" + SALT_INDEX;

        const ppRes = await axios.post(
            `${PHONEPE_BASE}/pg/v1/pay`,
            { request: base64Payload },
            { headers: { "Content-Type": "application/json", "X-VERIFY": checksum, "X-MERCHANT-ID": MERCHANT_ID, accept: "application/json" } }
        );

        const phonePeUrl = ppRes.data?.data?.instrumentResponse?.redirectInfo?.url;
        if (!phonePeUrl) throw new Error("No redirect URL from PhonePe");

        subscription.phonePeTransactionId = merchantTransactionId;
        await subscription.save();

        return res.json({ success: true, redirectUrl: phonePeUrl, subscriptionId: subscription._id });

    } catch (error) {
        console.error("Create subscription error:", error?.response?.data || error.message);
        return res.status(500).json({ message: "Failed to create subscription" });
    }
};

// PhonePe S2S callback for subscriptions
export const subscriptionPhonePeCallback = async (req, res) => {
    try {
        const { response: encodedResponse } = req.body;
        if (!encodedResponse) return res.status(400).send("No response");
        const decoded = JSON.parse(Buffer.from(encodedResponse, "base64").toString("utf-8"));
        const { merchantTransactionId, code } = decoded;

        if (code === "PAYMENT_SUCCESS") {
            await Subscription.findOneAndUpdate(
                { phonePeTransactionId: merchantTransactionId },
                { status: "ACTIVE" }
            );
        }
        return res.status(200).send("OK");
    } catch (error) {
        console.error("Subscription PhonePe callback error:", error.message);
        return res.status(500).send("Error");
    }
};

// Poll subscription payment status
export const checkSubscriptionPaymentStatus = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        if (subscription.status === "ACTIVE") return res.json({ status: "ACTIVE" });

        const txnId = subscription.phonePeTransactionId;
        if (!txnId) return res.json({ status: subscription.status });

        const path = `/pg/v1/status/${MERCHANT_ID}/${txnId}`;
        const checksumStr = path + SALT_KEY;
        const checksum = crypto.createHash("sha256").update(checksumStr).digest("hex") + "###" + SALT_INDEX;

        const ppRes = await axios.get(`${PHONEPE_BASE}${path}`, {
            headers: { "Content-Type": "application/json", "X-VERIFY": checksum, "X-MERCHANT-ID": MERCHANT_ID, accept: "application/json" },
        });

        if (ppRes.data?.code === "PAYMENT_SUCCESS") {
            subscription.status = "ACTIVE";
            await subscription.save();
        }

        return res.json({ status: subscription.status, code: ppRes.data?.code });
    } catch (error) {
        console.error("Subscription status check error:", error?.response?.data || error.message);
        return res.status(500).json({ message: "Status check failed" });
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
