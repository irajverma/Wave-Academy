import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, FileText, LogOut, GraduationCap, MessageSquare, Menu, Star, Settings, Image, UserSquare2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarLinks = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Courses", icon: BookOpen, href: "/admin/courses" },
  { label: "Enrollments", icon: Users, href: "/admin/enrollments" },
  { label: "Contacts", icon: MessageSquare, href: "/admin/contacts" },
  { label: "Test Results", icon: ClipboardList, href: "/admin/results" },
  { label: "Testimonials", icon: Star, href: "/admin/testimonials" },
  { label: "Faculty", icon: UserSquare2, href: "/admin/faculty" },
  { label: "Banners", icon: Image, href: "/admin/banners" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30 pt-16 flex">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-50 lg:z-auto h-[calc(100vh-4rem)] w-64 bg-navy flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-navy-light/30">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-gold" />
            <span className="font-display font-bold text-gold-light">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold/10 text-gold"
                    : "text-gold-muted hover:text-gold hover:bg-navy-light/50"
                }`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-light/30">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-gold-muted hover:text-gold transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile sidebar trigger */}
        <div className="lg:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
