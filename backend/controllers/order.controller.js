import User from "../models/User.js";
import Order from "../models/Order.js";

// Place order (creates pending order - cart cleared only on payment verify)
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user._id;

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
        message: "All required shipping address fields must be filled"
      });
    }

    let subtotal = 0;

    const orderItems = user.cart.map(item => {
      const variant = item.product.sizes?.find(v => v.size === item.size);
      const itemPrice = variant ? variant.price : item.product.price;
      
      subtotal += itemPrice * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || "",
        price: itemPrice,
        size: item.size,
        quantity: item.quantity
      };
    });

    const delivery = subtotal >= 500 ? 0 : 50;
    const total = subtotal + delivery;

    // Create order with pending payment status
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      subtotal,
      delivery,
      total,
      paymentMethod: "online",
      paymentStatus: "pending"
    });

    // Save shipping address to user profile for autofill next time
    user.address = shippingAddress;
    await user.save();

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};
