import User from "../models/User.js";
import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    const user = await User.findById(userId).populate("cart.product");

    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;

    const orderItems = user.cart.map(item => {
      subtotal += item.product.price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      };
    });

    const delivery = subtotal >= 500 ? 0 : 50;
    const total = subtotal + delivery;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      subtotal,
      delivery,
      total,
      paymentMethod: "online"
    });

    // clear cart
    user.cart = [];
    await user.save();

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};