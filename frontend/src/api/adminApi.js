import { apiRequest } from "./apiClient";

export const getAdminReports = () => apiRequest("/admin/reports");
export const verifyAdminReport = (id) => apiRequest(`/admin/reports/${id}/verify`, { method: "PATCH" });
export const rejectAdminReport = (id) => apiRequest(`/admin/reports/${id}/reject`, { method: "PATCH" });
export const updateAdminReportStatus = (id, status) =>
  apiRequest(`/admin/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const updateAdminReportCaseStatus = (id, caseStatus) =>
  apiRequest(`/admin/reports/${id}/case-status`, {
    method: "PATCH",
    body: JSON.stringify({ caseStatus }),
  });
export const clearAdminReportFlags = (id) =>
  apiRequest(`/admin/reports/${id}/flags/clear`, { method: "PATCH" });
export const deleteAdminReport = (id) => apiRequest(`/admin/reports/${id}`, { method: "DELETE" });
export const sendReportAlert = (id, payload) =>
  apiRequest(`/admin/reports/${id}/alert`, { method: "POST", body: JSON.stringify(payload) });
export const sendGeneralAlert = (payload) =>
  apiRequest("/admin/alerts", { method: "POST", body: JSON.stringify(payload) });

export const getAdminUsers = () => apiRequest("/admin/users");
export const blockAdminUser = (id) => apiRequest(`/admin/users/${id}/block`, { method: "PATCH" });
export const unblockAdminUser = (id) => apiRequest(`/admin/users/${id}/unblock`, { method: "PATCH" });
export const deleteAdminUser = (id) => apiRequest(`/admin/users/${id}`, { method: "DELETE" });

export const getMatchSuggestions = () => apiRequest("/admin/matches/suggestions");
export const confirmMatchSuggestion = (matchId) => apiRequest(`/admin/matches/${matchId}/confirm`, { method: "POST" });
export const dismissMatchSuggestion = (matchId) => apiRequest(`/admin/matches/${matchId}/dismiss`, { method: "POST" });
export const getAdminLogs = () => apiRequest("/admin/logs");
