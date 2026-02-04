import api from "./api";

export const fetchProducts = async (category) => {
  const params = category ? { category } : {};
  const response = await api.get("/products", { params });
  return response.data;
};
