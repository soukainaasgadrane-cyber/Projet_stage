import api from "./axios";

export const getDashboard = (year = 2026) => {
  return api.get(`/dashboard?year=${year}`);
};