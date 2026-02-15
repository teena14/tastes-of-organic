import User from "../models/User.js";

export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyExists = user.wishlist.some(
      id => id.toString() === productId
    );

    if (!alreadyExists) {
      user.wishlist.push(productId);
      await user.save();
    }

    return res.json({
      success: true,
      wishlist: user.wishlist
    });

  } catch (error) {
    console.log(error); // keep this while developing
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== productId
    );

    await user.save();

    return res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("wishlist");

    return res.json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};