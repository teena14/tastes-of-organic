import User from "../models/User.js";
import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    const user = await User.findById(userId).populate("cart.product");

    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        message: "Shipping address is required"
      });
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

    user.address = shippingAddress;
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

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

