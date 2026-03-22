import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "./ScrollReveal";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Image as ImageIcon, Maximize2, X } from "lucide-react";

type GalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  category: string;
};

export const Gallery = () => {
  const [filter, setFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery" as any)
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Gallery fetch error:", error);
        return [];
      }
      return data as unknown as GalleryItem[];
    },
  });

  const filteredImages = images?.filter(
    (img) => filter === "all" || img.category === filter
  );

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "achievement", label: "Achievements" },
    { id: "coaching", label: "Coaching Center" },
  ];

  return (
    <section id="gallery" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Our Gallery</span>
            <h2 className="mt-3 text-foreground text-balance">Life at Wave Academy</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
              Glimpses of our students' achievements and the vibrant learning environment at our coaching center.
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? "gold" : "outline"}
              size="sm"
              onClick={() => setFilter(cat.id)}
              className="rounded-full px-6 transition-all duration-300"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-xl bg-muted" />
            ))}
          </div>
        ) : filteredImages && filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img, i) => (
              <ScrollReveal key={img.id} delay={i * 50}>
                <div 
                  className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-muted border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery image"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-gold-light font-medium text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {img.caption || (img.category === "achievement" ? "Achievement" : "Coaching Center")}
                    </p>
                    <div className="absolute top-4 right-4 bg-gold/90 p-2 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                      <Maximize2 className="h-4 w-4 text-navy" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No photos found in this category yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-gold-muted hover:text-gold transition-colors p-2"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || "Gallery detail"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedImage.caption && (
              <p className="text-gold-light mt-6 text-center text-lg font-medium px-4 max-w-2xl">
                {selectedImage.caption}
              </p>
            )}
            <span className="text-gold mt-2 text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              {selectedImage.category}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
