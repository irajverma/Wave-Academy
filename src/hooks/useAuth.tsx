import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string, userEmail?: string) => {
    // Race against a 3-second timeout so we never hang indefinitely
    const timeoutPromise = new Promise<boolean>((resolve) =>
      setTimeout(() => {
        console.warn("[useAuth] checkAdmin timed out, defaulting to false");
        resolve(false);
      }, 3000)
    );

    const checkPromise = async (): Promise<boolean> => {
      try {
        // First attempt: use the has_role RPC
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });
        if (!error) {
          console.log("[useAuth] has_role RPC result:", data);
          return !!data;
        }
        console.warn("[useAuth] has_role RPC failed:", error.message, "— trying fallback");
      } catch (err) {
        console.warn("[useAuth] has_role RPC threw:", err);
      }

      try {
        // Fallback 1: query user_roles table directly
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (!error) {
          console.log("[useAuth] user_roles direct query result:", data);
          return !!data;
        }
        console.warn("[useAuth] user_roles query failed:", error.message);
      } catch (err) {
        console.warn("[useAuth] user_roles query threw:", err);
      }

      // Fallback 2: check against known admin email(s)
      if (userEmail) {
        const adminEmails = ["i.rajverma8423@gmail.com"];
        const isKnownAdmin = adminEmails.includes(userEmail.toLowerCase());
        console.log("[useAuth] Email fallback check:", userEmail, "→", isKnownAdmin);
        return isKnownAdmin;
      }

      return false;
    };

    const isAdminResult = await Promise.race([checkPromise(), timeoutPromise]);
    setIsAdmin(isAdminResult);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Safety timeout: Ensure loading is cleared after 5 seconds even if Supabase hangs
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn("[useAuth] Safety timeout reached. Forcing loading state to false.");
          setLoading(false);
        }
      }, 5000);

      try {
        console.log("[useAuth] Initializing auth...");
        // Bypass getSession entirely to completely bypass the deadlocked browser locks
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error && error.message !== "Auth session missing!") throw error;
        
        if (mounted) {
          setUser(user);
          if (user) {
            console.log("[useAuth] User found, checking roles...");
            await checkAdmin(user.id, user.email ?? undefined);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("[useAuth] Session initialize error:", err);
        if (mounted) {
          setIsAdmin(false);
          setUser(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          console.log("[useAuth] Auth initialized.");
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("[useAuth] Auth state change:", event);
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await checkAdmin(u.id, u.email ?? undefined);
        } else {
          setIsAdmin(false);
        }
        // Also clear loading if it's still true
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Error during sign out, but session cleared locally");
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
