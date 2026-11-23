import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL: API_URL });

// attach the admin token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// expired / invalid token -> tell the app to log out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("admin-logout"));
    }
    return Promise.reject(error);
  }
);

// Turns a failed request into something you can act on.
export const errorMessage = (error, fallback = "Something went wrong") => {
  const serverMessage = error.response?.data?.message;
  if (serverMessage) return serverMessage;
  if (error.response?.status === 404) {
    return "The server has no such endpoint (404). The backend may be out of date, or VITE_API_URL points at the wrong service.";
  }
  if (error.response?.status >= 500) return "The server hit an error. Try again in a moment.";
  if (error.request && !error.response) {
    return `Cannot reach the server at ${API_URL}. If this is a fresh deploy it may still be waking up.`;
  }
  return fallback;
};

export default api;
