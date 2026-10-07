import type { AuthResponse, AuthUser } from "./auth.types";

const accessTokenKey = "smartflow_access_token";
const refreshTokenKey = "smartflow_refresh_token";
const userKey = "smartflow_user";

export function saveSession(auth: AuthResponse): void {
  localStorage.setItem(accessTokenKey, auth.accessToken);
  localStorage.setItem(refreshTokenKey, auth.refreshToken);

  const user: AuthUser = {
    userId: auth.userId,
    fullName: auth.fullName,
    email: auth.email,
    roles: auth.roles,
  };

  localStorage.setItem(userKey, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(accessTokenKey);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(refreshTokenKey);
}

export function getStoredUser(): AuthUser | null {
  const value = localStorage.getItem(userKey);

  return value ? (JSON.parse(value) as AuthUser) : null;
}

export function clearSession(): void {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(userKey);
}