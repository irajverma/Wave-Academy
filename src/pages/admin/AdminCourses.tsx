import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export default function AdminCourses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", category: "", description: "", duration: "", features: "", price: "" });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Clean up the price to ensuring it's either a valid Number or null
      let parsedPrice = null;
      if (form.price) {
        // Strip everything except numbers and decimals in case they type "₹15000"
        const numericStr = form.price.replace(/[^0-9.]/g, "");
        if (numericStr) parsedPrice = Number(numericStr);
      }

      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        duration: form.duration,
        price: parsedPrice,
        features: form.features ? form.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
      };

      try {
        if (editId) {
          const { error } = await supabase.from("courses").update(payload).eq("id", editId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("courses").insert([payload]);
          if (error) throw error;
        }
      } catch (err: any) {
        console.error("Supabase Save Error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Course updated" : "Course added");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      resetForm();
    },
    onError: (e: Error) => {
      console.error("Mutation failed:", e);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`[AdminCourses] Attempting to delete course with ID: ${id}`);
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) {
        console.error("[AdminCourses] Delete error:", error);
        throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      // Toast is handled by mutateAsync in the click handler
    },
    onError: (e: any) => {
      console.error("Failed to delete:", e);
      toast.error(e.message || "Failed to delete course");
    }
  });

  const resetForm = () => {
    setForm({ title: "", category: "", description: "", duration: "", features: "", price: "" });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (c: any) => {
    setForm({
      title: c.title,
      category: c.category,
      description: c.description ?? "",
      duration: c.duration ?? "",
      price: c.price ?? "",
      features: (c.features ?? []).join(", "),
    });
    setEditId(c.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Manage Courses</h1>
        <Button variant="gold" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 border border-border mb-6 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground">{editId ? "Edit Course" : "New Course"}</h3>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Category (e.g. NDA, CUET)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input placeholder="Price (e.g. ₹15,000)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input placeholder="Features (comma separated)" className="sm:col-span-2" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </div>
          <textarea
            className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button 
            variant="gold" 
            className="mt-4" 
            onClick={async () => {
              const promise = saveMutation.mutateAsync();
              toast.promise(promise, {
                loading: editId ? "Updating course..." : "Adding course...",
                success: editId ? "Course updated!" : "Course added!",
                error: (err) => `Failed to save: ${err.message}`
              });
            }} 
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : editId ? "Update" : "Add"} Course
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading courses...</div>
      ) : !courses?.length ? (
        <div className="text-center py-12 text-muted-foreground">No courses yet. Add your first course above.</div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="bg-card rounded-lg p-4 border border-border flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">{c.title}</div>
                <div className="text-sm text-muted-foreground">{c.category} · {c.duration} {c.price && <span className="text-gold font-medium ml-2">{c.price}</span>}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this course?")) {
                      const promise = deleteMutation.mutateAsync(c.id);
                      toast.promise(promise, {
                        loading: "Deleting course...",
                        success: "Course deleted!",
                        error: (err) => `Failed to delete: ${err.message}`
                      });
                    }
                  }} 
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
