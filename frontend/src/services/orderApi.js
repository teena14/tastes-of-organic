import api from "./api";

export const placeOrder = async (shippingAddress) => {
  const res = await api.post("/orders/place", {
    shippingAddress
  });

  return res.data;
};

export const getMyOrders = async () => {
  const res = await api.get("/orders/user");
  return res.data.data;
};

export const getOrderById = async (orderId) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data.data;
};
