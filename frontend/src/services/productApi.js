import api from "./api";

export const fetchProducts = async ({ search, category, sort, featured } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category && category !== "ALL") params.category = category;
  if (sort) params.sort = sort;
  if (featured) params.featured = "true";
  const response = await api.get("/products", { params });
  return response.data;
};
