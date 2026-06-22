import { apiRequest } from "./apiClient";

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const getNotifications = (params = {}) =>
  apiRequest(`/notifications${toQueryString(params)}`);

export const getNotificationSummary = () => apiRequest("/notifications/summary");

export const markNotificationAsRead = (id) =>
  apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });

export const deleteNotification = (id) =>
  apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });

export const clearAllNotifications = () =>
  apiRequest("/notifications", {
    method: "DELETE",
  });
