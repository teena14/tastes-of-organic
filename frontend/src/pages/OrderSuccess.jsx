import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../services/orderApi";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      const data = await getOrderById(orderId);
      setOrder(data);
    };

    loadOrder();
  }, [orderId]);

  if (!order) return <p>Loading order...</p>;

  return (
    <div>
      <h1>Order Placed Successfully</h1>

      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Total:</strong> ₹{order.total}</p>
      <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
      <p><strong>Order Status:</strong> {order.orderStatus}</p>

      <h3>Items</h3>
      {order.items.map(item => (
        <div key={item.product}>
          {item.name} × {item.quantity}
        </div>
      ))}
    </div>
  );
};

export default OrderSuccess;
