import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Welcome back!");
      navigate("/admin");
    }
  };

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Developer: Account created! Now click Sign In.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy pt-16">
      <div className="w-full max-w-md mx-4 animate-fade-up" style={{ animationFillMode: "forwards" }}>
        <div className="bg-card rounded-xl p-8 shadow-2xl border border-border">
          <div className="flex items-center justify-center gap-2 mb-8">
            <GraduationCap className="h-8 w-8 text-gold" />
            <span className="font-display text-2xl font-bold text-foreground">Admin Login</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@waveacademy.in"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"} <LogIn className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" disabled={loading} onClick={handleSignUp}>
                Dev Sign Up
              </Button>
            </div>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Admin access only. Contact the administrator for credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
