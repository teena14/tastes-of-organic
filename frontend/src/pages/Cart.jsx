import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getCart, updateCartQuantity, removeFromCart } from "../services/apiClient";
import { setCart } from "../slices/cartSlice";

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
  borderHover: "#BFCFAD",
  red: "#EF4444",
  redBg: "#FEF2F2",
};

/* ─── Quantity Stepper ─── */
const Stepper = ({ value, onDecrease, onIncrease, loading }) => (
  <div style={{
    display: "inline-flex", alignItems: "center",
    border: `1.5px solid ${C.border}`, borderRadius: "10px",
    overflow: "hidden", background: C.white,
  }}>
    {[{ label: "−", fn: onDecrease }, { label: "+", fn: onIncrease }].map((btn, i) => (
      i === 1
        ? [
            <span key="val" style={{
              width: "38px", textAlign: "center", fontSize: "14px",
              fontWeight: 700, color: C.text, fontFamily: "Poppins, sans-serif",
              lineHeight: "36px", borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`,
              userSelect: "none",
            }}>{value}</span>,
            <StepperBtn key="plus" label="+" onClick={onIncrease} loading={loading} />
          ]
        : <StepperBtn key="minus" label="−" onClick={btn.fn} loading={loading} />
    ))}
  </div>
);

const StepperBtn = ({ label, onClick, loading }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "36px", height: "36px", border: "none",
        background: hov && !loading ? C.sageLight : C.white,
        color: loading ? C.muted : C.primary,
        fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 500,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s", flexShrink: 0,
      }}>
      {label}
    </button>
  );
};

/* ─── Cart Item Row ─── */
const CartItem = ({ item, onDecrease, onIncrease, onRemove }) => {
  const [qtyLoading, setQtyLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeHov, setRemoveHov] = useState(false);

  const withLoad = async (fn) => { setQtyLoading(true); await fn(); setQtyLoading(false); };
  const handleRemove = async () => { setRemoving(true); await onRemove(); };

  const variant = item.product.sizes?.find(v => v.size === item.size);
  const displayPrice = variant ? variant.price : item.product.price;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "18px",
      background: C.white, borderRadius: "16px",
      border: `1px solid ${C.border}`, padding: "18px",
      opacity: removing ? 0.45 : 1,
      transform: removing ? "scale(0.98)" : "scale(1)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
      boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
    }}>
      {/* Thumbnail */}
      <div style={{
        width: "76px", height: "76px", borderRadius: "12px", flexShrink: 0,
        background: `linear-gradient(140deg, ${C.sageLight} 0%, ${C.sage} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", fontSize: "26px",
      }}>
        {item.product.images?.[0]
          ? <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🌿"}
      </div>

      {/* Name + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/product/${item.product._id}`}
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "14px", color: C.text, textDecoration: "none", display: "block", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.product.name} {item.size && `(${item.size})`}
        </Link>
        <p style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.textSecondary }}>
          ₹{displayPrice?.toLocaleString("en-IN")} &nbsp;/&nbsp; unit
        </p>
      </div>

      {/* Stepper */}
      <Stepper value={item.quantity} loading={qtyLoading}
        onDecrease={() => withLoad(onDecrease)}
        onIncrease={() => withLoad(onIncrease)} />

      {/* Line total */}
      <div style={{ minWidth: "80px", textAlign: "right" }}>
        <p style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: C.primary }}>
          ₹{(displayPrice * item.quantity)?.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Remove */}
      <button onClick={handleRemove} disabled={removing}
        onMouseEnter={() => setRemoveHov(true)} onMouseLeave={() => setRemoveHov(false)}
        title="Remove item"
        style={{
          width: "36px", height: "36px", flexShrink: 0, borderRadius: "10px",
          border: `1.5px solid ${removeHov ? "#FCA5A5" : C.border}`,
          background: removeHov ? C.redBg : C.cream,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: removing ? "not-allowed" : "pointer", fontSize: "15px",
          transition: "all 0.15s ease",
        }}>
        🗑
      </button>
    </div>
  );
};

/* ─── Divider ─── */
const Divider = () => <div style={{ height: "1px", background: C.border, margin: "4px 0" }} />;

/* ─── Main ─── */
const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, delivery, total } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (!isAuthenticated) return;
    getCart().then(d => { if (d) dispatch(setCart(d)); }).catch(() => {});
  }, [isAuthenticated, dispatch]);

  const refresh = async () => {
    const d = await getCart();
    if (d) dispatch(setCart(d));
  };

  /* ── Not logged in ── */
  if (!isAuthenticated) return (
    <CenteredCard>
      <div style={{ fontSize: "56px", marginBottom: "20px" }}>🛒</div>
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px", color: C.text, margin: "0 0 8px" }}>Sign in to see your cart</h2>
      <p style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.7 }}>
        Your selected items are waiting. Log in to continue.
      </p>
      <PrimaryButton as={Link} to="/login" onClick={() => navigate("/login")}>Sign In</PrimaryButton>
      <Link to="/shop" style={{ display: "block", marginTop: "14px", fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.primary, textDecoration: "none", fontWeight: 500 }}>
        Browse products →
      </Link>
    </CenteredCard>
  );

  /* ── Empty ── */
  if (items.length === 0) return (
    <CenteredCard>
      <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌿</div>
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px", color: C.text, margin: "0 0 8px" }}>Your cart is empty</h2>
      <p style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.7 }}>
        Pure Himalayan organic goodness awaits. Start shopping now.
      </p>
      <PrimaryButton onClick={() => navigate("/shop")}>Shop Now</PrimaryButton>
    </CenteredCard>
  );

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Poppins, sans-serif", padding: "48px 20px 100px" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: C.primary, letterSpacing: "0.15em", textTransform: "uppercase" }}>Your Selection</p>
            <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "30px", color: C.text, margin: 0, lineHeight: 1.2 }}>
              Shopping Cart
              <span style={{ marginLeft: "12px", fontSize: "15px", fontWeight: 500, color: C.muted }}>
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </h1>
          </div>
          <Link to="/shop" style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.primary, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            ← Continue Shopping
          </Link>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ─ Left: Items ─ */}
          <div className="w-full lg:flex-1 flex flex-col gap-2.5">
            {items.map(item => (
              <CartItem key={`${item.product._id}-${item.size}`} item={item}
                onIncrease={async () => { await updateCartQuantity(item.product._id, item.size, "increase"); await refresh(); }}
                onDecrease={async () => { await updateCartQuantity(item.product._id, item.size, "decrease"); await refresh(); }}
                onRemove={async () => { await removeFromCart(item.product._id, item.size); await refresh(); toast.success("Item removed from cart"); }}
              />
            ))}
          </div>

          {/* ─ Right: Summary panel ─ */}
          <div className="w-full lg:w-[310px] bg-white rounded-[20px] border p-7 sticky top-6" style={{
            borderColor: C.border,
            boxShadow: "0 4px 32px rgba(27,94,32,0.07)"
          }}>
            {/* Panel heading */}
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: C.text, margin: "0 0 20px" }}>
              Order Summary
            </h2>
            <Divider />

            {/* Per-item breakdown */}
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
              {items.map(item => (
                <div key={item.product._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "170px" }}>
                    {item.product.name}
                    <span style={{ color: C.muted, marginLeft: "4px" }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: C.text, flexShrink: 0 }}>
                    ₹{(item.product.price * item.quantity)?.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            <Divider />

            {/* Subtotal / Delivery / Total */}
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Row label="Subtotal" value={`₹${subtotal?.toLocaleString("en-IN")}`} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: C.textSecondary }}>Delivery</span>
                {delivery === 0
                  ? <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700, color: C.primary, background: C.primaryLight, padding: "3px 10px", borderRadius: "999px" }}>FREE</span>
                  : <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 600, color: C.text }}>₹{delivery?.toLocaleString("en-IN")}</span>
                }
              </div>
            </div>

            {/* Total highlight */}
            <div style={{ background: C.sageLight, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "15px", color: C.text }}>Total</span>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "22px", color: C.primary }}>
                ₹{total?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* CTA */}
            <PrimaryButton block onClick={() => navigate("/checkout")}>
              Proceed to Checkout →
            </PrimaryButton>

            {/* Trust badges */}
            <div style={{ marginTop: "18px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              {["🔒 Secure", "🌿 Organic", "↩️ Easy Returns"].map(b => (
                <span key={b} style={{ fontFamily: "Poppins, sans-serif", fontSize: "11px", color: C.muted, fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  );
};

/* ─── Shared small components ─── */
const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", color: "#52525B" }}>{label}</span>
    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 600, color: "#18181B" }}>{value}</span>
  </div>
);

const PrimaryButton = ({ children, onClick, block }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: block ? "100%" : "auto", padding: "13px 28px",
        background: hov ? "#144d19" : "#1B5E20",
        color: "#fff", border: "none", borderRadius: "10px",
        fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 600,
        cursor: "pointer", letterSpacing: "0.02em",
        boxShadow: hov ? "0 6px 22px rgba(27,94,32,0.32)" : "0 4px 16px rgba(27,94,32,0.22)",
        transform: hov ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}>
      {children}
    </button>
  );
};

const CenteredCard = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "#F5F3EE", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Poppins, sans-serif" }}>
    <div style={{ textAlign: "center", padding: "52px 40px", background: "#FDFBF5", borderRadius: "24px", border: "1px solid #E4EAD9", maxWidth: "400px", width: "100%", boxShadow: "0 8px 40px rgba(27,94,32,0.08)" }}>
      {children}
    </div>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
  </div>
);

export default Cart;