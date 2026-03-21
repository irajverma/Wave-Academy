import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", link: "", is_active: true, image_url: ""
  });

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_banners").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let uploadedUrl = form.image_url;
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("banners").upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from("banners").getPublicUrl(filePath);
        uploadedUrl = publicUrlData.publicUrl;
      }

      if (!uploadedUrl) throw new Error("Image is required.");

      const payload = {
        title: form.title,
        description: form.description,
        link: form.link,
        is_active: form.is_active,
        image_url: uploadedUrl,
      };

      if (editId) {
        const { error } = await supabase.from("site_banners").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Banner updated" : "Banner added");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("site_banners").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", link: "", is_active: true, image_url: "" });
    setFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (b: any) => {
    setForm({
      title: b.title || "",
      description: b.description || "",
      link: b.link || "",
      is_active: b.is_active,
      image_url: b.image_url,
    });
    setFile(null);
    setEditId(b.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Manage Banners</h1>
        <Button variant="gold" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 border border-border mb-6 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground">{editId ? "Edit Banner" : "New Banner"}</h3>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Link (Optional URL)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <Textarea placeholder="Description" className="sm:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload Image</label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {form.image_url && !file && (
                <div className="mt-2 text-sm text-muted-foreground">Current image active. Uploading a new one overwrites it.</div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              <span>Visible on Home Page</span>
            </div>
          </div>
          <Button variant="gold" className="mt-4" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : editId ? "Update Banner" : "Add Banner"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading banners...</div>
      ) : !banners?.length ? (
        <div className="text-center py-12 text-muted-foreground">No banner slides yet. Add one above.</div>
      ) : (
        <div className="space-y-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-card rounded-lg p-4 border border-border flex items-start justify-between gap-4">
              <div className="w-32 h-20 rounded bg-muted flex-shrink-0 overflow-hidden relative">
                <img src={b.image_url} alt={b.title || "Banner"} className="object-cover w-full h-full" />
                {!b.is_active && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center text-xs font-bold text-muted-foreground">HIDDEN</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">{b.title || "Untitled Slide"}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{b.description}</div>
              </div>
              <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
                <Button variant="outline" size="sm" onClick={() => toggleStatusMutation.mutate({ id: b.id, is_active: !b.is_active })}>
                  {b.is_active ? "Hide" : "Show"}
                </Button>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(b)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
