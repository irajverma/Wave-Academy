import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Image as ImageIcon, Plus, Trash2, Eye, EyeOff, 
  Filter, Tag, ExternalLink, Loader2, Upload 
} from "lucide-react";

type GalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  category: "achievement" | "coaching";
  is_active: boolean;
  created_at: string;
};

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newImage, setNewImage] = useState({
    url: "",
    caption: "",
    category: "achievement" as "achievement" | "coaching"
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (item: typeof newImage) => {
      const { data, error } = await supabase
        .from("gallery")
        .insert([{ ...item, is_active: true }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image added to gallery");
      setNewImage({ url: "", caption: "", category: "achievement" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsAdding(false);
    },
    onError: (error) => {
      toast.error("Failed to add image: " + error.message);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("gallery" as any)
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image status updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gallery" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image removed from gallery");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear URL if file is selected
      setNewImage(prev => ({ ...prev, url: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = newImage.url;

    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10 MB");
        return;
      }

      setIsUploading(true);
      try {
        console.log(`[AdminGallery] Compressing ${selectedFile.name}...`);
        
        // Compress image client-side before upload
        const compressedBlob = await new Promise<Blob>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const MAX_DIM = 1200; // Good balance for gallery viewing
              const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1);
              const canvas = document.createElement("canvas");
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              const ctx = canvas.getContext("2d")!;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas toBlob failed"));
              }, "image/jpeg", 0.85);
            };
            img.onerror = () => reject(new Error("Failed to load image for compression"));
            img.src = ev.target?.result as string;
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(selectedFile);
        });

        const fileExt = "jpg"; // We forced to jpeg
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        console.log(`[AdminGallery] Uploading compressed blob (${Math.round(compressedBlob.size / 1024)} KB) as ${filePath}...`);
        
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error("[AdminGallery] Storage upload error:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        console.log("[AdminGallery] Upload success, public URL:", publicUrl);
        imageUrl = publicUrl;
      } catch (error: any) {
        console.error("[AdminGallery] Upload/Compression error:", error);
        toast.error("Upload failed: " + error.message);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (!imageUrl) {
      toast.error("Please provide an image URL or upload a file");
      return;
    }

    const promise = addMutation.mutateAsync({ ...newImage, url: imageUrl });
    toast.promise(promise, {
      loading: "Saving to gallery...",
      success: "Image added successfully!",
      error: (err) => `Failed to add: ${err.message}`
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gallery Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage achievements and coaching center photos</p>
        </div>
        <Button 
          variant={isAdding ? "outline" : "gold"} 
          onClick={() => setIsAdding(!isAdding)}
          className="w-full sm:w-auto"
        >
          {isAdding ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Add Image</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Upload Image</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="pl-10 pt-1.5"
                    />
                  </div>
                </div>
                <div className="relative py-2 flex items-center gap-4">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">OR</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <label className="text-sm font-semibold text-foreground">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newImage.url}
                    onChange={(e) => {
                      setNewImage({ ...newImage, url: e.target.value });
                      setSelectedFile(null); // Clear file if URL is touched
                    }}
                    className="pl-10"
                    disabled={!!selectedFile}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Category</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newImage.category === "achievement" ? "gold" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => setNewImage({ ...newImage, category: "achievement" })}
                  >
                    Achievement
                  </Button>
                  <Button
                    type="button"
                    variant={newImage.category === "coaching" ? "gold" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => setNewImage({ ...newImage, category: "coaching" })}
                  >
                    Coaching
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-foreground">Caption (Optional)</label>
                <Input
                  placeholder="Describe this photo..."
                  value={newImage.caption}
                  onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={addMutation.isPending || isUploading}
            >
              {addMutation.isPending || isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isUploading ? "Uploading Image..." : "Save to Gallery"}
            </Button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border h-64 animate-pulse" />
          ))
        ) : images?.map((img) => (
          <div key={img.id} className="group bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-4 group-hover:ring-2 ring-gold/20 transition-all">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  img.category === "achievement" ? "bg-gold text-navy" : "bg-blue-500 text-white"
                }`}>
                  {img.category}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0 mb-4">
              <p className="text-sm font-medium text-foreground truncate">{img.caption || "No caption"}</p>
              <div className="flex items-center gap-1 mt-1">
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground truncate">{img.url}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleMutation.mutate({ id: img.id, is_active: !img.is_active })}
                  className={`p-2 rounded-lg transition-colors ${
                    img.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-rose-500 hover:bg-rose-50"
                  }`}
                  title={img.is_active ? "Mark as hidden" : "Mark as visible"}
                >
                  {img.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => window.open(img.url, "_blank")}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View original"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove this image from gallery?")) {
                    deleteMutation.mutate(img.id);
                  }
                }}
                className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && images?.length === 0 && (
        <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
          <ImageIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No images in gallery</h3>
          <p className="text-muted-foreground mt-1">Start by adding photos of achievements or your coaching center.</p>
          <Button variant="gold" className="mt-6" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Image
          </Button>
        </div>
      )}
    </div>
  );
}
