import { apiRequest } from "./apiClient";

export const submitContactMessage = (payload) =>
  apiRequest("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });