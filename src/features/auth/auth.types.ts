export type AuthResponse = {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
};