import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  BookOpen, GraduationCap, Shield, Target, Clock, CheckCircle, ChevronRight, Boxes
} from "lucide-react";

// Visual templates for core categories mapping
const CAT_META: Record<string, any> = {
  "5-10": { title: "Classes 5–10", subtitle: "Academic Foundation", icon: BookOpen, gradient: "from-blue-500/15 to-blue-600/5" },
  "11-12": { title: "Classes 11–12", subtitle: "Board Mastery", icon: GraduationCap, gradient: "from-emerald-500/15 to-emerald-600/5" },
  "nda": { title: "NDA Preparation", subtitle: "Defence Careers", icon: Shield, gradient: "from-amber-500/15 to-amber-600/5" },
  "cuet": { title: "CUET Preparation", subtitle: "University Entrance", icon: Target, gradient: "from-rose-500/15 to-rose-600/5" },
};

// Fallback courses shown when DB has no data or can't be reached
const FALLBACK_COURSES = [
  { id: "f1", title: "Foundation Program (Classes 5–10)", category: "5-10", duration: "1 Academic Year", price: "₹12,000/year", description: "Strong concept-driven teaching for Classes 5 to 10, covering all subjects with regular assessments.", features: ["Conceptual clarity focus", "Weekly tests & feedback", "Olympiad preparation", "Parent-teacher meetings"] },
  { id: "f2", title: "Board Excellence (Classes 11–12)", category: "11-12", duration: "2 Years", price: "₹18,000/year", description: "Board exam mastery with competitive exam preparation for Science and Commerce students.", features: ["Board + competitive dual focus", "Mock board examinations", "Chapter-wise notes", "Expert faculty"] },
  { id: "f3", title: "NDA Written + SSB Coaching", category: "nda", duration: "6–12 Months", price: "₹25,000", description: "Comprehensive NDA & CDS preparation covering all GAT subjects, Mathematics, and SSB personality development.", features: ["Full syllabus coverage", "SSB interview training", "Physical fitness guidance", "Previous year papers"] },
  { id: "f4", title: "CUET Crash Course", category: "cuet", duration: "4 Months", price: "₹15,000", description: "Targeted coaching for CUET General Test and domain subjects to secure admission in top central universities.", features: ["Domain subject mastery", "General Test strategies", "Mock CUET tests", "Score improvement guarantee"] },
];

export default function CoursesPage() {
  const { data: dbCourses, isLoading, isError } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("is_active", true).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  // Use DB courses if available; fall back to demo data when DB is empty or errored
  const allCourses = (dbCourses && dbCourses.length > 0) ? dbCourses : FALLBACK_COURSES;

  // Group courses into visual sub-sections automatically
  const groupedCourses = allCourses.reduce((acc: any, course: any) => {
    let catId = (course.category || "other").toLowerCase().trim();
    if (catId.includes("5-10") || catId.includes("5–10")) catId = "5-10";
    if (catId.includes("11-12") || catId.includes("11–12")) catId = "11-12";
    if (catId.includes("nda")) catId = "nda";
    if (catId.includes("cuet")) catId = "cuet";
    
    if (!acc[catId]) {
      acc[catId] = {
        ...(CAT_META[catId] || { title: course.category || "Other Programs", subtitle: "Specialized Courses", icon: Boxes, gradient: "from-indigo-500/15 to-indigo-600/5" }),
        id: catId,
        courses: []
      };
    }
    acc[catId].courses.push(course);
    return acc;
  }, {});

  // Convert dictionary into array for mapping, pushing "other" to the bottom
  const categories: any[] = Object.values(groupedCourses).sort((a: any, b: any) => {
    if (a.id === "other") return 1;
    if (b.id === "other") return -1;
    return 0;
  });

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-navy py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Our Programs</span>
            <h1 className="mt-3 text-gold-light text-balance">
              Courses & Programs
            </h1>
            <p className="mt-4 text-gold-muted text-lg leading-relaxed text-pretty">
              Structured programs designed by experienced educators to help you achieve your academic and competitive goals.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Course Categories */}
      <section className="py-20 bg-background min-h-[50vh]">
        <div className="container mx-auto px-4 space-y-20">
          {isLoading ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground animate-pulse">Loading amazing courses...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No courses are currently available. Please check back later!</div>
          ) : (
            categories.map((cat: any, ci: number) => (
              <ScrollReveal key={cat.id} delay={ci * 80}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <cat.icon className="h-7 w-7 text-gold" />
                    <h2 className="text-foreground">{cat.title}</h2>
                  </div>
                  <p className="text-muted-foreground mb-8">{cat.subtitle}</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {cat.courses.map((course: any) => (
                      <div
                        key={course.id}
                        className={`p-8 rounded-xl bg-gradient-to-br ${cat.gradient} border border-border/50 hover:shadow-lg transition-shadow duration-300`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.duration || "Self-paced"}
                          </div>
                          {course.price && (
                            <div className="text-gold font-semibold bg-gold/10 px-3 py-1 rounded-full text-sm">
                              {course.price}
                            </div>
                          )}
                        </div>
                        <h3 className="text-foreground text-xl">{course.title}</h3>
                        {course.description && (
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-pretty">
                            {course.description}
                          </p>
                        )}
                        {course.features && course.features.length > 0 && (
                          <ul className="mt-5 space-y-2 flex-grow">
                            {course.features.map((f: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                <CheckCircle className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Link to="/enroll" className="inline-flex items-center gap-1 mt-6 text-gold font-semibold text-sm hover:gap-2 transition-all">
                          Enroll Now <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-gold-light text-balance">Can't decide? We'll help you choose.</h2>
            <p className="mt-4 text-gold-muted max-w-lg mx-auto">
              Book a free counseling session and let our experts guide you to the right program.
            </p>
            <Link to="/contact" className="inline-block mt-8">
              <Button variant="gold" size="xl">Book Free Counseling</Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
