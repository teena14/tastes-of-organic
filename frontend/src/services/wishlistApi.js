import api from "./api";

// All routes are protected — userId is extracted from JWT token on backend
export const addToWishlist = async (productId) => {
  const res = await api.post("/wishlist/add", { productId });
  return res.data;
};

export const removeFromWishlist = async (productId) => {
  const res = await api.post("/wishlist/remove", { productId });
  return res.data;
};

export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data.data;
};