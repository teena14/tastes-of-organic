import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { clearCart } from "../slices/cartSlice";
import { getOrderById } from "../services/orderApi";
import { checkPaymentStatus, initiatePhonePePayment } from "../services/paymentApi";

const C = {
  primary: "#1B5E20",
  primaryLight: "#E8F5E9",
  sage: "#C8D9B0",
  bg: "#F5F3EE",
  cream: "#FDFBF5",
  text: "#18181B",
  muted: "#6B7280",
  border: "#E4EAD9",
};

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [payStatus, setPayStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (payStatus === "failed") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        navigate("/checkout");
      }
    }
  }, [payStatus, countdown, navigate]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const payRes = await initiatePhonePePayment(orderId);
      if (payRes.redirectUrl) window.location.href = payRes.redirectUrl;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Retry failed");
      setRetrying(false);
    }
  };

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const pollStatus = async () => {
      try {
        const statusRes = await checkPaymentStatus(orderId);
        setPayStatus(statusRes.paymentStatus);

        if (statusRes.paymentStatus === "paid") {
          dispatch(clearCart());   // clear cart once payment confirmed
          return;                  // stop polling
        }

        // Keep polling until paid or max attempts
        if (attempts < maxAttempts && statusRes.paymentStatus === "pending") {
          attempts++;
          setTimeout(pollStatus, 3000);
        }
      } catch {
        // silently fail on network hiccups
      }
    };

    const load = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);

        // If already paid (e.g. S2S arrived first), skip polling
        if (data.paymentStatus === "paid") {
          dispatch(clearCart());
          setPayStatus("paid");
        } else {
          pollStatus();
        }
      } catch {
        /* order not found */
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, dispatch]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌿</div>
        <p style={{ color: C.muted, fontSize: "15px" }}>Verifying your payment…</p>
      </div>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif" }}>
      <p style={{ color: C.muted }}>Order not found. <Link to="/orders" style={{ color: C.primary }}>My Orders</Link></p>
    </div>
  );

  const isPaid = payStatus === "paid";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>

        {/* Status card */}
        <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: "24px", boxShadow: "0 4px 32px rgba(27,94,32,0.08)", overflow: "hidden" }}>

          {/* Top banner */}
          <div style={{ background: isPaid ? "linear-gradient(135deg,#1B5E20,#2E7D32)" : payStatus === "failed" ? "linear-gradient(135deg,#D32F2F,#B71C1C)" : "linear-gradient(135deg,#78909C,#546E7A)", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>{isPaid ? "✅" : payStatus === "failed" ? "❌" : "⏳"}</div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "22px", fontWeight: 700 }}>
              {isPaid ? "Order Confirmed!" : payStatus === "failed" ? "Payment Failed" : "Payment Pending…"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "8px 0 0", fontSize: "14px" }}>
              {isPaid ? "Thank you for choosing Tastes of Organic 🌿" : payStatus === "failed" ? "Your payment could not be processed." : "We're waiting to hear from PhonePe. This usually takes a few seconds."}
            </p>
          </div>

          <div style={{ padding: "28px 32px" }}>
            {/* Order meta */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              {[
                { label: "Order ID", value: `#${order._id.slice(-8).toUpperCase()}` },
                { label: "Total",    value: `₹${order.total?.toLocaleString("en-IN")}` },
                { label: "Payment",  value: payStatus.charAt(0).toUpperCase() + payStatus.slice(1), color: isPaid ? C.primary : "#F57F17" },
                { label: "Status",   value: order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: C.muted }}>{label}</span>
                  <span style={{ fontWeight: 600, color: color || C.text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "20px", marginBottom: "24px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", marginTop: 0 }}>Items</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: C.text }}>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600, color: C.primary }}>₹{(item.price * item.quantity)?.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div style={{ background: C.primaryLight, borderRadius: "12px", padding: "14px 16px", marginBottom: "28px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Delivering to</p>
              <p style={{ margin: 0, fontSize: "13px", color: C.text, lineHeight: 1.6 }}>
                {order.shippingAddress.name} · {order.shippingAddress.phone}<br />
                {order.shippingAddress.addressLine1}, {order.shippingAddress.city},<br />
                {order.shippingAddress.state} – {order.shippingAddress.postalCode}
              </p>
            </div>

            {/* Actions */}
            {payStatus === "failed" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                <button 
                  onClick={handleRetry} 
                  disabled={retrying}
                  style={{ width: "100%", padding: "14px", borderRadius: "10px", background: C.primary, fontSize: "14px", fontWeight: 600, color: "#fff", border: "none", cursor: retrying ? "not-allowed" : "pointer" }}
                >
                  {retrying ? "Initiating..." : "Retry Payment"}
                </button>
                <button 
                  onClick={() => navigate("/checkout")} 
                  style={{ width: "100%", padding: "14px", borderRadius: "10px", border: `1.5px solid ${C.border}`, background: C.cream, fontSize: "14px", fontWeight: 600, color: C.text, cursor: "pointer" }}
                >
                  Return to Checkout
                </button>
                <p style={{ textAlign: "center", fontSize: "12px", color: C.muted, margin: "8px 0 0" }}>
                  Automatically returning in {countdown}s...
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px" }}>
                <Link to="/orders" style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontSize: "13px", fontWeight: 600, color: C.text, textDecoration: "none" }}>
                  My Orders
                </Link>
                <Link to="/shop" style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: "10px", background: C.primary, fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none" }}>
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
};

export default OrderSuccess;
