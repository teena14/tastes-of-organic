import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { addToCart, getCart } from "../services/apiClient";
import { addToWishlist, removeFromWishlist } from "../services/apiClient";
import { setCart } from "../slices/cartSlice";
import { addToWishlistLocal, removeFromWishlistLocal } from "../slices/wishlistSlice";

/**
 * ProductCard
 * Props:
 *   product (object) — real product data from the API
 *   placeholder (bool) — render a static preview tile (no API calls)
 */
const ProductCard = ({ product, placeholder = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);
  const [selectedVariant, setSelectedVariant] = useState(product?.sizes?.[0] || null);

  // ── Placeholder tile for homepage preview grids ──
  if (placeholder || !product) {
    return (
      <div className="group block rounded-2xl overflow-hidden" style={{ backgroundColor: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div className="aspect-[4/3]" style={{ backgroundColor: "#C8D9B0" }} />
        <div className="p-3">
          <p className="font-medium text-sm text-gray-800">Our Products</p>
          <p className="text-xs text-gray-500 mt-0.5">₹123</p>
          <div
            className="mt-3 w-full py-2 rounded-lg text-center text-xs font-medium text-white"
            style={{ backgroundColor: "#1B5E20" }}
          >
            Add to Cart
          </div>
        </div>
      </div>
    );
  }

  // ── Real product tile ──
  const isWished = wishlistIds.includes(product._id);
  const rating = product.rating || 0;
  const displayPrice = selectedVariant ? selectedVariant.price : product?.price;
  const displayMrp = selectedVariant ? selectedVariant.mrp : product?.mrp;
  const discount = displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      await addToCart(product._id, selectedVariant?.size);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      toast.success("Added to cart! 🛒");
    } catch { toast.error("Failed to add to cart"); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
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


  if (product.category === "COMBOS") {
    const imgs = product.images || [];
    const discount = product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

    const mainImg = imgs[0] || null;
    const additionalImgs = imgs.slice(1, 4); // up to 3 thumbnails

    return (
      <Link
        to={`/product/${product._id}`}
        className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 relative"
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(27,94,32,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* ── Image Area ── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#D4E6C8" }}>
          {mainImg ? (
            <img
              src={mainImg}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: "#C8D9B0" }} />
          )}

          {/* Overlapping Thumbnails */}
          {additionalImgs.length > 0 && (
            <div className="absolute bottom-2 right-2 flex -space-x-2">
              {additionalImgs.map((src, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm"
                  style={{ backgroundColor: "#D4E6C8" }}
                >
                  <img src={src} alt="combo item" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* COMBO badge */}
          <span
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#1B5E20", color: "#fff" }}
          >
            COMBO
          </span>

          {/* Savings badge */}
          {discount > 0 && (
            <span
              className="absolute top-9 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", color: "#1B5E20", border: "1px solid rgba(212, 230, 200, 0.5)" }}
            >
              Save {discount}%
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm shadow transition-all duration-200"
            style={{
              backgroundColor: isWished ? "#FFEBEE" : "rgba(255,255,255,0.85)",
              color: isWished ? "#E53935" : "#9E9E9E",
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#E53935"; e.currentTarget.style.backgroundColor = "#FFEBEE"; }}
            onMouseLeave={(e) => {
              if (!isWished) {
                e.currentTarget.style.color = "#9E9E9E";
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.85)";
              }
            }}
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={isWished ? "currentColor" : "none"} />
          </button>
        </div>

        {/* ── Info ── */}
        <div className="p-3 flex flex-col flex-1">
          <h3
            className="font-medium text-sm leading-snug"
            style={{
              color: "#222",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
            }}
          >
            {product.name}
          </h3>

          {/* Items list */}
          {product.comboItems?.length > 0 && (
            <div className="mt-1.5 mb-2">
              {product.comboItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1 text-[11px] font-medium" style={{ color: "#44784C" }}>
                  <span style={{ color: "#1B5E20" }}>+</span>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price row */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-sm" style={{ color: "#1B5E20" }}>₹{product.price}</span>
            {product.mrp > product.price && (
              <s className="text-xs" style={{ color: "#BDBDBD" }}>₹{product.mrp}</s>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{ backgroundColor: "#1B5E20" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#145214"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1B5E20"; }}
          >
            <ShoppingCart size={12} />
            Add to Cart
          </button>
        </div>
      </Link>
    );
  }


  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(27,94,32,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]" style={{ backgroundColor: "#D4E6C8" }}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "#C8D9B0" }} />
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-md"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", color: "#1B5E20", border: "1px solid rgba(212, 230, 200, 0.5)" }}
          >
            {discount}% OFF
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm shadow transition-all duration-200"
          style={{
            backgroundColor: isWished ? "#FFEBEE" : "rgba(255,255,255,0.85)",
            color: isWished ? "#E53935" : "#9E9E9E",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#E53935"; e.currentTarget.style.backgroundColor = "#FFEBEE"; }}
          onMouseLeave={(e) => {
            if (!isWished) {
              e.currentTarget.style.color = "#9E9E9E";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.85)";
            }
          }}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info — flex-col + flex-1 so all cards grow to the same height */}
      <div className="p-3 flex flex-col flex-1">
        {/* Star rating */}
        <div className="flex items-center gap-0.5 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={11}
              fill={i < Math.floor(rating) ? "#F59E0B" : "none"}
              style={{ color: "#F59E0B" }}
            />
          ))}
          <span className="ml-1 text-[10px]" style={{ color: "#888" }}>({product.reviewCount || 0})</span>
        </div>

        {/* Name — always occupies exactly 2 lines to keep cards uniform */}
        <h3
          className="font-medium text-sm leading-snug"
          style={{
            color: "#222",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.6em",
          }}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold" style={{ color: "#1B5E20" }}>₹{displayPrice}</span>
          {displayMrp > displayPrice && (
            <s className="text-xs" style={{ color: "#BDBDBD" }}>₹{displayMrp}</s>
          )}
        </div>

        {/* Size selector dropdown (if variants exist) */}
        {product.sizes?.length > 0 && (
          <div className="mt-2">
            <select
              value={selectedVariant?.size || ""}
              onChange={(e) => {
                const variant = product.sizes.find(v => v.size === e.target.value);
                if (variant) setSelectedVariant(variant);
              }}
              onClick={(e) => e.preventDefault()}
              className="w-full text-xs py-1.5 px-2 rounded border outline-none cursor-pointer"
              style={{ borderColor: "#D4E6C8", color: "#555", backgroundColor: "#F9FBF7" }}
            >
              {product.sizes.map((sz) => (
                <option key={sz.size} value={sz.size}>{sz.size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all duration-200"
          style={{ backgroundColor: "#1B5E20" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#145214"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1B5E20"; }}
        >
          <ShoppingCart size={12} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export const SubscriptionProductCard = ({ product, cartItem, onAdd, onIncrease, onDecrease }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);
  const isWished = wishlistIds.includes(product._id);

  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const variantLine = product.sizes?.length
    ? product.sizes.slice(0, 2).map(s => s.size).join(", ")
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

      <div style={{ padding: "8px 8px 8px", flex: 1, display: "flex", flexDirection: "column" }}>
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

        <p style={{ fontSize: "11px", fontWeight: 600, color: "#222", lineHeight: 1.3, marginBottom: "2px" }}>
          {product.name}
        </p>

        {variantLine && (
          <p style={{ fontSize: "9px", color: "#777", marginBottom: "2px" }}>{variantLine}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1B5E20" }}>₹{product.price}</span>
          {product.mrp > product.price && (
            <s style={{ fontSize: "9px", color: "#BDBDBD" }}>₹{product.mrp}</s>
          )}
          {discount > 0 && (
            <span style={{ fontSize: "9px", color: "#388E3C" }}>{discount}%</span>
          )}
        </div>

        <div style={{ marginTop: "auto" }}>
          {cartItem ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <button
                onClick={onDecrease}
                style={{
                  width: "24px", height: "24px", borderRadius: "999px",
                  border: "1.5px solid #1B5E20", backgroundColor: "#fff",
                  color: "#1B5E20", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "12px" }}>-</span>
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
                <span style={{ fontSize: "12px" }}>+</span>
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

export default ProductCard;