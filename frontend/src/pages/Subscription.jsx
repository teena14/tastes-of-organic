import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { fetchProducts } from "../services/productApi";
import { createSubscription, verifySubscriptionPayment } from "../services/subscriptionApi";
import { selectPlan, addSubscriptionItem, updateSubscriptionItem, clearSubscription } from "../slices/subscriptionSlice";

const PLANS = [
  { months: 3, discount: 10 },
  { months: 6, discount: 15 },
  { months: 12, discount: 20 }
];

const Subscription = () => {
  const [products, setProducts] = useState([]);
  const [paying, setPaying] = useState(false);
  const dispatch = useDispatch();
  const { selectedPlan, items } = useSelector(s => s.subscription);
  const { isAuthenticated, user } = useSelector(s => s.auth);

  useEffect(() => {
    fetchProducts({}).then(r => setProducts((r.data || []).filter(p => p.isSubscriptionAllowed))).catch(() => { });
  }, []);

  const monthlyTotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = selectedPlan ? PLANS.find(p => p.months === selectedPlan)?.discount : 0;
  const discountedMonthly = monthlyTotal * (1 - (discount || 0) / 100);
  const upfrontTotal = selectedPlan ? discountedMonthly * selectedPlan : 0;

  const handlePay = async () => {
    if (!isAuthenticated) { toast.error("Please login"); return; }
    if (!selectedPlan) { toast.error("Select a plan"); return; }
    if (items.length === 0) { toast.error("Add a product"); return; }
    try {
      setPaying(true);
      const res = await createSubscription({
        products: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        durationMonths: selectedPlan
      });
      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        name: "Tastes of Organic",
        order_id: res.razorpayOrderId,
        handler: async (response) => {
          try {
            await verifySubscriptionPayment({ ...response, subscriptionId: res.subscriptionId });
            dispatch(clearSubscription());
            toast.success("Subscription activated!");
          } catch { toast.error("Verification failed"); }
          finally { setPaying(false); }
        },
        modal: { ondismiss: () => { toast("Cancelled"); setPaying(false); } }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
      setPaying(false);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Subscription Plans</h2>
      <p>Select a plan to save on your monthly order:</p>
      <div>
        {PLANS.map(p => (
          <label key={p.months} style={{ marginRight: "16px" }}>
            <input
              type="radio"
              name="plan"
              value={p.months}
              checked={selectedPlan === p.months}
              onChange={() => dispatch(selectPlan(p.months))}
            />{" "}
            {p.months} Months — {p.discount}% off
          </label>
        ))}
      </div>

      <hr />
      <h3>Choose Products</h3>
      {products.length === 0 ? (
        <p>No subscription products available.</p>
      ) : (
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Qty in Box</th></tr></thead>
          <tbody>
            {products.map(p => {
              const cartItem = items.find(i => i.product._id === p._id);
              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>
                    {cartItem ? (
                      <>
                        <button onClick={() => dispatch(updateSubscriptionItem({ productId: p._id, quantity: cartItem.quantity - 1 }))}>-</button>
                        {" "}{cartItem.quantity}{" "}
                        <button onClick={() => dispatch(updateSubscriptionItem({ productId: p._id, quantity: cartItem.quantity + 1 }))}>+</button>
                      </>
                    ) : (
                      <button onClick={() => {
                        if (!selectedPlan) { toast.error("Select a plan first"); return; }
                        dispatch(addSubscriptionItem(p));
                      }}>Add</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <hr />
      <h3>Summary</h3>
      {items.length === 0 ? <p>No items added.</p> : (
        <ul>
          {items.map(i => <li key={i.product._id}>{i.product.name} × {i.quantity} = ₹{i.product.price * i.quantity}/month</li>)}
        </ul>
      )}
      <p>Monthly total: ₹{monthlyTotal}</p>
      {selectedPlan && <p>After {discount}% discount: ₹{discountedMonthly.toFixed(0)}/month</p>}
      <p><strong>Upfront total ({selectedPlan || "?"} months): ₹{upfrontTotal.toFixed(0)}</strong></p>
      <br />
      <button onClick={handlePay} disabled={paying || !selectedPlan || items.length === 0}>
        {paying ? "Processing..." : "Pay with Razorpay"}
      </button>
      {!isAuthenticated && <p><Link to="/login">Login to subscribe</Link></p>}
    </div>
  );
};

export default Subscription;
