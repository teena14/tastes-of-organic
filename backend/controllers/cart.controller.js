import User from "../models/User.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      item => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({
        product: productId,
        size,
        quantity: 1
      });
    }

    await user.save();

    return res.json({
      success: true,
      cart: user.cart
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      item => !(item.product.toString() === productId && item.size === size)
    );

    await user.save();

    return res.json({
      success: true,
      cart: user.cart
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let subtotal = 0;
    let totalItems = 0;

    user.cart.forEach(item => {
      if (!item.product) return;
      const variant = item.product.sizes?.find(v => v.size === item.size);
      const itemPrice = variant ? variant.price : item.product.price;
      subtotal += itemPrice * item.quantity;
      totalItems += item.quantity;
    });

    user.cart = user.cart.filter(item => item.product);

    let delivery = subtotal >= 500 || subtotal === 0 ? 0 : 50;

    let total = subtotal + delivery;

    return res.json({
      success: true,
      data: {
        items: user.cart,
        subtotal,
        delivery,
        total,
        totalItems
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size, action } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const item = user.cart.find(
      item => item.product.toString() === productId && item.size === size
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (action === "increase") {
      item.quantity += 1;
    }

    if (action === "decrease") {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        user.cart = user.cart.filter(
          i => !(i.product.toString() === productId && i.size === size)
        );
      }
    }

    await user.save();

    return res.json({
      success: true,
      cart: user.cart
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};