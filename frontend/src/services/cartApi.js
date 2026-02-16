import api from "./api";

const USER_ID = "6987971bcb6f4ca73b6abf47";

export const addToCart = async (productId) => {
  const res = await api.post("/cart/add", {
    userId: USER_ID,
    productId
  });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get(`/cart/${USER_ID}`);
  return res.data.data;
};

export const updateCartQuantity = async (productId, action) => {
  const res = await api.post("/cart/update", {
    userId: USER_ID,
    productId,
    action
  });

  return res.data;
};

export const removeFromCart = async (productId) => {
  const res = await api.post("/cart/remove", {
    userId: USER_ID,
    productId
  });

  return res.data;
};