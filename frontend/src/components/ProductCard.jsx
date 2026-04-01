import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { addToCart, getCart } from "../services/cartApi";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";
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
  const rating = product.rating || 4;
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      await addToCart(product._id);
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

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300"
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

      {/* Info */}
      <div className="p-3">
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

        <h3 className="font-medium text-sm leading-snug line-clamp-2" style={{ color: "#222" }}>
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold" style={{ color: "#1B5E20" }}>₹{product.price}</span>
          {product.mrp > product.price && (
            <s className="text-xs" style={{ color: "#BDBDBD" }}>₹{product.mrp}</s>
          )}
        </div>

        {/* Size selector pill (if variants exist) */}
        {product.sizes?.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {product.sizes.slice(0, 3).map((sz) => (
              <span
                key={sz}
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ borderColor: "#D4E6C8", color: "#555" }}
              >
                {sz}
              </span>
            ))}
          </div>
        )}

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

export default ProductCard;