import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderApi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(d => setOrders(d || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet. <Link to="/shop">Shop now</Link></p>
      ) : (
        <table>
          <thead>
            <tr><th>Order ID</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th>Items</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td style={{ fontFamily: "monospace" }}>#{o._id.slice(-8).toUpperCase()}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>₹{o.total}</td>
                <td>{o.paymentStatus}</td>
                <td>{o.orderStatus}</td>
                <td>{o.items.map(i => `${i.name} ×${i.quantity}`).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
