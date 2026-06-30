import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getCart } from "../services/apiClient";
import { placeOrder } from "../services/apiClient";
import { getUserProfile } from "../services/apiClient";
import { initiatePhonePePayment } from "../services/apiClient";

const C = {
  bg: "#F5F3EE",
  primary: "#1B5E20",
  primaryDark: "#144d19",
  primaryLight: "#E8F5E9",
  sage: "#C8D9B0",
  sageLight: "#EDF4E3",
  cream: "#FDFBF5",
  white: "#FFFFFF",
  text: "#18181B",
  textSecondary: "#52525B",
  muted: "#A1A1AA",
  border: "#E4EAD9",
};

const FIELDS = [
  { key: "name",         label: "Full Name",        placeholder: "Priya Sharma",             required: true,  col: "full" },
  { key: "phone",        label: "Phone Number",     placeholder: "+91 98765 43210",           required: true,  col: "half" },
  { key: "addressLine1", label: "Address Line 1",   placeholder: "12, MG Road, Apartment",   required: true,  col: "full" },
  { key: "addressLine2", label: "Address Line 2",   placeholder: "Near Pine Park (optional)", required: false, col: "full" },
  { key: "city",         label: "City",             placeholder: "Dehradun",                  required: true,  col: "half" },
  { key: "state",        label: "State",            placeholder: "Uttarakhand",               required: true,  col: "half" },
  { key: "postalCode",   label: "Pincode",          placeholder: "248001",                    required: true,  col: "half" },
];

/* ─── Styled Input ─── */
const FormInput = ({ field, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: "block", fontFamily: "Poppins, sans-serif",
        fontSize: "12px", fontWeight: 600, color: C.text,
        marginBottom: "6px", letterSpacing: "0.02em",
      }}>
        {field.label}
        {field.required
          ? <span style={{ color: C.primary, marginLeft: "2px" }}>*</span>
          : <span style={{ color: C.muted, fontWeight: 400, marginLeft: "4px", fontSize: "11px" }}>(optional)</span>}
      </label>
      <input
        type="text"
        name={field.key}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px",
          border: `1.5px solid ${focused ? C.primary : C.border}`,
          borderRadius: "10px", outline: "none",
          background: focused ? C.white : C.cream,
          fontFamily: "Poppins, sans-serif", fontSize: "14px", color: C.text,
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 3px rgba(27,94,32,0.09)" : "none",
          transition: "all 0.18s ease",
        }}
      />
    </div>
  );
};

/* ─── Section Card ─── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.white, borderRadius: "20px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 2px 20px rgba(27,94,32,0.05)",
    ...style,
  }}>
    {children}
  </div>
);

const CardHeader = ({ icon, title, subtitle }) => (
  <div style={{ padding: "24px 28px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: C.text }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "12px", color: C.muted }}>{subtitle}</p>}
      </div>
    </div>
    <div style={{ height: "1px", background: C.border }} />
  </div>
);

/* ─── Pay Button ─── */
const PayButton = ({ onClick, loading, amount }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={() => !loading && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "15px",
        background: loading ? C.sage : hov ? C.primaryDark : C.primary,
        color: "#fff", border: "none", borderRadius: "12px",
        fontFamily: "Poppins, sans-serif", fontSize: "15px", fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "0.02em",
        boxShadow: loading ? "none" : hov ? "0 6px 24px rgba(27,94,32,0.34)" : "0 4px 16px rgba(27,94,32,0.24)",
        transform: hov && !loading ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}>
      {loading ? "Processing…" : `Proceed to Payment  ₹${amount}`}
    </button>
  );
};

/* ─── Checkout Page ─── */
const Checkout = () => {
  const [cart, setCartData] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "" });
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const { user: _user } = useSelector(s => s.auth);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCart();
        if (!data || data.items.length === 0) { navigate("/cart"); return; }
        setCartData(data);
        const profile = await getUserProfile();
        if (profile?.address?.name) setForm(profile.address);
      } catch { navigate("/cart"); }
    };
    load();
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePayment = async () => {
    const required = ["name", "phone", "addressLine1", "city", "state", "postalCode"];
    if (!required.every(f => form[f]?.trim())) { toast.error("Please fill all required fields"); return; }
    try {
      setPlacing(true);
      // 1. Create our DB order
      const orderRes = await placeOrder(form);
      const orderId = orderRes.order._id;
      // 2. Initiate PhonePe payment — get redirect URL
      const payRes = await initiatePhonePePayment(orderId);
      if (!payRes.redirectUrl) throw new Error("No redirect URL received");
      // 3. Redirect user to PhonePe hosted page
      window.location.href = payRes.redirectUrl;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setPlacing(false);
    }
  };

  if (!cart) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>🌿</div>
        <p style={{ color: C.muted, fontSize: "14px" }}>Preparing your checkout…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Poppins, sans-serif", padding: "48px 20px 100px" }}>
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Link to="/cart"
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.primary, fontWeight: 600, textDecoration: "none", marginBottom: "16px" }}>
            ← Back to Cart
          </Link>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: C.primary, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Almost there
            </p>
            <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "30px", color: C.text, margin: 0 }}>
              Checkout
            </h1>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ─ Left: Shipping form ─ */}
          <div style={{ flex: "1 1 440px" }}>
            <Card>
              <CardHeader icon="🏠" title="Shipping Details" subtitle="Where should we deliver your order?" />
              <div style={{ padding: "24px 28px 28px" }}>
                {/* Form grid — full rows + responsive halves */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {FIELDS.map(field => (
                    <div key={field.key} style={{ gridColumn: field.col === "full" ? "1 / -1" : "auto" }}>
                      <FormInput field={field} value={form[field.key]} onChange={handleChange} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ─ Right: Order review + Pay ─ */}
          <div style={{ flex: "0 0 308px", display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "24px" }}>

            {/* Order review card */}
            <Card>
              <CardHeader icon="📦" title="Order Review" />
              <div style={{ padding: "20px 24px" }}>
                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
                  {cart.items.map(item => (
                    <div key={item.product._id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
                        background: `linear-gradient(140deg, ${C.sageLight} 0%, ${C.sage} 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", overflow: "hidden",
                      }}>
                        {item.product.images?.[0]
                          ? <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : "🌿"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product.name}</p>
                        <p style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "12px", color: C.muted }}>Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 700, color: C.primary, flexShrink: 0 }}>
                        ₹{(item.product.price * item.quantity)?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: C.border, margin: "4px 0 16px" }} />

                {/* Totals */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "4px" }}>
                  {[
                    { label: "Subtotal", value: `₹${cart.subtotal?.toLocaleString("en-IN")}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.textSecondary }}>{label}</span>
                      <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: C.text }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.textSecondary }}>Delivery</span>
                    {cart.delivery === 0
                      ? <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700, color: C.primary, background: C.primaryLight, padding: "2px 10px", borderRadius: "999px" }}>FREE</span>
                      : <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 600, color: C.text }}>₹{cart.delivery?.toLocaleString("en-IN")}</span>}
                  </div>
                </div>

                {/* Total highlight */}
                <div style={{ background: C.sageLight, borderRadius: "12px", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", color: C.text }}>Total</span>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "20px", color: C.primary }}>
                    ₹{cart.total?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </Card>

            {/* Pay card */}
            <Card style={{ padding: "24px" }}>
              <PayButton onClick={handlePayment} loading={placing} amount={cart.total?.toLocaleString("en-IN")} />
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {["🔒 256-bit SSL encrypted", "↩️ Free returns within 7 days", "🌿 100% Organic & Traceable"].map(note => (
                  <p key={note} style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "11px", color: C.muted, textAlign: "center" }}>{note}</p>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  );
};

export default Checkout;
