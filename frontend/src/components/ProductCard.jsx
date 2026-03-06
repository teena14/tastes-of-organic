import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, ShoppingCart } from "lucide-react";
import { addToCart, getCart } from "../services/cartApi";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";
import { setCart } from "../slices/cartSlice";
import { addToWishlistLocal, removeFromWishlistLocal } from "../slices/wishlistSlice";
import productImg from "../assets/placeholder_product.png";

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
      <div className="block">
        {/* Plain coloured box — no placeholder image */}
        <div className="rounded-2xl aspect-[4/3]" style={{ backgroundColor: "#C8D9B0" }} />
        <div className="mt-3 px-1">
          <p className="font-poppins font-medium text-sm text-gray-800">Our Products</p>
          <p className="font-poppins text-xs text-gray-500 mt-0.5">Rs 123</p>
        </div>
      </div>
    );
  }


  // ── Real product tile ──
  const isWished = wishlistIds.includes(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      await addToCart(product._id);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      toast.success("Added to cart");
    } catch { toast.error("Failed"); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      if (isWished) {
        await removeFromWishlist(product._id);
        dispatch(removeFromWishlistLocal(product._id));
      } else {
        await addToWishlist(product._id);
        dispatch(addToWishlistLocal(product._id));
      }
    } catch { toast.error("Failed"); }
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3]" style={{ backgroundColor: "#C8D9B0" }}>
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Wishlist overlay */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow transition-colors
            ${isWished ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 px-1 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-sm text-gray-800 leading-snug">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            ₹{product.price}
            {product.mrp > product.price && (
              <s className="ml-1 text-gray-400">₹{product.mrp}</s>
            )}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          className="shrink-0 text-white p-2 rounded-full hover:opacity-90 transition-colors"
          style={{ backgroundColor: "#1B5E20" }}
          aria-label="Add to cart"
        >
          <ShoppingCart size={13} />
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;