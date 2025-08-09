import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Endpoints that should NOT send Authorization header or trigger refresh logic
const AUTH_PUBLIC_ENDPOINTS = [
  "/api/token/",
  "/api/token/refresh/",
  "/api/user/register/",
];

// Request: attach token (except for auth/public endpoints)
api.interceptors.request.use(
  (config) => {
    const isPublicAuthEndpoint = AUTH_PUBLIC_ENDPOINTS.some((u) =>
      (config.url || "").endsWith(u)
    );

    if (!isPublicAuthEndpoint) {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response: auto-refresh token if expired (skip for auth/public endpoints)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    const isPublicAuthEndpoint = AUTH_PUBLIC_ENDPOINTS.some((u) =>
      (originalRequest.url || "").endsWith(u)
    );

    // If 401 and not already retried, and not on auth/public endpoints
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        localStorage.setItem(ACCESS_TOKEN, newAccess);

        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh failed — force logout
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
