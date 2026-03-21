import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, ClipboardList, MessageSquare, TrendingUp } from "lucide-react";

export default function AdminOverview() {
  const { data: enrollments } = useQuery({
    queryKey: ["admin-enrollments-count"],
    queryFn: async () => {
      const { count } = await supabase.from("enrollments").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["admin-contacts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-count"],
    queryFn: async () => {
      const { count } = await supabase.from("courses").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["admin-results-count"],
    queryFn: async () => {
      const { count } = await supabase.from("test_results").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const cards = [
    { label: "Total Enrollments", value: enrollments ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Active Courses", value: courses ?? 0, icon: BookOpen, color: "text-emerald-500" },
    { label: "Test Results", value: results ?? 0, icon: ClipboardList, color: "text-amber-500" },
    { label: "Contact Messages", value: contacts ?? 0, icon: MessageSquare, color: "text-rose-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <c.icon className={`h-6 w-6 ${c.color}`} />
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold font-display text-foreground">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
