const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4230/api";

export const getToken = () => localStorage.getItem("lostFoundAuthToken") || "";

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("lostFoundAuthToken", token);
  } else {
    localStorage.removeItem("lostFoundAuthToken");
  }
};

const isFormData = (body) => body instanceof FormData;

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (!isFormData(options.body)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string" ? data : data?.message || "Request failed";

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { API_BASE_URL };
