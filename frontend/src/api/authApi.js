import { apiRequest } from "./apiClient";

export const sendSignupOtp = (payload) =>
  apiRequest("/auth/send-signup-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifySignupOtp = (payload) =>
  apiRequest("/auth/verify-signup-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const forgotPassword = (payload) =>
  apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resetPassword = (token, payload) =>
  apiRequest(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getProfile = () => apiRequest("/auth/profile");

export const updateProfile = (payload) =>
  apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const changePassword = (payload) =>
  apiRequest("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const updateProfileImage = (formData) =>
  apiRequest("/auth/profile/image", {
    method: "PUT",
    body: formData,
  });
  
export const deleteMyAccount = () =>
  apiRequest("/auth/me", {
    method: "DELETE",
  });