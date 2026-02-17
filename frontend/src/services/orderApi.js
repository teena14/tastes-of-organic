import api from "./api";
import getUserId from "../utils/getUserId";

export const placeOrder = async (shippingAddress) => {
  const res = await api.post("/orders/place", {
    userId: getUserId(),
    shippingAddress
  });

  return res.data;
};