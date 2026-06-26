import { apiRequest } from "./apiClient";

export const submitContactMessage = (payload) =>
  apiRequest("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getContactMessages = () => apiRequest("/contact");

export const markContactMessageRead = (messageId) =>
  apiRequest(`/contact/${messageId}/read`, {
    method: "PATCH",
  });

export const deleteContactMessage = (messageId) =>
  apiRequest(`/contact/${messageId}`, {
    method: "DELETE",
  });
