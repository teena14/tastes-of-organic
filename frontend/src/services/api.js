import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ── Request interceptor: attach auth token ───────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor: handle 401 (session expired) ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
