import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import api from "../../lib/api";
import {
  clearSession,
  getStoredUser,
  getRefreshToken,
  saveSession,
} from "./auth-storage";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
} from "./auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(
    getStoredUser(),
  );

  async function login(request: LoginRequest): Promise<void> {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      request,
    );

    saveSession(response.data);

    setUser({
      userId: response.data.userId,
      fullName: response.data.fullName,
      email: response.data.email,
      roles: response.data.roles,
    });
  }

  async function logout(): Promise<void> {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } finally {
      clearSession();
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}