import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Search, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

export default function StudentResultsPage() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["student-results", searchEmail],
    queryFn: async () => {
      if (!searchEmail) return [];
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("student_email", searchEmail)
        .order("test_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!searchEmail,
  });

  const subjectData = results?.length
    ? Object.entries(
        results.reduce((acc, r) => {
          if (!acc[r.subject]) acc[r.subject] = { total: 0, count: 0 };
          acc[r.subject].total += (r.score / r.total_marks) * 100;
          acc[r.subject].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>)
      ).map(([subject, { total, count }]) => ({ subject, avg: Math.round(total / count) }))
    : [];

  const timelineData = results?.length
    ? results.map((r) => ({
        date: r.test_date,
        score: Math.round((r.score / r.total_marks) * 100),
        name: r.test_name,
      }))
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(email.trim());
  };

  return (
    <div className="pt-16">
      <section className="bg-navy py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl opacity-0 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Student Portal</span>
            <h1 className="mt-3 text-gold-light text-balance">View Your Results</h1>
            <p className="mt-4 text-gold-muted text-lg">
              Enter your registered email to view your test scores and performance analytics.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal>
            <form onSubmit={handleSearch} className="flex gap-3 mb-12">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="max-w-md"
              />
              <Button type="submit" variant="gold">
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>
          </ScrollReveal>

          {isLoading && <div className="text-muted-foreground">Loading results...</div>}

          {searchEmail && results && results.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No results found for this email. Please check the email or contact the academy.
            </div>
          )}

          {results && results.length > 0 && (
            <div className="space-y-8">
              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScrollReveal direction="left">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-gold" /> Subject-wise Performance
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={subjectData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                        <XAxis dataKey="subject" fontSize={12} />
                        <YAxis domain={[0, 100]} fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="avg" fill="hsl(43, 72%, 55%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="right">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-foreground mb-4">Progress Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis domain={[0, 100]} fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="hsl(222, 55%, 18%)" strokeWidth={2} dot={{ fill: "hsl(43, 72%, 55%)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollReveal>
              </div>

              {/* Results table */}
              <ScrollReveal>
                <div className="bg-card rounded-xl border border-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left bg-muted/30">
                        <th className="p-4 font-medium text-muted-foreground">Test</th>
                        <th className="p-4 font-medium text-muted-foreground">Subject</th>
                        <th className="p-4 font-medium text-muted-foreground">Score</th>
                        <th className="p-4 font-medium text-muted-foreground">Percentage</th>
                        <th className="p-4 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => {
                        const pct = Math.round((r.score / r.total_marks) * 100);
                        return (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="p-4 font-medium text-foreground">{r.test_name}</td>
                            <td className="p-4 text-muted-foreground">{r.subject}</td>
                            <td className="p-4">{r.score}/{r.total_marks}</td>
                            <td className="p-4">
                              <span className={`font-semibold ${pct >= 60 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-500"}`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground hidden sm:table-cell">{r.test_date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
