import { apiRequest } from "./apiClient";

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "All") {
      return;
    }

    query.append(key, value);
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const getPublicReports = (params = {}) =>
  apiRequest(`/reports${buildQueryString(params)}`);

export const getPublicItemReports = (params = {}) =>
  apiRequest(`/reports/items${buildQueryString(params)}`);

export const getPublicPersonReports = (params = {}) =>
  apiRequest(`/reports/persons${buildQueryString(params)}`);

export const searchPublicReports = (params = {}) =>
  apiRequest(`/reports/search${buildQueryString(params)}`);

export const getReportById = (id) => apiRequest(`/reports/${id}`);

export const getMyReports = () => apiRequest("/reports/my-reports");

export const createLostItemReport = (formData) =>
  apiRequest("/reports/lost-item", {
    method: "POST",
    body: formData,
  });

export const createFoundItemReport = (formData) =>
  apiRequest("/reports/found-item", {
    method: "POST",
    body: formData,
  });

export const createMissingPersonReport = (formData) =>
  apiRequest("/reports/missing-person", {
    method: "POST",
    body: formData,
  });

export const createFoundPersonReport = (formData) =>
  apiRequest("/reports/found-person", {
    method: "POST",
    body: formData,
  });

export const reportPost = (id, reason) =>
  apiRequest(`/reports/${id}/report-post`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const deleteMyReport = (id) =>
  apiRequest(`/reports/my-reports/${id}`, {
    method: "DELETE",
  });

export const updateMyReportStatus = (id, caseStatus) =>
  apiRequest(`/reports/my-reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ caseStatus }),
  });

export const updateMyReport = (id, payload) =>
  apiRequest(`/reports/my-reports/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
