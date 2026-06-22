import { apiRequest } from "./apiClient";

export const getMatchById = (matchId) => apiRequest(`/matches/${matchId}`);

export const getMatchByReportId = (reportId) =>
  apiRequest(`/matches/by-report/${reportId}`);
