import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "@/services/api";

export type AuthUser = { id: number; email: string; full_name: string };
type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "voyage_weaver_token";
const USER_KEY = "voyage_weaver_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem(USER_KEY); }
      }
      authApi.me(savedToken).then((me: any) => {
        setUser(me); localStorage.setItem(USER_KEY, JSON.stringify(me));
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(null); setUser(null);
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const persist = (result: any) => {
    const nextToken = result.access_token as string;
    const nextUser = result.user as AuthUser;
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken); setUser(nextUser);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user, token, loading,
    signIn: async (email, password) => persist(await authApi.login({ email, password })),
    signUp: async (fullName, email, password) => persist(await authApi.register({ full_name: fullName, email, password })),
    signOut: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(null); setUser(null); },
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
