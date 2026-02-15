import api from "./api";

const USER_ID = "6987971bcb6f4ca73b6abf47";

export const addToWishlist = async (productId) => {
  const res = await api.post("/wishlist/add", {
    userId: USER_ID,
    productId
  });
  return res.data;
};

export const removeFromWishlist = async (productId) => {
  const res = await api.post("/wishlist/remove", {
    userId: USER_ID,
    productId
  });
  return res.data;
};

export const getWishlist = async () => {
  const res = await api.get(`/wishlist/${USER_ID}`);
  return res.data.data;
};