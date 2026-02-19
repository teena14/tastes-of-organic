import { useState, useEffect } from "react";
import { getCart } from "../services/cartApi";
import { placeOrder } from "../services/orderApi";
import { getUserProfile } from "../services/userApi";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cartData = await getCart();

        if (!cartData || cartData.items.length === 0) {
          navigate("/cart");
          return;
        }

        setCart(cartData);

        const user = await getUserProfile();
        if (user?.address) {
          setForm(user.address);
        }
      } catch (err) {
        console.error("Checkout load failed:", err);
      }
    };

    loadData();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.phone ||
      !form.addressLine1 ||
      !form.city ||
      !form.state ||
      !form.postalCode
    ) {
      alert("Please fill all required address fields.");
      return;
    }

    const result = await placeOrder(form);
    navigate(`/order-success/${result.order._id}`);
  };

  if (!cart) return <p>Loading...</p>;

  return (
    <div>
      <h1>Checkout</h1>

      <h3>Order Summary</h3>
      <p>Subtotal: ₹{cart.subtotal}</p>
      <p>Delivery: ₹{cart.delivery}</p>
      <h2>Total: ₹{cart.total}</h2>

      <h3>Shipping Details</h3>

      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
      />

      <input
        name="addressLine1"
        placeholder="Address Line 1"
        value={form.addressLine1}
        onChange={handleChange}
      />

      <input
        name="addressLine2"
        placeholder="Address Line 2"
        value={form.addressLine2}
        onChange={handleChange}
      />

      <input
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
      />

      <input
        name="state"
        placeholder="State"
        value={form.state}
        onChange={handleChange}
      />

      <input
        name="postalCode"
        placeholder="Postal Code"
        value={form.postalCode}
        onChange={handleChange}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Place Order
      </button>
    </div>
  );
};

export default Checkout;
