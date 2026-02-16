import api from "./api";

const USER_ID = "6987971bcb6f4ca73b6abf47";

export const placeOrder = async (shippingAddress) => {
  const res = await api.post("/orders/place", {
    userId: USER_ID,
    shippingAddress
  });

  return res.data;
};