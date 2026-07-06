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
];

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    const isNoAuthEndpoint = NO_AUTH_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isNoAuthEndpoint) {
      const token = Cookies.get("accessToken");
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
      originalRequest._retry = true;
      const refreshToken = Cookies.get("refreshToken");
      
      if (!refreshToken) {
        Cookies.remove("accessToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const refreshResponse = await axios.post(`${apiUrl}/api/v1/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data.access_token || refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refresh_token || refreshResponse.data.refreshToken;

        if (newAccessToken) {
          Cookies.set("accessToken", newAccessToken, { expires: 2 / 24 }); // 2 hours
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        if (newRefreshToken) {
          Cookies.set("refreshToken", newRefreshToken, { expires: 7 }); // 7 days
        }

        return httpClient(originalRequest);
      } catch (refreshError) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export default httpClient;
