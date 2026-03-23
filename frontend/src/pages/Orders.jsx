import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyOrders } from "../services/orderApi";

/* ─── Design tokens (same palette as Wishlist / Cart) ─── */
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
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  red: "#EF4444",
  redLight: "#FEE2E2",
  blue: "#3B82F6",
  blueLight: "#EFF6FF",
  green: "#22C55E",
  greenLight: "#F0FDF4",
};

/* ─── Status config ─── */
const STATUS = {
  pending: { label: "Pending", bg: C.amberLight, color: C.amber, dot: "#F59E0B", icon: "🕐" },
  processing: { label: "Processing", bg: C.blueLight, color: C.blue, dot: "#3B82F6", icon: "⚙️" },
  shipped: { label: "Shipped", bg: C.primaryLight, color: C.primary, dot: "#1B5E20", icon: "🚚" },
  delivered: { label: "Delivered", bg: C.greenLight, color: C.green, dot: "#22C55E", icon: "✅" },
  cancelled: { label: "Cancelled", bg: C.redLight, color: C.red, dot: "#EF4444", icon: "✕" },
};

const PAYMENT = {
  paid: { label: "Paid", bg: C.greenLight, color: C.green },
  pending: { label: "Pending", bg: C.amberLight, color: C.amber },
  failed: { label: "Failed", bg: C.redLight, color: C.red },
};

const getStatus = (key) => STATUS[key?.toLowerCase()] || STATUS.pending;
const getPayment = (key) => PAYMENT[key?.toLowerCase()] || PAYMENT.pending;

/* ─── Skeleton loader ─── */
const SkeletonRow = () => (
  <div style={{ background: C.white, borderRadius: "16px", border: `1px solid ${C.border}`, padding: "24px", marginBottom: "12px" }}>
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        {[70, 45, 55].map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? "16px" : "12px",
            width: `${w}%`,
            borderRadius: "6px",
            marginBottom: "10px",
            background: `linear-gradient(90deg, ${C.sageLight} 25%, #e8f0dc 50%, ${C.sageLight} 75%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }} />
        ))}
      </div>
      <div style={{
        width: "80px", height: "80px", borderRadius: "12px",
        background: `linear-gradient(90deg, ${C.sageLight} 25%, #e8f0dc 50%, ${C.sageLight} 75%)`,
        backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", flexShrink: 0
      }} />
    </div>
  </div>
);

/* ─── Status timeline ─── */
const TIMELINE_STEPS = ["pending", "processing", "shipped", "delivered"];

const Timeline = ({ currentStatus }) => {
  if (currentStatus === "cancelled") return null;
  const currentIdx = TIMELINE_STEPS.indexOf(currentStatus?.toLowerCase());

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "16px 0 4px" }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const s = STATUS[step];
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "0 0 auto" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: done ? C.primary : C.sageLight,
                border: `2px solid ${done ? C.primary : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", transition: "all 0.3s ease",
                boxShadow: active ? `0 0 0 4px rgba(27,94,32,0.15)` : "none",
              }}>
                {done ? <span style={{ color: "#fff", fontSize: "10px", fontWeight: 800 }}>✓</span>
                  : <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.muted }} />}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: active ? 700 : 500, color: done ? C.primary : C.muted,
                whiteSpace: "nowrap", textTransform: "capitalize"
              }}>
                {s.label}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", background: i < currentIdx ? C.primary : C.border,
                margin: "0 4px", marginBottom: "14px", transition: "background 0.3s ease"
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Single order card ─── */
const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);

  const statusCfg = getStatus(order.orderStatus);
  const paymentCfg = getPayment(order.paymentStatus);
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const timeStr = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white, borderRadius: "18px",
        border: `1px solid ${hov ? C.borderHover : C.border}`,
        boxShadow: hov ? "0 8px 32px rgba(27,94,32,0.10)" : "0 2px 12px rgba(0,0,0,0.04)",
        marginBottom: "14px", overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* ── Card header (always visible) ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "20px 24px", display: "flex", alignItems: "center",
          gap: "16px", textAlign: "left",
        }}
      >

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px",
              color: C.text, fontVariantNumeric: "tabular-nums"
            }}>
              #{order._id.slice(-8).toUpperCase()}
            </span>
            {/* Order status badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "2px 10px", borderRadius: "999px", fontSize: "11px",
              fontWeight: 700, fontFamily: "Poppins, sans-serif",
              background: statusCfg.bg, color: statusCfg.color,
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: statusCfg.dot, display: "inline-block"
              }} />
              {statusCfg.label}
            </span>
            {/* Payment badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "2px 10px", borderRadius: "999px", fontSize: "11px",
              fontWeight: 600, fontFamily: "Poppins, sans-serif",
              background: paymentCfg.bg, color: paymentCfg.color,
            }}>
              {paymentCfg.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "12px", color: C.muted }}>
              {dateStr} · {timeStr}
            </span>
            <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "12px", color: C.textSecondary }}>
              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Total + chevron */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "16px", color: C.primary }}>
            ₹{order.total?.toLocaleString("en-IN")}
          </span>
          <span style={{
            fontSize: "18px", color: C.muted, display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}>
            ⌄
          </span>
        </div>
      </button>

      {/* ── Expanded details ── */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "0 24px 22px" }}>
          {/* Status timeline */}
          <Timeline currentStatus={order.orderStatus} />
          {order.orderStatus?.toLowerCase() === "cancelled" && (
            <div style={{
              margin: "16px 0 4px", padding: "10px 14px", borderRadius: "10px",
              background: C.redLight, display: "flex", alignItems: "center", gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>✕</span>
              <span style={{
                fontFamily: "Poppins, sans-serif", fontSize: "13px",
                color: C.red, fontWeight: 600
              }}>This order was cancelled.</span>
            </div>
          )}

          {/* Items list */}
          <p style={{
            fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700,
            color: C.primary, letterSpacing: "0.12em", textTransform: "uppercase",
            margin: "20px 0 10px"
          }}>
            Items Ordered
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "12px",
                background: C.sageLight, border: `1px solid ${C.border}`,
              }}>
                {/* Thumbnail / emoji */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "10px", flexShrink: 0,
                  background: C.sage, overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : "🌿"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontFamily: "Poppins, sans-serif", fontWeight: 600,
                    fontSize: "13px", color: C.text,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {item.name || item.productId?.name || "Product"}
                  </p>
                  <p style={{
                    margin: "2px 0 0", fontFamily: "Poppins, sans-serif",
                    fontSize: "12px", color: C.textSecondary
                  }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <span style={{
                  fontFamily: "Poppins, sans-serif", fontWeight: 700,
                  fontSize: "14px", color: C.primary, flexShrink: 0
                }}>
                  ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <>
              <p style={{
                fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 700,
                color: C.primary, letterSpacing: "0.12em", textTransform: "uppercase",
                margin: "20px 0 10px"
              }}>
                Shipping Address
              </p>
              <div style={{
                padding: "12px 14px", borderRadius: "12px",
                background: C.cream, border: `1px solid ${C.border}`
              }}>
                <p style={{
                  margin: 0, fontFamily: "Poppins, sans-serif", fontSize: "13px",
                  color: C.textSecondary, lineHeight: 1.7
                }}>
                  {[
                    order.shippingAddress.name,
                    order.shippingAddress.line1 || order.shippingAddress.address,
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.pincode || order.shippingAddress.zip,
                  ].filter(Boolean).join(", ")}
                </p>
              </div>
            </>
          )}

          {/* Price summary */}
          <div style={{
            marginTop: "18px", padding: "14px", borderRadius: "12px",
            background: C.primaryLight, border: `1px solid ${C.sage}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontFamily: "Poppins, sans-serif", fontSize: "13px",
                color: C.primary, fontWeight: 500
              }}>Order Total</span>
              <span style={{
                fontFamily: "Poppins, sans-serif", fontSize: "18px",
                color: C.primary, fontWeight: 800
              }}>
                ₹{order.total?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Orders page ─── */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    getMyOrders()
      .then(d => setOrders(d || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  /* ── Not signed in ── */
  if (!isAuthenticated && !loading) return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: "20px",
      fontFamily: "Poppins, sans-serif"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{
        textAlign: "center", padding: "52px 40px", background: C.cream,
        borderRadius: "24px", border: `1px solid ${C.border}`, maxWidth: "420px",
        width: "100%", boxShadow: "0 8px 40px rgba(27,94,32,0.08)"
      }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
        <h2 style={{
          fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px",
          color: C.text, margin: "0 0 8px"
        }}>Sign in to view orders</h2>
        <p style={{
          fontFamily: "Poppins, sans-serif", fontSize: "14px",
          color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.7
        }}>
          Track and manage all your past orders in one place.
        </p>
        <button onClick={() => navigate("/login")} style={{
          width: "100%", padding: "13px 28px", background: C.primary, color: "#fff",
          border: "none", borderRadius: "10px", fontFamily: "Poppins, sans-serif",
          fontSize: "14px", fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(27,94,32,0.22)", transition: "all 0.18s ease",
        }}>
          Sign In
        </button>
        <Link to="/shop" style={{
          display: "block", marginTop: "14px",
          fontFamily: "Poppins, sans-serif", fontSize: "13px",
          color: C.primary, textDecoration: "none", fontWeight: 500
        }}>
          Browse products →
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: "Poppins, sans-serif",
      padding: "48px 20px 100px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: "720px", margin: "0 auto", animation: "fadeUp 0.4s ease" }}>

        {/* ── Page header ── */}
        <div style={{
          marginBottom: "32px", display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
        }}>
          <div>
            <p style={{
              margin: "0 0 4px", fontSize: "11px", fontWeight: 700,
              color: C.primary, letterSpacing: "0.15em", textTransform: "uppercase"
            }}>
              Your Account
            </p>
            <h1 style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "30px",
              color: C.text, margin: 0, lineHeight: 1.2
            }}>
              My Orders
              {!loading && (() => {
                const count = orders.filter(o => o.paymentStatus?.toLowerCase() === "paid").length;
                return (
                  <span style={{ marginLeft: "12px", fontSize: "15px", fontWeight: 500, color: C.muted }}>
                    {count} {count === 1 ? "order" : "orders"}
                  </span>
                );
              })()}
            </h1>
          </div>
          <Link to="/shop" style={{
            fontFamily: "Poppins, sans-serif", fontSize: "13px",
            color: C.primary, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: "4px"
          }}>
            ← Continue Shopping
          </Link>
        </div>

        {/* ── Loading skeletons ── */}
        {loading && [1, 2, 3].map(n => <SkeletonRow key={n} />)}

        {/* ── Empty state ── */}
        {!loading && orders.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 40px", background: C.cream,
            borderRadius: "24px", border: `1px solid ${C.border}`,
            boxShadow: "0 4px 32px rgba(27,94,32,0.06)"
          }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🛍️</div>
            <h2 style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px",
              color: C.text, margin: "0 0 10px"
            }}>
              No orders yet
            </h2>
            <p style={{
              fontFamily: "Poppins, sans-serif", fontSize: "14px",
              color: C.textSecondary, margin: "0 0 32px", lineHeight: 1.7,
              maxWidth: "320px", marginLeft: "auto", marginRight: "auto"
            }}>
              You haven't placed any orders yet. Explore our organic products and place your first order!
            </p>
            <button onClick={() => navigate("/shop")} style={{
              padding: "13px 32px", background: C.primary, color: "#fff",
              border: "none", borderRadius: "10px", fontFamily: "Poppins, sans-serif",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(27,94,32,0.22)",
            }}>
              Explore Products
            </button>
          </div>
        )}

        {/* ── Orders list ── */}
        {!loading && (() => {
          const paidOrders = orders
            .filter(o => o.paymentStatus?.toLowerCase() === "paid")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          if (paidOrders.length === 0) return null;
          return (
            <div>
              {paidOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Orders;
