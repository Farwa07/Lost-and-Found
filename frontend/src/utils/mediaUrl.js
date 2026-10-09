import { API_BASE_URL } from "../api/apiClient";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

// The backend stores uploaded files as relative paths ("/uploads/x.jpg").
// Older records may still hold an absolute URL with a fixed host/port
// (e.g. "http://localhost:4230/uploads/x.jpg"); those are re-pointed to the
// current API host so images keep working after a deploy or port change.
export const resolveMediaUrl = (value = "") => {
  if (!value) return "";

  const path = String(value);

  if (path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const uploadMatch = path.match(/^(?:https?:\/\/[^/]+)?(\/uploads\/.+)$/);
  if (uploadMatch) {
    return `${API_ORIGIN}${uploadMatch[1]}`;
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
};
