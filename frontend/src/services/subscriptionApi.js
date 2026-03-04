import api from "./api";

export const createSubscription = (payload) =>
    api.post("/subscriptions", payload).then(r => r.data);

export const verifySubscriptionPayment = (payload) =>
    api.post("/subscriptions/verify-payment", payload).then(r => r.data);

export const getMySubscriptions = () =>
    api.get("/subscriptions/mine").then(r => r.data);

export const cancelSubscription = (id) =>
    api.patch(`/subscriptions/${id}/cancel`).then(r => r.data);
