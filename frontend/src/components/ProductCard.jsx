import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart, getCart } from "../services/cartApi";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";
import { setCart } from "../slices/cartSlice";
import { addToWishlistLocal, removeFromWishlistLocal } from "../slices/wishlistSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const wishlistIds = useSelector(s => s.wishlist.productIds);
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
    <div style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "8px" }}>
      <Link to={`/product/${product._id}`}>
        <img src={product.images?.[0]} alt={product.name} width="100" height="100" style={{ objectFit: "cover" }} />
        <p><strong>{product.name}</strong></p>
        <p>₹{product.price} {product.mrp > product.price && <s>₹{product.mrp}</s>}</p>
      </Link>
      <button onClick={handleAddToCart}>Add to Cart</button>{" "}
      <button onClick={handleWishlist}>{isWished ? "♥ Wishlisted" : "♡ Wishlist"}</button>
    </div>
  );
};

export default ProductCard;