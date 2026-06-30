import api from "./api";

// --- authApi.js ---
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (name, email, password) => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const googleAuthApi = async (token) => {
  const res = await api.post("/auth/google", { token });
  return res.data;
};

// --- cartApi.js ---
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

// --- orderApi.js ---
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

// --- paymentApi.js ---
export const initiatePhonePePayment = (orderId) =>
    api.post("/payment/initiate", { orderId }).then(r => r.data);

export const checkPaymentStatus = (orderId) =>
    api.get(`/payment/status/${orderId}`).then(r => r.data);

// --- productApi.js ---
export const fetchProducts = async ({ search, category, sort, featured } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category && category !== "ALL") params.category = category;
  if (sort) params.sort = sort;
  if (featured) params.featured = "true";
  const response = await api.get("/products", { params });
  return response.data;
};

// --- subscriptionApi.js ---
export const createSubscription = (payload) =>
    api.post("/subscriptions", payload).then(r => r.data);

export const verifySubscriptionPayment = (payload) =>
    api.post("/subscriptions/verify-payment", payload).then(r => r.data);

export const getMySubscriptions = () =>
    api.get("/subscriptions/mine").then(r => r.data);

export const cancelSubscription = (id) =>
    api.patch(`/subscriptions/${id}/cancel`).then(r => r.data);

// --- userApi.js ---
export const getUserProfile = async () => {
  const res = await api.get("/users/me");
  return res.data.data;
};

// --- wishlistApi.js ---
// All routes are protected — userId is extracted from JWT token on backend
export const addToWishlist = async (productId) => {
  const res = await api.post("/wishlist/add", { productId });
  return res.data;
};

export const removeFromWishlist = async (productId) => {
  const res = await api.post("/wishlist/remove", { productId });
  return res.data;
};

export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data.data;
};

