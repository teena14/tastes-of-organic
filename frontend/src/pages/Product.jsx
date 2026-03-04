import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../services/api";
import { addToCart, getCart } from "../services/cartApi";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";
import { setCart } from "../slices/cartSlice";
import { addToWishlistLocal, removeFromWishlistLocal } from "../slices/wishlistSlice";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const wishlistIds = useSelector(s => s.wishlist.productIds);
  const isWished = product ? wishlistIds.includes(product._id) : false;

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.data))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      for (let i = 0; i < qty; i++) await addToCart(product._id);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      toast.success("Added to cart");
    } catch { toast.error("Failed"); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error("Please login"); return; }
    try {
      if (isWished) {
        await removeFromWishlist(product._id);
        dispatch(removeFromWishlistLocal(product._id));
      } else {
        await addToWishlist(product._id);
        dispatch(addToWishlistLocal(product._id));
      }
      toast.success(isWished ? "Removed from wishlist" : "Added to wishlist");
    } catch { toast.error("Failed"); }
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Not found. <Link to="/shop">Back to shop</Link></p>;

  return (
    <div style={{ padding: "16px" }}>
      <Link to="/shop">← Back to Shop</Link>
      <h2>{product.name}</h2>
      <p><strong>Category:</strong> {product.category}</p>
      {product.images?.[0] && <img src={product.images[0]} alt={product.name} width="200" />}
      <p><strong>Price:</strong> ₹{product.price} {product.mrp > product.price && <><s>₹{product.mrp}</s></>}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p>{product.description}</p>
      <br />
      <label>Qty: <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} style={{ width: "60px" }} /></label>{" "}
      <button onClick={handleAddToCart}>Add to Cart</button>{" "}
      <button onClick={handleWishlist}>{isWished ? "♥ Remove Wishlist" : "♡ Add Wishlist"}</button>
      {product.isSubscriptionAllowed && (
        <p><Link to="/subscription">Available on subscription — save up to 20%</Link></p>
      )}
    </div>
  );
};

export default Product;