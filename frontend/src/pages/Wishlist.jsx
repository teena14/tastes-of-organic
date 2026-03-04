import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { getWishlist, removeFromWishlist } from "../services/wishlistApi";
import { addToCart, getCart } from "../services/cartApi";
import { setWishlist, removeFromWishlistLocal } from "../slices/wishlistSlice";
import { setCart } from "../slices/cartSlice";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    getWishlist()
      .then(d => { setItems(d || []); dispatch(setWishlist(d || [])); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id);
      dispatch(removeFromWishlistLocal(id));
      setItems(prev => prev.filter(p => p._id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed"); }
  };

  const handleAddToCart = async (id) => {
    try {
      await addToCart(id);
      const data = await getCart();
      if (data) dispatch(setCart(data));
      toast.success("Added to cart");
    } catch { toast.error("Failed"); }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>Wishlist</h2>
      {items.length === 0 ? (
        <p>Wishlist empty. <Link to="/shop">Browse products</Link></p>
      ) : (
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td><Link to={`/product/${item._id}`}>{item.name}</Link></td>
                <td>₹{item.price}</td>
                <td>
                  <button onClick={() => handleAddToCart(item._id)}>Add to Cart</button>{" "}
                  <button onClick={() => handleRemove(item._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Wishlist;