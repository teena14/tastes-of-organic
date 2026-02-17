import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};
