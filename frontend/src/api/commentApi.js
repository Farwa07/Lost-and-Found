import { apiRequest } from "./apiClient";

export const getReportComments = (reportId) =>
  apiRequest(`/comments/reports/${reportId}/comments`);

export const addReportComment = (reportId, text) =>
  apiRequest(`/comments/reports/${reportId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

export const addCommentReply = (commentId, text) =>
  apiRequest(`/comments/reports/comments/${commentId}/replies`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

export const deleteReportComment = (commentId) =>
  apiRequest(`/comments/reports/comments/${commentId}`, {
    method: "DELETE",
  });

export const deleteCommentReply = (commentId, replyId) =>
  apiRequest(`/comments/reports/comments/${commentId}/replies/${replyId}`, {
    method: "DELETE",
  });
