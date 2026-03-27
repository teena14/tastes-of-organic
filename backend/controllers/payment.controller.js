import crypto from "crypto";
import axios from "axios";
import Order from "../models/Order.js";
import User from "../models/User.js";

// PhonePe sandbox credentials
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY    = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

/* ─── Initiate PhonePe payment ────────────────────────── */
export const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Order not found" });
        // PhonePe limit for transaction ID is 35 chars
        const merchantTransactionId = `TXN_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        const amountInPaise = Math.round(order.total * 100);

        // The callback URL PhonePe will redirect to after payment
        const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-success/${orderId}`;
        const callbackUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/payment/phonepe-callback`;

        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId,
            merchantUserId: req.user._id.toString(),
            amount: amountInPaise,
            redirectUrl,
            callbackUrl,
            redirectMode: "REDIRECT",
            paymentInstrument: { type: "PAY_PAGE" },
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
        const checksumString = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const checksum = crypto.createHash("sha256").update(checksumString).digest("hex") + "###" + SALT_INDEX;

        const response = await axios.post(
            `${PHONEPE_BASE_URL}/pg/v1/pay`,
            { request: base64Payload },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": checksum,
                    "X-MERCHANT-ID": MERCHANT_ID,
                    accept: "application/json",
                },
            }
        );

        const phonePeUrl = response.data?.data?.instrumentResponse?.redirectInfo?.url;
        if (!phonePeUrl) throw new Error("No redirect URL from PhonePe");

        // Save transaction ID on the order for callback verification
        order.phonePeTransactionId = merchantTransactionId;
        await order.save();

        return res.json({ success: true, redirectUrl: phonePeUrl });

    } catch (error) {
        console.error("PhonePe initiate error:", error?.response?.data || error.message);
        return res.status(500).json({ message: "Payment initiation failed" });
    }
};

/* ─── PhonePe server-to-server callback ──────────────── */
export const phonePeCallback = async (req, res) => {
    try {
        const { response: encodedResponse } = req.body;
        if (!encodedResponse) return res.status(400).send("No response");

        const decoded = JSON.parse(Buffer.from(encodedResponse, "base64").toString("utf-8"));
        const { merchantTransactionId, transactionId, code } = decoded;

        if (code === "PAYMENT_SUCCESS") {
            // Find order by transaction ID and mark paid
            const order = await Order.findOneAndUpdate(
                { phonePeTransactionId: merchantTransactionId },
                { paymentStatus: "paid", phonePePaymentId: transactionId },
                { new: true }
            );
            if (order) {
                await User.findByIdAndUpdate(order.user, { cart: [] });
            }
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error("PhonePe callback error:", error.message);
        return res.status(500).send("Error");
    }
};

/* ─── Poll payment status (called by frontend) ───────── */
export const checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Order not found" });

        const txnId = order.phonePeTransactionId;
        if (!txnId) return res.json({ paymentStatus: order.paymentStatus });

        // Verify via PhonePe status API
        const path = `/pg/v1/status/${MERCHANT_ID}/${txnId}`;
        const checksumString = path + SALT_KEY;
        const checksum = crypto.createHash("sha256").update(checksumString).digest("hex") + "###" + SALT_INDEX;

        const response = await axios.get(`${PHONEPE_BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
                "X-MERCHANT-ID": MERCHANT_ID,
                accept: "application/json",
            },
        });

        const code = response.data?.code;
        const phonePePaymentId = response.data?.data?.transactionId;

        if (code === "PAYMENT_SUCCESS" && order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";
            order.phonePePaymentId = phonePePaymentId;
            await order.save();
            await User.findByIdAndUpdate(order.user, { cart: [] });
        } else if (code === "PAYMENT_ERROR" && order.paymentStatus !== "paid") {
            order.paymentStatus = "failed";
            await order.save();
        }

        return res.json({ paymentStatus: order.paymentStatus, code });

    } catch (error) {
        console.error("PhonePe status check error:", error?.response?.data || error.message);
        return res.status(500).json({ message: "Status check failed" });
    }
};
