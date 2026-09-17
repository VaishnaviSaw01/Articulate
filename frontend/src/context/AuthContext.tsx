import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api, TOKEN_STORAGE_KEY, apiErrorMessage } from "../api/client";
import { AuthUser } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "articulate_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }, [user]);

  async function signup(email: string, password: string) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { email, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, signup, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
