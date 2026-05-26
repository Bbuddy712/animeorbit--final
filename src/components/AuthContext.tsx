import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: "Not initialized" }),
  signIn: async () => ({ error: "Not initialized" }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  return !!(url && key && !url.includes("dummy"));
}

let _clientPromise: Promise<SupabaseClient | null> | null = null;

function getClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return Promise.resolve(null);
  if (_clientPromise) return _clientPromise;

  _clientPromise = import("@/integrations/supabase/client").then((m) => m.supabase).catch(() => null);
  return _clientPromise;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getClient().then((client) => {
      if (cancelled || !client) {
        setLoading(false);
        return;
      }

      client.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, newSession) => {
        if (cancelled) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
      });

      return () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const client = await getClient();
    if (!client)
      return { error: "Authentication is not configured. Please set up Supabase credentials." };

    const { error } = await client.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = await getClient();
    if (!client)
      return { error: "Authentication is not configured. Please set up Supabase credentials." };

    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const handleSignOut = useCallback(async () => {
    const client = await getClient();
    if (client) await client.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
