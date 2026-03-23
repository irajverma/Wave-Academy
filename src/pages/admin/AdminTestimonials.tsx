import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Sparkles } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { seedTestimonials } from "@/scripts/seedTestimonials";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

export default function AdminTestimonials() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", text: "", rating: 5, is_active: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      if (editingId) {
        const { error } = await supabase
          .from("testimonials")
          .update(newData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert([newData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(`Testimonial ${editingId ? "updated" : "added"} successfully`);
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Save migration failed:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Attempting to delete testimonial with ID:", id);
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Supabase delete error (testimonials):", error);
        throw error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted");
    },
    onError: (e: any) => {
      console.error("Delete mutation failed:", e);
      toast.error(`Failed to delete: ${e.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const promise = saveMutation.mutateAsync(formData);
    toast.promise(promise, {
      loading: editingId ? "Updating testimonial..." : "Adding testimonial...",
      success: editingId ? "Testimonial updated!" : "Testimonial added!",
      error: (err) => `Failed to save: ${err.message}`
    });
  };

  const resetForm = () => {
    setFormData({ name: "", role: "", text: "", rating: 5, is_active: true });
    setEditingId(null);
  };

  const handleEdit = (t: any) => {
    setFormData({ name: t.name, role: t.role, text: t.text, rating: t.rating, is_active: t.is_active });
    setEditingId(t.id);
    setIsOpen(true);
  };

  if (isLoading) return <div>Loading testimonials...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-display text-foreground">Manage Testimonials</h1>
        
        <div className="flex items-center gap-2">
          {/* Show seed button only when empty */}
          {testimonials?.length === 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await seedTestimonials();
                  queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] });
                  queryClient.invalidateQueries({ queryKey: ["testimonials"] });
                  toast.success("4 demo testimonials added!");
                } catch (e: any) {
                  toast.error(e.message);
                }
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Seed Demo Data
            </Button>
          )}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role / Result (e.g. NDA Selected)</label>
                <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Testimonial Text</label>
                <Textarea value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} required rows={4} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} required />
              </div>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending} 
                className="w-full"
              >
                {saveMutation.isPending ? "Saving..." : "Save Testimonial"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div> {/* end flex items-center gap-2 */}
      </div> {/* end header row */}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials?.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.role}</TableCell>
                <TableCell>{t.rating} Stars</TableCell>
                <TableCell>
                   <span className={`px-2 py-1 rounded-full text-xs ${t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {t.is_active ? 'Visible' : 'Hidden'}
                   </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(t)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => {
                    if (confirm("Are you sure you want to delete this testimonial?")) {
                      deleteMutation.mutate(t.id);
                    }
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {testimonials?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No testimonials found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
