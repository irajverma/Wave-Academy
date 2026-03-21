import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query as fsQuery, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GraduationCap, Clock, Award, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FacultyPage() {
  const { data: faculty, isLoading, isError } = useQuery({
    queryKey: ["faculty-page"],
    queryFn: async () => {
      const q = fsQuery(collection(db, "faculty"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() as any }))
        .filter(f => f.is_active !== false);
    },
  });

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-up">
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Our Educators</span>
            <h1 className="mt-4 text-gold-light leading-tight">Expert Faculty & <span className="text-gold">Mentors</span></h1>
            <p className="mt-6 text-gold-muted text-lg leading-relaxed max-w-2xl">
              Meet the dedicated professionals behind Wave Academy's success. From defence veterans to academic experts, our team is committed to your growth and selection.
            </p>
          </div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : isError || !faculty?.length ? (
              <div className="col-span-full text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-medium text-foreground">Meet Our Faculty</h3>
                <p className="text-muted-foreground mt-2">Our team of experts is currently being updated. Please check back soon.</p>
              </div>
            ) : (
              faculty.map((f: any, i: number) => (
                <ScrollReveal key={f.id} delay={i * 100}>
                  <div className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:border-gold/30 transition-all duration-500 h-full flex flex-col">
                    {/* Image Area */}
                    <div className="relative h-72 overflow-hidden bg-muted">
                      {f.photo_url ? (
                        <img 
                          src={f.photo_url} 
                          alt={f.name} 
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-navy-light text-gold/20">
                          <GraduationCap className="h-24 w-24" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-60" />
                      
                      {/* Subject Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {f.subject}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-display font-bold text-foreground mb-1">{f.name}</h3>
                      <p className="text-gold font-medium mb-4 flex items-center gap-2">
                        <Award className="h-4 w-4" /> {f.qualification}
                      </p>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-4">
                        {f.bio}
                      </p>

                      <div className="space-y-4 mt-auto pt-6 border-t border-border">
                        {f.experience && (
                          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                            <Clock className="h-4 w-4 text-gold" />
                            <span>{f.experience} Teaching Experience</span>
                          </div>
                        )}
                        
                        {f.achievements?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {f.achievements.slice(0, 3).map((a: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs bg-gold/5 text-gold px-3 py-1.5 rounded-lg border border-gold/10">
                                <Star className="h-3 w-3 fill-gold" />
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gold p-12 rounded-[2.5rem] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <h2 className="text-navy text-4xl mb-4">Want to learn from the best?</h2>
            <p className="text-navy/80 text-lg max-w-xl mx-auto mb-8 font-medium">
              Join Wave Academy today and start your journey toward excellence with our expert mentors.
            </p>
            <a href="/enroll">
              <button className="bg-navy text-white px-10 py-4 rounded-xl font-bold hover:bg-navy-light transition-colors text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300">
                Enroll in a Course
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
