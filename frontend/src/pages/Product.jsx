import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Zap,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  Image,
} from "lucide-react";
import api from "../services/api";
import { addToCart, getCart } from "../services/cartApi";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";
import { setCart } from "../slices/cartSlice";
import {
  addToWishlistLocal,
  removeFromWishlistLocal,
} from "../slices/wishlistSlice";

/* ─── Helpers ────────────────────────────────────────────── */
const StarRow = ({ rating, size = 14, color = "#F59E0B" }) =>
  [...Array(5)].map((_, i) => (
    <Star
      key={i}
      size={size}
      fill={i < Math.floor(rating) ? color : i < rating ? color : "none"}
      style={{ color }}
    />
  ));

const RatingBar = ({ label, pct, color = "#1B5E20" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
    <span style={{ fontSize: "12px", color: "#555", width: "40px", flexShrink: 0 }}>{label}</span>
    <div
      style={{
        flex: 1,
        height: "6px",
        borderRadius: "999px",
        backgroundColor: "#E2ECDA",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: "999px",
          backgroundColor: color,
          transition: "width 0.6s ease",
        }}
      />
    </div>
    <span style={{ fontSize: "12px", color: "#888", width: "34px", textAlign: "right", flexShrink: 0 }}>
      {pct}%
    </span>
  </div>
);

/* ─── Static mock review data ───────────────────────────── */
const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    title: "Very tasty and pure honey",
    body: "Lorem ipsum dolor sit amet consectetur. Aliquam tristique nascetur vehicula ac neque. Nunc egestas est orci cursus.",
    date: "June 15, 2025",
  },
  {
    id: 2,
    name: "Rahul Verma",
    rating: 4,
    title: "Very tasty and pure honey",
    body: "Lorem ipsum dolor sit amet consectetur. Aliquam tristique nascetur vehicula ac neque. Nunc egestas est orci cursus.",
    date: "June 15, 2025",
  },
  {
    id: 3,
    name: "Anita Patel",
    rating: 4,
    title: "Very tasty and pure honey",
    body: "Lorem ipsum dolor sit amet consectetur. Aliquam tristique nascetur vehicula ac neque.",
    date: "June 15, 2025",
  },
  {
    id: 4,
    name: "Suresh Kumar",
    rating: 5,
    title: "Very tasty and pure honey",
    body: "Lorem ipsum dolor sit amet consectetur. Aliquam tristique nascetur vehicula ac neque. Nunc egestas est orci cursus.",
    date: "June 16, 2025",
  },
  {
    id: 5,
    name: "Meena Joshi",
    rating: 4,
    title: "Very tasty and pure honey",
    body: "Lorem ipsum dolor sit amet consectetur. Aliquam tristique nascetur vehicula ac neque. Nunc egestas est orci cursus.",
    date: "June 16, 2025",
  },
  {
    id: 6,
    name: "Vikram Singh",
    rating: 4,
    title: "Very tasty and pure honey",
    body: "Lorem ipsum dolor sit amet consectetur. Aliquam tristique nascetur vehicula ac neque.",
    date: "June 16, 2025",
  },
];

/* ─── Pincode Checker ────────────────────────────────────── */
const PincodeChecker = () => {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "unavailable"

  const check = () => {
    if (pincode.length !== 6) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    // Simulate a check — in a real app you'd call an API
    const deliverable = parseInt(pincode[0]) < 7;
    setStatus(deliverable ? "ok" : "unavailable");
  };

  return (
    <div>
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#555",
          marginBottom: "8px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Delivery Pincode
      </p>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <MapPin
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
            }}
          />
          <input
            type="text"
            maxLength={6}
            placeholder="Enter pincode"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              setStatus(null);
            }}
            style={{
              width: "100%",
              paddingLeft: "32px",
              paddingRight: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
              border: "1px solid #D4E6C8",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "Poppins, sans-serif",
              outline: "none",
              color: "#333",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={check}
          style={{
            padding: "8px 16px",
            backgroundColor: "#1B5E20",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Poppins, sans-serif",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#145214")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1B5E20")}
        >
          Check
        </button>
      </div>
      {status === "ok" && (
        <p style={{ fontSize: "12px", color: "#2E7D32", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Check size={12} /> Delivery available for this pincode
        </p>
      )}
      {status === "unavailable" && (
        <p style={{ fontSize: "12px", color: "#C62828", marginTop: "6px" }}>
          ✕ Delivery not available for this pincode yet
        </p>
      )}
    </div>
  );
};

/* ─── Image Gallery ──────────────────────────────────────── */
const ImageGallery = ({ images, name }) => {
  const [active, setActive] = useState(0);

  const imgs = images?.length ? images : [null];

  const prev = () => setActive((a) => (a - 1 + imgs.length) % imgs.length);
  const next = () => setActive((a) => (a + 1) % imgs.length);

  return (
    <div>
      {/* Main image */}
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "#E8F5E9",
          aspectRatio: "1/1",
          marginBottom: "12px",
        }}
      >
        {imgs[active] ? (
          <img
            src={imgs[active]}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#A5D6A7",
            }}
          >
            <Image size={80} strokeWidth={1} />
          </div>
        )}

        {/* Nav arrows — only show if multiple images */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.85)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <ChevronLeft size={16} style={{ color: "#333" }} />
            </button>
            <button
              onClick={next}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.85)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <ChevronRight size={16} style={{ color: "#333" }} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "10px",
                overflow: "hidden",
                border: active === i ? "2px solid #1B5E20" : "2px solid transparent",
                flexShrink: 0,
                cursor: "pointer",
                padding: 0,
                backgroundColor: "#E8F5E9",
              }}
            >
              {img ? (
                <img
                  src={img}
                  alt={`${name} ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#C8D9B0" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Description Accordion ──────────────────────────────── */
const DescriptionAccordion = ({ description }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderTop: "1px solid #E2ECDA",
        paddingTop: "16px",
        marginTop: "4px",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>
          Description
        </span>
        {open ? (
          <ChevronUp size={18} style={{ color: "#555" }} />
        ) : (
          <ChevronDown size={18} style={{ color: "#555" }} />
        )}
      </button>
      {open && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "13px",
            lineHeight: 1.75,
            color: "#555",
          }}
        >
          {description || "No description provided."}
        </p>
      )}
    </div>
  );
};

/* ─── Review card ─────────────────────────────────────────── */
const ReviewCard = ({ review }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "16px 18px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "6px",
        flexWrap: "wrap",
        gap: "4px",
      }}
    >
      <div style={{ display: "flex", gap: "2px" }}>
        <StarRow rating={review.rating} size={13} />
        <span style={{ fontSize: "12px", color: "#888", marginLeft: "4px" }}>
          {review.rating}/5
        </span>
      </div>
      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{review.date}</span>
    </div>
    <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "4px" }}>
      {review.name}
    </p>
    <p style={{ fontSize: "13px", fontWeight: 700, color: "#222", margin: "0 0 6px" }}>
      {review.title}
    </p>
    <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.65, margin: 0 }}>
      {review.body}
    </p>
  </div>
);

/* ─── Product Page ───────────────────────────────────────── */
const WEIGHT_VARIANTS = [
  { label: "250 gm", price: 250 },
  { label: "500 gm", price: 500 },
  { label: "1000 gm", price: 500 },
  { label: "150 gm", price: 500 },
];

/* Static review image placeholders (real products would have these) */
const REVIEW_IMAGE_COLORS = ["#C8D9B0", "#D4E6C8", "#A5D6A7", "#81C784", "#66BB6A"];

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);
  const isWished = product ? wishlistIds.includes(product._id) : false;

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data.data))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      return;
    }
    try {
      for (let i = 0; i < qty; i++) await addToCart(product._id);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      toast.success("Added to cart! 🛒");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login");
      return;
    }
    try {
      for (let i = 0; i < qty; i++) await addToCart(product._id);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      navigate("/checkout");
    } catch {
      toast.error("Failed");
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login");
      return;
    }
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
    } catch {
      toast.error("Failed");
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F8F6F0",
          fontFamily: "Poppins, sans-serif",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
          }}
        >
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ borderRadius: "16px", backgroundColor: "#E2ECDA", aspectRatio: i === 0 ? "1/1" : "auto", height: i === 1 ? "400px" : undefined }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Poppins, sans-serif",
          gap: "16px",
        }}
      >
        <p style={{ color: "#555", fontSize: "16px" }}>Product not found.</p>
        <Link
          to="/shop"
          style={{
            color: "#1B5E20",
            fontWeight: 600,
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          ← Back to Shop
        </Link>
      </div>
    );

  const rating = product.rating || 4.2;
  const reviewCount = product.reviewCount || 30;
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  /* Fake rating breakdown */
  const ratingBreakdown = [
    { label: "5 star", pct: 70 },
    { label: "4 star", pct: 30 },
    { label: "3 star", pct: 0 },
    { label: "2 star", pct: 0 },
    { label: "1 star", pct: 0 },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F6F0",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ── Breadcrumb strip ── */}
      <div
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #E2ECDA",
          padding: "10px 24px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <nav style={{ fontSize: "12px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "6px" }}>
            <Link to="/" style={{ color: "#9CA3AF", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link to="/shop" style={{ color: "#9CA3AF", textDecoration: "none" }}>Shop</Link>
            <span>/</span>
            <span style={{ color: "#1B5E20", fontWeight: 500 }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main product section ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: "40px",
            alignItems: "start",
          }}
          className="product-grid"
        >
          {/* ── Left: gallery ── */}
          <ImageGallery images={product.images} name={product.name} />

          {/* ── Right: details ── */}
          <div>
            {/* Category badge */}
            <span
              style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "3px 10px",
                borderRadius: "999px",
                backgroundColor: "#E8F5E9",
                color: "#1B5E20",
                marginBottom: "10px",
              }}
            >
              {product.category}
            </span>

            {/* Name */}
            <h1
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: "0 0 12px",
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </h1>

            {/* Price + rating row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#1B5E20",
                  }}
                >
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <s style={{ fontSize: "15px", color: "#BDBDBD" }}>₹{product.mrp}</s>
                )}
                {discount > 0 && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#1B5E20",
                      backgroundColor: "#E8F5E9",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      border: "1px solid rgba(212, 230, 200, 0.8)"
                    }}
                  >
                    {discount}% OFF
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ display: "flex", gap: "1px" }}>
                  <StarRow rating={rating} size={14} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1B5E20" }}>
                  {rating}/5
                </span>
              </div>
            </div>

            {/* Qty */}
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#555",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Quantity
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid #D4E6C8",
                    borderRight: "none",
                    borderRadius: "8px 0 0 8px",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#1B5E20",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
                <div
                  style={{
                    width: "48px",
                    height: "36px",
                    border: "1px solid #D4E6C8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#222",
                  }}
                >
                  {qty}
                </div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid #D4E6C8",
                    borderLeft: "none",
                    borderRadius: "0 8px 8px 0",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#1B5E20",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Pincode */}
            <div style={{ marginBottom: "16px" }}>
              <PincodeChecker />
            </div>

            {/* Weight variants */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {WEIGHT_VARIANTS.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(i)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: `1.5px solid ${selectedVariant === i ? "#1B5E20" : "#D4E6C8"}`,
                      backgroundColor: selectedVariant === i ? "#E8F5E9" : "#fff",
                      cursor: "pointer",
                      fontFamily: "Poppins, sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    <p style={{ fontSize: "11px", fontWeight: 600, color: selectedVariant === i ? "#1B5E20" : "#555", margin: 0 }}>
                      {v.label}
                    </p>
                    <p style={{ fontSize: "10px", color: "#888", margin: 0 }}>
                      ₹ {v.price}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "13px 20px",
                  backgroundColor: "#1B5E20",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#145214")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1B5E20")}
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "13px 20px",
                  backgroundColor: "#8D6E4A",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6D4E2E")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8D6E4A")}
              >
                <Zap size={16} />
                Buy Now
              </button>
              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  border: `1.5px solid ${isWished ? "#FFCDD2" : "#D4E6C8"}`,
                  backgroundColor: isWished ? "#FFEBEE" : "#fff",
                  color: isWished ? "#E53935" : "#9CA3AF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFEBEE";
                  e.currentTarget.style.color = "#E53935";
                }}
                onMouseLeave={(e) => {
                  if (!isWished) {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.color = "#9CA3AF";
                  }
                }}
              >
                <Heart size={18} fill={isWished ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Subscription banner */}
            {product.isSubscriptionAllowed && (
              <Link
                to="/subscription"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#E8F5E9",
                  border: "1px solid #C8E6C9",
                  textDecoration: "none",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "18px" }}>🔁</span>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#1B5E20" }}>
                    Subscribe &amp; Save up to 20%
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#4CAF50" }}>
                    Available on subscription — tap to explore plans
                  </p>
                </div>
              </Link>
            )}

            {/* Stock info */}
            <p style={{ fontSize: "12px", color: product.stock > 0 ? "#4CAF50" : "#E53935", margin: 0 }}>
              {product.stock > 0 ? `✓ In stock (${product.stock} units)` : "✕ Out of stock"}
            </p>

            {/* Description accordion */}
            <div style={{ marginTop: "20px" }}>
              <DescriptionAccordion description={product.description} />
            </div>
          </div>
        </div>

        {/* ── Reviews section ── */}
        <div style={{ marginTop: "60px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)",
              gap: "40px",
              alignItems: "start",
            }}
            className="reviews-grid"
          >
            {/* Rating breakdown */}
            <div>
              <h2
                style={{
                  fontSize: "clamp(18px, 2.5vw, 22px)",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  margin: "0 0 20px",
                }}
              >
                Customer reviews
              </h2>
              {/* Overall score */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  <StarRow rating={rating} size={18} />
                </div>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>
                  {rating} out of 5
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "16px" }}>
                Based on {reviewCount}k reviews
              </p>

              {/* Bars */}
              <div>
                {ratingBreakdown.map((row) => (
                  <RatingBar key={row.label} label={row.label} pct={row.pct} />
                ))}
              </div>
            </div>

            {/* Review images + list */}
            <div>
              {/* Review images */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>
                    Review images
                  </h3>
                  <button style={{ fontSize: "12px", color: "#1B5E20", background: "none", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                    See photos →
                  </button>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {REVIEW_IMAGE_COLORS.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "10px",
                        backgroundColor: c,
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {product.images?.[i] ? (
                        <img
                          src={product.images[i]}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MOCK_REVIEWS.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── You might also like ── */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <Link
            to="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              backgroundColor: "#1B5E20",
              color: "#fff",
              borderRadius: "999px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#145214")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1B5E20")}
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 700px) {
          .product-grid {
            grid-template-columns: 1fr !important;
          }
          .reviews-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Product;