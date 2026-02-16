import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCart } from "../services/cartApi";
import { updateCartQuantity } from "../services/cartApi";
import { removeFromCart } from "../services/cartApi";

const Cart = () => {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [total, setTotal] = useState(0);

  const location = useLocation();

  useEffect(() => {
    const loadCart = async () => {
      const data = await getCart();
      setItems(data.items);
      setSubtotal(data.subtotal);
      setDelivery(data.delivery);
      setTotal(data.total);
    };

    loadCart();
  }, [location]);

  return (
    <div>
      <h1>Cart</h1>

      {items.map((item) => (
        <div key={item.product._id} style={{ marginBottom: "15px" }}>
          <p>{item.product.name}</p>

          <button
            onClick={async () => {
              await updateCartQuantity(item.product._id, "decrease");
              const data = await getCart();
              setItems(data.items);
              setSubtotal(data.subtotal);
              setDelivery(data.delivery);
              setTotal(data.total);
            }}
          >
            -
          </button>

          <span style={{ margin: "0 10px" }}>{item.quantity}</span>

          <button
            onClick={async () => {
              await updateCartQuantity(item.product._id, "increase");
              const data = await getCart();
              setItems(data.items);
              setSubtotal(data.subtotal);
              setDelivery(data.delivery);
              setTotal(data.total);
            }}
          >
            +
          </button>

          <button
            onClick={async () => {
              await removeFromCart(item.product._id);
              const data = await getCart();
              setItems(data.items);
              setSubtotal(data.subtotal);
              setDelivery(data.delivery);
              setTotal(data.total);
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <hr />

      <h3>Subtotal: ₹{subtotal}</h3>
      <h3>Delivery: ₹{delivery}</h3>
      <h2>Total: ₹{total}</h2>
    </div>
  );
};

export default Cart;