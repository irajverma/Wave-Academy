import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Maximize2, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type GalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  category: string;
};

export default function GalleryPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery-page"],
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
    { id: "all", label: "All Moments" },
    { id: "achievement", label: "Achievements" },
    { id: "coaching", label: "Coaching Center" },
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-up">
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Visual Journey</span>
            <h1 className="mt-4 text-gold-light leading-tight">Wave Academy <span className="text-gold">Gallery</span></h1>
            <p className="mt-6 text-gold-muted text-lg leading-relaxed max-w-2xl text-pretty">
              A glimpse into the life at Wave Academy—celebrating our students' success stories and showcasing our professional coaching environment.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={filter === cat.id ? "gold" : "outline"}
                onClick={() => setFilter(cat.id)}
                className="rounded-full px-8 transition-all duration-300 font-medium"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-3xl bg-muted" />
              ))}
            </div>
          ) : filteredImages && filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((img, i) => (
                <ScrollReveal key={img.id} delay={i * 50}>
                  <div 
                    className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden cursor-pointer bg-muted border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || "Gallery image"}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <p className="text-gold-light font-display text-lg font-bold translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                        {img.caption || (img.category === "achievement" ? "Success Moment" : "Center Facility")}
                      </p>
                      <p className="text-gold/60 text-xs uppercase tracking-widest mt-2 translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        {img.category}
                      </p>
                      <div className="absolute top-6 right-6 bg-gold p-3 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-150 shadow-xl">
                        <Maximize2 className="h-5 w-5 text-navy" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50 max-w-4xl mx-auto">
              <ImageIcon className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-10" />
              <h3 className="text-xl font-medium text-foreground">No photos found</h3>
              <p className="text-muted-foreground mt-2">We're still gathering moments for this category. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="bg-navy p-12 sm:p-20 rounded-[3rem] text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-gold/10 transition-colors duration-700" />
              <h2 className="text-gold-light text-4xl mb-6">Ready to join our success story?</h2>
              <p className="text-gold-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Become a part of the Wave Academy family and start building your prestigious career in the armed forces or top universities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/enroll">
                  <Button variant="gold" size="xl" className="rounded-2xl group/btn">
                    Enroll Now <ChevronRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="xl" className="rounded-2xl border-gold/30 text-gold hover:bg-gold/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Attribution */}
      <div className="pb-12 text-center text-[10px] text-muted-foreground/30 italic">
        Made with ❤️ by Raj
      </div>
    </div>
  );
}
