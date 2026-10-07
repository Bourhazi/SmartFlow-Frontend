import axios from "axios";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "../features/auth/auth-storage";
import type { AuthResponse } from "../features/auth/auth.types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshRequest: Promise<AuthResponse> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthenticationRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthenticationRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error("Refresh token is missing.");
      }

      refreshRequest ??= axios
        .post<AuthResponse>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
        )
        .then((response) => response.data)
        .finally(() => {
          refreshRequest = null;
        });

      const session = await refreshRequest;

      saveSession(session);

      originalRequest.headers.Authorization =
        `Bearer ${session.accessToken}`;

      return api(originalRequest);
    } catch {
      clearSession();
      window.location.assign("/login");

      return Promise.reject(error);
    }
  },
);

export default api;