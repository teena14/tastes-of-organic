import { useEffect, useState } from "react";
import { getMyOrders } from "../services/orderApi";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await getMyOrders();
      setOrders(data);
    };

    loadOrders();
  }, []);

  return (
    <div>
      <h1>My Orders</h1>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map(order => (
        <div key={order._id} style={{ marginBottom: "20px" }}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p>Total: ₹{order.total}</p>
          <p>Payment: {order.paymentStatus}</p>
          <p>Status: {order.orderStatus}</p>
          <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

          <div>
            {order.items.map(item => (
              <div key={item.product}>
                {item.name} × {item.quantity}
              </div>
            ))}
          </div>

          <hr />
        </div>
      ))}
    </div>
  );
};

export default Orders;
