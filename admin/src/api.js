import axios from "axios";

// VITE_API_URL wins when it is set at build time. Production builds fall back to the deployed API
// (never localhost), and local `npm run dev` falls back to the local server.
const DEPLOYED_API = "https://shopping-cart-1-wmbm.onrender.com";
export const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEPLOYED_API : "http://localhost:4000")).replace(/\/+$/,"");

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

export const errorMessage = (error, fallback = "Something went wrong") =>
  error.response?.data?.message || fallback;

export default api;
