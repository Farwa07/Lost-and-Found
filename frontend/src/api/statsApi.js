import { apiRequest } from "./apiClient";

export const getStatistics = ({ type = "persons", city = "All Cities", month = "All Months" } = {}) => {
  const params = new URLSearchParams();

  params.set("type", type);

  if (city && city !== "All Cities") {
    params.set("city", city);
  }

  if (month && month !== "All Months") {
    params.set("month", month);
  }

  const queryString = params.toString();

  return apiRequest(`/stats${queryString ? `?${queryString}` : ""}`);
};
