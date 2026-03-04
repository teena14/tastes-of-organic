import api from "./api";

export const getUserProfile = async () => {
  const res = await api.get("/users/me");
  return res.data.data;
};
