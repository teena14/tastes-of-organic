import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { getWishlist, removeFromWishlist } from "../services/apiClient";
import { addToCart, getCart } from "../services/apiClient";
import { setWishlist, removeFromWishlistLocal } from "../slices/wishlistSlice";
import { setCart } from "../slices/cartSlice";

/* ─── Design Tokens ─── */
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
  redLight: "#FCA5A5",
  redBg: "#FEF2F2",
};

/* ─── Shared Components ─── */
const PrimaryButton = ({ children, onClick, block, small }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: block ? "100%" : "auto",
        padding: small ? "8px 16px" : "13px 28px",
        background: hov ? C.primaryDark : C.primary,
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontFamily: "Poppins, sans-serif",
        fontSize: small ? "12px" : "14px",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.02em",
        boxShadow: hov
          ? "0 6px 22px rgba(27,94,32,0.32)"
          : "0 4px 16px rgba(27,94,32,0.22)",
        transform: hov ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
      }}
    >
      {children}
    </button>
  );
};

const CenteredCard = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "Poppins, sans-serif",
    }}
  >
    <div
      style={{
        textAlign: "center",
        padding: "52px 40px",
        background: C.cream,
        borderRadius: "24px",
        border: `1px solid ${C.border}`,
        maxWidth: "420px",
        width: "100%",
        boxShadow: "0 8px 40px rgba(27,94,32,0.08)",
      }}
    >
      {children}
    </div>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
  </div>
);

/* ─── Wishlist Product Card ─── */
const WishlistCard = ({ product, onRemove, onAddToCart }) => {
  const [hov, setHov] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [movedToCart, setMovedToCart] = useState(false); // stays true until navigation
  const [removeHov, setRemoveHov] = useState(false);
  const [cartHov, setCartHov] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove();
  };

  const handleAddToCart = async () => {
    if (movedToCart) return;
    setAddingToCart(true);
    await onAddToCart();
    setAddingToCart(false);
    setMovedToCart(true); // lock into success state until page unmounts
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: movedToCart ? C.primaryLight : C.white,
        borderRadius: "20px",
        border: `1px solid ${movedToCart ? C.sage : hov ? C.borderHover : C.border}`,
        overflow: "hidden",
        boxShadow: movedToCart
          ? "0 4px 20px rgba(27,94,32,0.18)"
          : hov
          ? "0 8px 32px rgba(27,94,32,0.12)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        opacity: removing ? 0.4 : 1,
        transform: removing ? "scale(0.97)" : hov && !movedToCart ? "translateY(-3px)" : "translateY(0)",
        pointerEvents: movedToCart ? "none" : "auto",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.22s ease, transform 0.22s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image / Thumbnail */}
      <Link
        to={`/product/${product._id}`}
        style={{
          textDecoration: "none",
          display: "block",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            background: `linear-gradient(140deg, ${C.sageLight} 0%, ${C.sage} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontSize: "52px",
            position: "relative",
          }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            "🌿"
          )}
          {/* Organic badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: C.primary,
              color: "#fff",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "3px 8px",
              borderRadius: "999px",
              fontFamily: "Poppins, sans-serif",
              textTransform: "uppercase",
            }}
          >
            Organic
          </div>

          {/* Remove button overlay */}
          <button
            onClick={(e) => { e.preventDefault(); handleRemove(); }}
            onMouseEnter={(e) => { e.stopPropagation(); setRemoveHov(true); }}
            onMouseLeave={(e) => { e.stopPropagation(); setRemoveHov(false); }}
            disabled={removing}
            title="Remove from wishlist"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: `1.5px solid ${removeHov ? C.redLight : "transparent"}`,
              background: removeHov ? C.redBg : "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: removing ? "not-allowed" : "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              transition: "all 0.15s ease",
              backdropFilter: "blur(4px)",
            }}
          >
            {removing ? (
              <span style={{ fontSize: "14px" }}>…</span>
            ) : (
              <Heart size={18} color={C.red} fill={C.red} />
            )}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <Link
            to={`/product/${product._id}`}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: C.text,
              textDecoration: "none",
              lineHeight: 1.4,
              marginBottom: "4px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.name}
          </Link>
          {product.category && (
            <span
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "11px",
                color: C.primary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {product.category}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "Poppins, sans-serif",
                fontWeight: 800,
                fontSize: "18px",
                color: C.primary,
              }}
            >
              ₹{product.price?.toLocaleString("en-IN")}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p
                style={{
                  margin: 0,
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "12px",
                  color: C.muted,
                  textDecoration: "line-through",
                }}
              >
                ₹{product.originalPrice?.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || movedToCart}
          onMouseEnter={() => setCartHov(true)}
          onMouseLeave={() => setCartHov(false)}
          style={{
            width: "100%",
            padding: "10px",
            background: movedToCart
              ? C.primary
              : addingToCart
              ? C.sageLight
              : cartHov
              ? C.primaryDark
              : C.primary,
            color: addingToCart && !movedToCart ? C.primary : "#fff",
            border: movedToCart ? `2px solid ${C.primary}` : "none",
            borderRadius: "10px",
            fontFamily: "Poppins, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            cursor: addingToCart || movedToCart ? "default" : "pointer",
            letterSpacing: "0.02em",
            boxShadow: movedToCart
              ? "0 4px 18px rgba(27,94,32,0.28)"
              : cartHov && !addingToCart
              ? "0 6px 22px rgba(27,94,32,0.32)"
              : "0 3px 12px rgba(27,94,32,0.18)",
            transform: movedToCart
              ? "scale(1.02)"
              : cartHov && !addingToCart
              ? "translateY(-1px)"
              : "translateY(0)",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {addingToCart ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 0.7s linear infinite", fontSize: "13px" }}>↻</span>
              Adding…
            </>
          ) : movedToCart ? (
            <>
              <span style={{
                width: "16px", height: "16px", borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 800,
              }}>✓</span>
              Moved to Cart
            </>
          ) : (
            <>
              🛒 Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton Loader ─── */
const SkeletonCard = () => (
  <div
    style={{
      background: C.white,
      borderRadius: "20px",
      border: `1px solid ${C.border}`,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}
  >
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        background: `linear-gradient(90deg, ${C.sageLight} 25%, #e8f0dc 50%, ${C.sageLight} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {[80, 60, 40].map(w => (
        <div
          key={w}
          style={{
            height: "14px",
            width: `${w}%`,
            borderRadius: "6px",
            background: `linear-gradient(90deg, ${C.sageLight} 25%, #e8f0dc 50%, ${C.sageLight} 75%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />
      ))}
    </div>
  </div>
);

/* ─── Main Page ─── */
const Wishlist = () => {
  const [items, setItems] = useState([]);
  const { isAuthenticated } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    getWishlist()
      .then(d => {
        const data = d || [];
        setItems(data);
        dispatch(setWishlist(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, dispatch]);

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id);
      dispatch(removeFromWishlistLocal(id));
      setItems(prev => prev.filter(p => p._id !== id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Couldn't remove item");
    }
  };

  const handleAddToCart = async (id) => {
    try {
      // Add to cart AND remove from wishlist on the backend simultaneously.
      // The card stays visible with "Moved to Cart" state.
      // When user navigates away and returns, the wishlist re-fetches and item is gone.
      await Promise.all([
        addToCart(id),
        removeFromWishlist(id),
      ]);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      dispatch(removeFromWishlistLocal(id));
    } catch {
      toast.error("Couldn't add to cart");
    }
  };

  /* ── Not authenticated ── */
  if (!isAuthenticated && !loading) return (
    <CenteredCard>
      <div style={{ fontSize: "56px", marginBottom: "20px" }}>🤍</div>
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px", color: C.text, margin: "0 0 8px" }}>
        Sign in to see your wishlist
      </h2>
      <p style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.7 }}>
        Save your favourite organic products and come back to them anytime.
      </p>
      <PrimaryButton block onClick={() => navigate("/login")}>Sign In</PrimaryButton>
      <Link to="/shop" style={{ display: "block", marginTop: "14px", fontFamily: "Poppins, sans-serif", fontSize: "13px", color: C.primary, textDecoration: "none", fontWeight: 500 }}>
        Browse products →
      </Link>
    </CenteredCard>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "Poppins, sans-serif",
        padding: "48px 20px 100px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div
          style={{
            marginBottom: "36px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: "11px",
                fontWeight: 700,
                color: C.primary,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Your Saves
            </p>
            <h1
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "30px",
                color: C.text,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Wishlist
              {!loading && (
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: C.muted,
                  }}
                >
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              )}
            </h1>
          </div>
          <Link
            to="/shop"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "13px",
              color: C.primary,
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* ── Add All to Cart — shown when items exist ── */}
        {!loading && items.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <button
              onClick={async () => {
                const promises = items.map(p => addToCart(p._id).catch(() => {}));
                await Promise.all(promises);
                const data = await getCart().catch(() => null);
                if (data) dispatch(setCart(data));
                toast.success("All items added to cart!");
              }}
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: C.primary,
                background: C.primaryLight,
                border: `1.5px solid ${C.sage}`,
                borderRadius: "10px",
                padding: "9px 18px",
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
              }}
            >
              🛒 Add All to Cart
            </button>
          </div>
        )}
        {loading && (

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && items.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
              background: C.cream,
              borderRadius: "24px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 32px rgba(27,94,32,0.06)",
            }}
          >
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🤍</div>
            <h2
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                color: C.text,
                margin: "0 0 10px",
              }}
            >
              Your wishlist is empty
            </h2>
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                color: C.textSecondary,
                margin: "0 0 32px",
                lineHeight: 1.7,
                maxWidth: "360px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Discover our pure Himalayan organic products and save your favourites here.
            </p>
            <PrimaryButton onClick={() => navigate("/shop")}>
              Explore Products
            </PrimaryButton>
          </div>
        )}

        {/* ── Product Grid ── */}
        {!loading && items.length > 0 && (

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",

              }}
            >
              {items.map(product => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={() => handleRemove(product._id)}
                  onAddToCart={() => handleAddToCart(product._id)}
                />
              ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;