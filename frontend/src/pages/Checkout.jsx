import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { getCart } from "../services/cartApi";
import { placeOrder } from "../services/orderApi";
import { getUserProfile } from "../services/userApi";
import { createRazorpayOrder, verifyPayment } from "../services/paymentApi";
import { clearCart } from "../slices/cartSlice";

const FIELDS = ["name", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode"];

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "" });
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    const load = async () => {
      try {
        const cartData = await getCart();
        if (!cartData || cartData.items.length === 0) { navigate("/cart"); return; }
        setCart(cartData);
        const profile = await getUserProfile();
        if (profile?.address?.name) setForm(profile.address);
      } catch { navigate("/cart"); }
    };
    load();
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePayment = async () => {
    const required = ["name", "phone", "addressLine1", "city", "state", "postalCode"];
    if (!required.every(f => form[f]?.trim())) { toast.error("Fill required fields"); return; }
    try {
      setPlacing(true);
      const orderRes = await placeOrder(form);
      const orderId = orderRes.order._id;
      const rzpRes = await createRazorpayOrder(orderRes.order.total * 100);

      const options = {
        key: rzpRes.keyId,
        amount: rzpRes.amount,
        currency: rzpRes.currency,
        name: "Tastes of Organic",
        order_id: rzpRes.razorpayOrderId,
        prefill: { name: form.name, contact: form.phone, email: user?.email || "" },
        handler: async (response) => {
          try {
            await verifyPayment({ ...response, orderId });
            dispatch(clearCart());
            toast.success("Payment successful!");
            navigate(`/order-success/${orderId}`);
          } catch { toast.error("Payment verification failed"); }
        },
        modal: { ondismiss: () => { toast("Payment cancelled"); setPlacing(false); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
      setPlacing(false);
    }
  };

  if (!cart) return <p>Loading...</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>Checkout</h2>

      <h3>Shipping Details</h3>
      {FIELDS.map(f => (
        <div key={f}>
          <label>{f}{f !== "addressLine2" ? " *" : ""}:</label>
          <input name={f} value={form[f]} onChange={handleChange} style={{ width: "300px" }} />
        </div>
      ))}

      <br />
      <h3>Order Summary</h3>
      <table>
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>
          {cart.items.map(item => (
            <tr key={item.product._id}>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.product.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Subtotal: ₹{cart.subtotal} | Delivery: {cart.delivery === 0 ? "FREE" : `₹${cart.delivery}`} | <strong>Total: ₹{cart.total}</strong></p>
      <br />
      <button onClick={handlePayment} disabled={placing}>
        {placing ? "Processing..." : `Pay ₹${cart.total} via Razorpay`}
      </button>
    </div>
  );
};

export default Checkout;
