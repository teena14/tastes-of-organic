import api from "./api";

export const createRazorpayOrder = (amount) =>
    api.post("/payment/create-order", { amount }).then(r => r.data);

export const verifyPayment = (payload) =>
    api.post("/payment/verify", payload).then(r => r.data);
