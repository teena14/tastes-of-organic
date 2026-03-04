import api from "./api";

export const addToCart = async (productId) => {
  const res = await api.post("/cart/add", {
    productId
  });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data.data;
};

export const updateCartQuantity = async (productId, action) => {
  const res = await api.post("/cart/update", {
    productId,
    action
  });

  return res.data;
};

export const removeFromCart = async (productId) => {
  const res = await api.post("/cart/remove", {
    productId
  });

  return res.data;
};