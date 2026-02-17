import { useState, useEffect } from "react";
import { getCart } from "../services/cartApi";
import { placeOrder } from "../services/orderApi";
import { getUserProfile } from "../services/userApi";

const Checkout = () => {
  const [cart, setCart] = useState(null);

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
    const loadCart = async () => {
      const data = await getCart();
      setCart(data);
    };
    loadCart();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const cartData = await getCart();
      setCart(cartData);

      const user = await getUserProfile();
      if (user.address) {
        setForm(user.address);
      }
    };

    loadData();
  }, []);

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

    await placeOrder(form);
    alert("Order placed successfully");
    window.location.href = "/orders";
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

      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <input name="phone" placeholder="Phone Number" onChange={handleChange} />
      <input name="addressLine1" placeholder="Address Line 1" onChange={handleChange} />
      <input name="addressLine2" placeholder="Address Line 2" onChange={handleChange} />
      <input name="city" placeholder="City" onChange={handleChange} />
      <input name="state" placeholder="State" onChange={handleChange} />
      <input name="postalCode" placeholder="Postal Code" onChange={handleChange} />

      <br /><br />

      <button onClick={handleSubmit}>
        Place Order
      </button>
    </div>
  );
};

export default Checkout;