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

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) {
        console.error("Admin check error:", error);
      }
      setIsAdmin(!!data);
    } catch (err) {
      console.error("Admin try-catch:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Safety timeout to prevent permanent "Loading..." hang during boot
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn("Auth initialization timed out after 7s. Proceeding as guest.");
          setLoading(false);
        }
      }, 7000);

      try {
        console.log("Initializing auth session...");
        // Use getUser() as it's more secure than getSession()
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          if (error.message !== "Auth session missing!") {
            console.error("Supabase getUser error:", error);
          }
        }
        
        if (mounted) {
          setUser(user);
          if (user) {
            console.log("Session found, checking admin roles...");
            await checkAdmin(user.id);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Critical auth initialization failure:", err);
        if (mounted) setIsAdmin(false);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("Auth event occurred:", event);
        
        const u = session?.user ?? null;
        setUser(u);
        
        if (u) {
          await checkAdmin(u.id);
        } else {
          setIsAdmin(false);
        }

        // Always ensure loading is false after any valid auth event (login/logout)
        // This fixes hangs where initAuth is stuck but the listener fires correctly
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Add a local timeout for the signIn call itself
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<{ error: any }>((_, reject) => 
        setTimeout(() => reject(new Error("Sign-in timed out. Please check your connection.")), 15000)
      );

      const { error } = await Promise.race([signInPromise, timeoutPromise]) as any;
      if (error) return { error: error.message || "Invalid credentials" };
      return { error: null };
    } catch (err: any) {
      console.error("SignIn exception:", err);
      return { error: err.message || "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out and clearing session...");
      // Wrap in a 5s timeout to ensure we clear local state even if server call hangs
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("SignOut timeout")), 5000))
      ]).catch(e => console.warn("SignOut server call failed or timed out:", e));
      
      toast.success("Signed out successfully");
    } catch (err) {
      console.error("Sign out error catch:", err);
    } finally {
      // CRITICAL: Always clear local state regardless of what happened above
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      // Optional: Clear storage manually on sign out to be safe
      localStorage.removeItem("supabase.auth.token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
