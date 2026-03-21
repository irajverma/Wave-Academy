import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminEnrollments() {
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading, isError, error } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enrollments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    retry: 1, // Stop retrying forever if table schema is broken
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
  });

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Enrollment Requests</h1>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Loading enrollments...</div>
      ) : isError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl">
          <h3 className="font-semibold text-lg mb-1">Database Schema Mismatch</h3>
          <p className="text-sm">
            {error?.message || "There was an error communicating with the enrollments table."}
          </p>
          <p className="text-sm mt-2 font-medium">
            Please run the SQL schema fix in your Supabase dashboard to enable this page.
          </p>
        </div>
      ) : !enrollments?.length ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          No enrollment requests yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
                <th className="py-3 px-4 font-medium text-foreground">Name</th>
                <th className="py-3 px-4 font-medium text-foreground">Course</th>
                <th className="py-3 px-4 font-medium text-foreground hidden sm:table-cell">Phone</th>
                <th className="py-3 px-4 font-medium text-foreground hidden md:table-cell">Class</th>
                <th className="py-3 px-4 font-medium text-foreground">Status</th>
                <th className="py-3 px-4 font-medium text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{e.student_name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{e.course || "—"}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{e.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{e.class ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${statusColor(e.status ?? "pending")}`}>
                      {e.status ?? "pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => updateStatus.mutate({ id: e.id, status: "approved" })}
                        className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: e.id, status: "rejected" })}
                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
