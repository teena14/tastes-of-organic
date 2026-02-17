import api from "./api";
import getUserId from "../utils/getUserId";

export const getUserProfile = async () => {
  const res = await api.get(`/users/${getUserId()}`);
  return res.data.data;
};
