import api from "./api";

export const initiatePhonePePayment = (orderId) =>
    api.post("/payment/initiate", { orderId }).then(r => r.data);

export const checkPaymentStatus = (orderId) =>
    api.get(`/payment/status/${orderId}`).then(r => r.data);
