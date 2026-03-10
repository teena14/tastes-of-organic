import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Search, Heart, Star, Plus, Minus } from "lucide-react";
import { fetchProducts } from "../services/productApi";
import { createSubscription, verifySubscriptionPayment } from "../services/subscriptionApi";
import {
  selectPlan,
  addSubscriptionItem,
  updateSubscriptionItem,
  clearSubscription,
} from "../slices/subscriptionSlice";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";
import { addToWishlistLocal, removeFromWishlistLocal } from "../slices/wishlistSlice";

/* ─────────────────────────── Constants ─────────────────────────── */
const PLANS = [
  { months: 3, discount: 10 },
  { months: 6, discount: 15 },
  { months: 12, discount: 20 },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

const CATEGORIES = ["All", "Honey", "Pulses", "Wheat", "Millet", "Spices", "Oils"];

/* ─────────────────────────── SubscriptionProductCard ──────────────── */
const SubscriptionProductCard = ({ product, cartItem, onAdd, onIncrease, onDecrease }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);
  const isWished = wishlistIds.includes(product._id);

  const rating = product.rating || 4;
  const reviewCount = product.reviewCount || 0;
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const combinedName = [product.name, product.category?.toLowerCase() || ""].join(" ");
  // e.g. "Amlaa · 100g" style description from product fields
  const variantLine = product.sizes?.length
    ? product.sizes.slice(0, 2).join(", ")
    : product.weight
      ? product.weight
      : "";

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      if (isWished) {
        await removeFromWishlist(product._id);
        dispatch(removeFromWishlistLocal(product._id));
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product._id);
        dispatch(addToWishlistLocal(product._id));
        toast.success("Added to wishlist ♡");
      }
    } catch { toast.error("Failed"); }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(27,94,32,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", backgroundColor: "#D4E6C8", aspectRatio: "4/3", overflow: "hidden" }}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#C8D9B0" }} />
        )}
        {discount > 0 && (
          <span
            style={{
              position: "absolute", top: "6px", left: "6px",
              backgroundColor: "#E53935", color: "#fff",
              fontSize: "9px", fontWeight: 700, padding: "2px 6px",
              borderRadius: "999px",
            }}
          >
            -{discount}%
          </span>
        )}
        <button
          onClick={handleWishlist}
          style={{
            position: "absolute", top: "6px", right: "6px",
            backgroundColor: isWished ? "#FFEBEE" : "rgba(255,255,255,0.85)",
            color: isWished ? "#E53935" : "#9E9E9E",
            border: "none", borderRadius: "999px", padding: "5px",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          aria-label="Wishlist"
        >
          <Heart size={12} fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 8px 8px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Stars */}
        <div style={{ display: "flex", alignItems: "center", gap: "1px", marginBottom: "2px" }}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={9}
              fill={i < Math.floor(rating) ? "#F59E0B" : "none"}
              style={{ color: "#F59E0B" }}
            />
          ))}
          <span style={{ fontSize: "9px", color: "#888", marginLeft: "3px" }}>{reviewCount}</span>
        </div>

        {/* Name */}
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#222", lineHeight: 1.3, marginBottom: "2px" }}>
          {product.name}
        </p>

        {/* Variant info */}
        {variantLine && (
          <p style={{ fontSize: "9px", color: "#777", marginBottom: "2px" }}>{variantLine}</p>
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1B5E20" }}>₹{product.price}</span>
          {product.mrp > product.price && (
            <s style={{ fontSize: "9px", color: "#BDBDBD" }}>₹{product.mrp}</s>
          )}
          {discount > 0 && (
            <span style={{ fontSize: "9px", color: "#388E3C" }}>{discount}%</span>
          )}
        </div>

        {/* Add / Qty controls */}
        <div style={{ marginTop: "auto" }}>
          {cartItem ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={onDecrease}
                style={{
                  width: "24px", height: "24px", borderRadius: "999px",
                  border: "1.5px solid #1B5E20", backgroundColor: "#fff",
                  color: "#1B5E20", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Minus size={10} />
              </button>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#222", minWidth: "16px", textAlign: "center" }}>
                {cartItem.quantity}
              </span>
              <button
                onClick={onIncrease}
                style={{
                  width: "24px", height: "24px", borderRadius: "999px",
                  border: "1.5px solid #1B5E20", backgroundColor: "#fff",
                  color: "#1B5E20", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              style={{
                width: "100%", padding: "5px 0", borderRadius: "6px",
                backgroundColor: "#1B5E20", color: "#fff",
                border: "none", fontSize: "10px", fontWeight: 600,
                cursor: "pointer", transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#145214"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1B5E20"; }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Subscription Page ─────────────────────── */
const Subscription = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("All");
  const [paying, setPaying] = useState(false);

  const dispatch = useDispatch();
  const { selectedPlan, items } = useSelector((s) => s.subscription);
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    setLoading(true);
    fetchProducts({})
      .then((r) => setProducts((r.data || []).filter((p) => p.isSubscriptionAllowed)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── Filtering & Sorting ── */
  const displayed = products
    .filter((p) => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category?.toUpperCase() === category.toUpperCase();
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  /* ── Calculations ── */
  const monthlyTotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discountPct = selectedPlan ? PLANS.find((p) => p.months === selectedPlan)?.discount ?? 0 : 0;
  const discountedMonthly = monthlyTotal * (1 - discountPct / 100);
  const upfrontTotal = selectedPlan ? discountedMonthly * selectedPlan : 0;

  /* ── Handlers ── */
  const handleAdd = (p) => {
    if (!selectedPlan) { toast.error("Select a plan first"); return; }
    dispatch(addSubscriptionItem(p));
  };

  const handlePay = async () => {
    if (!isAuthenticated) { toast.error("Please login"); return; }
    if (!selectedPlan) { toast.error("Select a plan"); return; }
    if (items.length === 0) { toast.error("Add at least one product"); return; }
    try {
      setPaying(true);
      const res = await createSubscription({
        products: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        durationMonths: selectedPlan,
      });
      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        name: "Tastes of Organic",
        order_id: res.razorpayOrderId,
        handler: async (response) => {
          try {
            await verifySubscriptionPayment({ ...response, subscriptionId: res.subscriptionId });
            dispatch(clearSubscription());
            toast.success("Subscription activated! 🎉");
          } catch { toast.error("Verification failed"); }
          finally { setPaying(false); }
        },
        modal: { ondismiss: () => { toast("Payment cancelled"); setPaying(false); } },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment failed");
      setPaying(false);
    }
  };

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F6F0", fontFamily: "Poppins, sans-serif" }}>

      {/* ══════════════════ HERO BANNER ══════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
          paddingTop: "110px",
          paddingBottom: "50px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "180px", height: "180px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: "-20px", left: "-20px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 700, margin: 0, marginBottom: "8px" }}>
            Subscription Plans
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", margin: 0 }}>
            Get your organics delivered to you at your doorstep automatically every month
          </p>
        </div>
      </div>

      {/* ══════════════════ PLAN CARDS ══════════════════ */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.months;
            return (
              <button
                key={plan.months}
                onClick={() => dispatch(selectPlan(active ? null : plan.months))}
                style={{
                  borderRadius: "10px",
                  padding: "18px 14px",
                  textAlign: "center",
                  border: active ? "2px solid #1B5E20" : "2px solid #D4E6C8",
                  backgroundColor: active ? "#E8F5E9" : "#F0F7EB",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#1B5E20", margin: 0, marginBottom: "4px" }}>
                  {plan.months} Months
                </p>
                <p style={{ fontSize: "12px", color: "#4CAF50", margin: 0, marginBottom: "12px" }}>
                  Save {plan.discount}% of price
                </p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 18px",
                    borderRadius: "999px",
                    backgroundColor: active ? "#1B5E20" : "#4CAF50",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                    transition: "background-color 0.2s",
                  }}
                >
                  {active ? "Selected ✓" : "Select Plan"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════ BODY: PRODUCTS + SUMMARY ══════════════════ */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "28px 16px 48px",
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* ─── LEFT: product browser ─── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#222", marginBottom: "14px", marginTop: 0 }}>
            Build Your Monthly Box
          </h2>

          {/* Toolbar: search · sort · category */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: "150px" }}>
              <Search
                size={13}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888" }}
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "30px",
                  paddingRight: "10px",
                  paddingTop: "7px",
                  paddingBottom: "7px",
                  borderRadius: "999px",
                  border: "1px solid #D4E6C8",
                  backgroundColor: "#fff",
                  fontSize: "12px",
                  color: "#333",
                  outline: "none",
                  fontFamily: "Poppins, sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: "999px",
                border: "1px solid #D4E6C8",
                backgroundColor: "#fff",
                fontSize: "12px",
                color: "#333",
                outline: "none",
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: "999px",
                border: "1px solid #D4E6C8",
                backgroundColor: "#fff",
                fontSize: "12px",
                color: "#333",
                outline: "none",
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Product grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{ aspectRatio: "4/3", backgroundColor: "#E2ECDA" }}
                    className="animate-pulse"
                  />
                  <div style={{ padding: "8px" }}>
                    <div style={{ height: "10px", backgroundColor: "#D4E6C8", borderRadius: "4px", marginBottom: "6px", width: "75%" }} />
                    <div style={{ height: "10px", backgroundColor: "#D4E6C8", borderRadius: "4px", width: "50%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              <p style={{ fontSize: "15px", marginBottom: "8px" }}>No subscription products found.</p>
              <p style={{ fontSize: "13px" }}>Try adjusting your search or category.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {displayed.map((p) => {
                const cartItem = items.find((i) => i.product._id === p._id);
                return (
                  <SubscriptionProductCard
                    key={p._id}
                    product={p}
                    cartItem={cartItem}
                    onAdd={() => handleAdd(p)}
                    onIncrease={() =>
                      dispatch(updateSubscriptionItem({ productId: p._id, quantity: cartItem.quantity + 1 }))
                    }
                    onDecrease={() =>
                      dispatch(updateSubscriptionItem({ productId: p._id, quantity: cartItem.quantity - 1 }))
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Summary sidebar ─── */}
        <div
          style={{
            width: "240px",
            flexShrink: 0,
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #D4E6C8",
            padding: "18px",
            position: "sticky",
            top: "80px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#1B5E20",
              margin: 0,
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Subscription<br />Summary
          </h3>

          {/* Items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {items.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#999", textAlign: "center", margin: 0, padding: "12px 0" }}>
                No items added yet.<br />Select a plan and add products.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.product._id}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {/* Product thumbnail */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      backgroundColor: "#D4E6C8",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#333", margin: 0, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "#1B5E20", fontWeight: 700, margin: 0 }}>
                      Rs {item.product.price}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      onClick={() =>
                        dispatch(updateSubscriptionItem({ productId: item.product._id, quantity: item.quantity - 1 }))
                      }
                      style={{
                        width: "20px", height: "20px", borderRadius: "4px",
                        border: "1px solid #D4E6C8", backgroundColor: "#F0F7EB",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#1B5E20", fontSize: "12px", fontWeight: 700,
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: "12px", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(updateSubscriptionItem({ productId: item.product._id, quantity: item.quantity + 1 }))
                      }
                      style={{
                        width: "20px", height: "20px", borderRadius: "4px",
                        border: "1px solid #D4E6C8", backgroundColor: "#F0F7EB",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#1B5E20", fontSize: "12px", fontWeight: 700,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #E8F5E9", paddingTop: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#555" }}>Total :</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#222" }}>
                {upfrontTotal > 0 ? `₹${Math.round(upfrontTotal)}` : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#555" }}>Total Monthly :</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#222" }}>
                {discountedMonthly > 0 ? `₹${Math.round(discountedMonthly)}` : "—"}
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={paying || !selectedPlan || items.length === 0}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: "8px",
              backgroundColor: paying || !selectedPlan || items.length === 0 ? "#A5D6A7" : "#1B5E20",
              color: "#fff",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: paying || !selectedPlan || items.length === 0 ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!paying && selectedPlan && items.length > 0) {
                e.currentTarget.style.backgroundColor = "#145214";
              }
            }}
            onMouseLeave={(e) => {
              if (!paying && selectedPlan && items.length > 0) {
                e.currentTarget.style.backgroundColor = "#1B5E20";
              }
            }}
          >
            {paying ? "Processing…" : "Proceed to payment"}
          </button>

          {!isAuthenticated && (
            <p style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "8px", marginBottom: 0 }}>
              Please <a href="/login" style={{ color: "#1B5E20", fontWeight: 600 }}>login</a> to subscribe
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
