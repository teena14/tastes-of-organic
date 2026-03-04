import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getCart, updateCartQuantity, removeFromCart } from "../services/cartApi";
import { setCart } from "../slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, delivery, total } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (!isAuthenticated) return;
    getCart().then(d => { if (d) dispatch(setCart(d)); }).catch(() => { });
  }, [isAuthenticated, dispatch]);

  const refresh = async () => {
    const d = await getCart();
    if (d) dispatch(setCart(d));
  };

  if (!isAuthenticated) return (
    <div style={{ padding: "16px" }}>
      <p>Please <Link to="/login">login</Link> to view your cart.</p>
    </div>
  );

  return (
    <div style={{ padding: "16px" }}>
      <h2>Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty. <Link to="/shop">Shop now</Link></p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.product._id}>
                  <td><Link to={`/product/${item.product._id}`}>{item.product.name}</Link></td>
                  <td>₹{item.product.price}</td>
                  <td>
                    <button onClick={async () => { await updateCartQuantity(item.product._id, "decrease"); await refresh(); }}>-</button>
                    {" "}{item.quantity}{" "}
                    <button onClick={async () => { await updateCartQuantity(item.product._id, "increase"); await refresh(); }}>+</button>
                  </td>
                  <td>₹{item.product.price * item.quantity}</td>
                  <td>
                    <button onClick={async () => { await removeFromCart(item.product._id); await refresh(); toast.success("Removed"); }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <p>Subtotal: ₹{subtotal}</p>
          <p>Delivery: {delivery === 0 ? "FREE" : `₹${delivery}`}</p>
          <p><strong>Total: ₹{total}</strong></p>
          <br />
          <button onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );
};

export default Cart;