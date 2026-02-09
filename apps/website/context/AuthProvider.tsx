"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  getAuthToken,
  getStoredUser,
  setAuthStorage,
  clearAuthToken,
  type AuthUser,
} from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isWholesaler: boolean; // true when logged in as approved wholesaler
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; code?: string }>;
  registerCustomer: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  registerWholesaler: (body: {
    email: string;
    password: string;
    name: string;
    firmName: string;
    city: string;
    visitingCardImage: string;
    mobNumber: string;
    gstCertificateFiles: string[];
    businessName?: string;
    gstNo?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isWholesaler = useMemo(
    () => Boolean(user?.role === "wholesaler" && user?.approvalStatus === "approved"),
    [user]
  );

  const refreshUser = useCallback(async () => {
    const t = getAuthToken();
    if (!t) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.auth.me(t);
      if (res.success && res.data?.user) {
        const u = res.data.user as AuthUser;
        setUser(u);
        setToken(t);
        setAuthStorage(t, u);
      } else {
        clearAuthToken();
        setUser(null);
        setToken(null);
      }
    } catch {
      clearAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = getAuthToken();
    const storedUser = getStoredUser();
    if (t && storedUser) {
      setToken(t);
      setUser(storedUser);
      // Optionally validate token in background
      api.auth.me(t).then((res) => {
        if (res.success && res.data?.user) {
          const u = res.data.user as AuthUser;
          setUser(u);
          setAuthStorage(t, u);
        } else {
          clearAuthToken();
          setUser(null);
          setToken(null);
        }
      }).catch(() => {
        clearAuthToken();
        setUser(null);
        setToken(null);
      }).finally(() => setIsLoading(false));
    } else {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login({ email, password });
      if (res.success && res.data?.user && res.data?.token) {
        const u = res.data.user as AuthUser;
        setUser(u);
        setToken(res.data.token);
        setAuthStorage(res.data.token, u);
        return { ok: true };
      }
      return {
        ok: false,
        error: (res as { error?: string }).error || "Login failed",
        code: (res as { code?: string }).code,
      };
    },
    []
  );

  const registerCustomer = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await api.auth.registerCustomer({ email, password, name });
      if (res.success && res.data?.user && res.data?.token) {
        const u = res.data.user as AuthUser;
        setUser(u);
        setToken(res.data.token);
        setAuthStorage(res.data.token, u);
        return { ok: true };
      }
      return {
        ok: false,
        error: (res as { error?: string }).error || "Registration failed",
      };
    },
    []
  );

  const registerWholesaler = useCallback(
    async (body: {
      email: string;
      password: string;
      name: string;
      firmName: string;
      city: string;
      visitingCardImage: string;
      mobNumber: string;
      gstCertificateFiles: string[];
      businessName?: string;
      gstNo?: string;
    }) => {
      const res = await api.auth.registerWholesaler(body);
      if (res.success && res.data?.user && res.data?.token) {
        const u = res.data.user as AuthUser;
        setUser(u);
        setToken(res.data.token);
        setAuthStorage(res.data.token, u);
        return { ok: true };
      }
      return {
        ok: false,
        error: (res as { error?: string }).error || "Registration failed",
      };
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setToken(null);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isWholesaler,
      login,
      registerCustomer,
      registerWholesaler,
      logout,
      refreshUser,
    }),
    [
      user,
      token,
      isLoading,
      isWholesaler,
      login,
      registerCustomer,
      registerWholesaler,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
