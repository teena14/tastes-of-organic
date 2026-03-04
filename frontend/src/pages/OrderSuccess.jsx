import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/orderApi";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId).then(d => setOrder(d)).catch(() => { }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found. <Link to="/orders">My Orders</Link></p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>✅ Order Placed Successfully</h2>
      <p>Order ID: <strong style={{ fontFamily: "monospace" }}>#{order._id.slice(-8).toUpperCase()}</strong></p>
      <p>Total: ₹{order.total}</p>
      <p>Payment: {order.paymentStatus}</p>
      <p>Status: {order.orderStatus}</p>
      <h3>Items</h3>
      <ul>
        {order.items.map((item, i) => (
          <li key={i}>{item.name} × {item.quantity} — ₹{item.price}</li>
        ))}
      </ul>
      <h3>Shipping Address</h3>
      <p>{order.shippingAddress.name}, {order.shippingAddress.phone}</p>
      <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}</p>
      <br />
      <Link to="/orders">View All Orders</Link> | <Link to="/shop">Continue Shopping</Link>
    </div>
  );
};

export default OrderSuccess;
