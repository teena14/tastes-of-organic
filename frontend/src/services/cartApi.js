import api from "./api";
import getUserId from "../utils/getUserId";

export const addToCart = async (productId) => {
  const res = await api.post("/cart/add", {
    userId: getUserId(),
    productId
  });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get(`/cart/${getUserId()}`);
  return res.data.data;
};

export const updateCartQuantity = async (productId, action) => {
  const res = await api.post("/cart/update", {
    userId: getUserId(),
    productId,
    action
  });

  return res.data;
};

export const removeFromCart = async (productId) => {
  const res = await api.post("/cart/remove", {
    userId: getUserId(),
    productId
  });

  return res.data;
};