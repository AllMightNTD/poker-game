import axios from "axios";
import Cookies from "js-cookie";

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Danh sách các endpoints không cần truyền Bearer token
const NO_AUTH_ENDPOINTS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/verify-otp",
  "/api/v1/auth/resend-otp",
  "/api/v1/admin/login",
];

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    const isNoAuthEndpoint = NO_AUTH_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isNoAuthEndpoint) {
      const isAdminApi =
        config.url?.includes("/api/v1/admin") ||
        config.url?.includes("/admin") ||
        config.url?.includes("/api/v1/users");
      const token = isAdminApi ? Cookies.get("admin_access_token") : Cookies.get("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
httpClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const isNoAuthEndpoint = NO_AUTH_ENDPOINTS.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    if (err.response?.status === 401 && !isNoAuthEndpoint && !originalRequest._retry) {
      const isAdminApi =
        originalRequest?.url?.includes("/api/v1/admin") ||
        originalRequest?.url?.includes("/admin") ||
        originalRequest?.url?.includes("/api/v1/users");

      originalRequest._retry = true;

      if (isAdminApi) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const refreshResponse = await axios.post(
            `${apiUrl}/api/v1/admin/refresh-token`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = refreshResponse.data.admin_access_token;

          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return httpClient(originalRequest);
        } catch (refreshError) {
          Cookies.remove("admin_access_token", { path: "/" });
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith("/backstage/login")) {
              window.location.href = "/backstage/login";
            }
          }
          return Promise.reject(refreshError);
        }
      } else {
        // --- Player Refresh Token flow (HttpOnly) ---
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const refreshResponse = await axios.post(
            `${apiUrl}/api/v1/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = refreshResponse.data.access_token || refreshResponse.data.accessToken;

          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return httpClient(originalRequest);
        } catch (refreshError) {
          Cookies.remove("accessToken", { path: "/" });
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith("/login") && 
                !currentPath.startsWith("/register") && 
                !currentPath.startsWith("/forgot-password") && 
                !currentPath.startsWith("/backstage")) {
              window.location.href = "/login";
            }
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(err);
  }
);

export default httpClient;
