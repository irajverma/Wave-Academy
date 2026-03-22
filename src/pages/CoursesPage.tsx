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
  "5-8": { title: "Classes 5–8", subtitle: "Foundation Years", icon: BookOpen, gradient: "from-blue-500/15 to-blue-600/5" },
  "9-10": { title: "Classes 9–10", subtitle: "Secondary Excellence", icon: Target, gradient: "from-emerald-500/15 to-emerald-600/5" },
  "11-12": { title: "Classes 11–12", subtitle: "Higher Secondary", icon: GraduationCap, gradient: "from-amber-500/15 to-amber-600/5" },
  "commerce": { title: "Commerce (11–12)", subtitle: "Business & Management", icon: Boxes, gradient: "from-indigo-500/15 to-indigo-600/5" },
  "nda": { title: "NDA & CDS", subtitle: "Defense Careers", icon: Shield, gradient: "from-rose-500/15 to-rose-600/5" },
  "clat": { title: "CLAT Exam", subtitle: "Legal Careers", icon: Target, gradient: "from-orange-500/15 to-orange-600/5" },
  "sainik": { title: "Sainik School", subtitle: "Entrance Preparation", icon: Shield, gradient: "from-cyan-500/15 to-cyan-600/5" },
};

// Fallback courses shown when DB has no data or can't be reached
const FALLBACK_COURSES = [
  { id: "f1", title: "Classes 5–8 Foundation", category: "5-8", duration: "12 Months", price: "₹1,000/month", description: "Strong concept-driven teaching for middle school students with regular assessments.", features: ["Conceptual clarity focus", "Weekly tests & feedback", "English & Maths focus", "Personalized attention"] },
  { id: "f2", title: "Classes 9–10 Secondary", category: "9-10", duration: "12 Months", price: "₹1,250/month", description: "Daily 2 hours of intensive coaching to build a rock-solid foundation for board exams.", features: ["Daily 2-hour sessions", "Subject-wise mastery", "Regular board-pattern tests", "Performance tracking"] },
  { id: "f3", title: "Classes 11–12 (Science)", category: "11-12", duration: "12 Months", price: "₹600/subject/month", description: "Expert-led coaching for Science stream students focusing on board excellence and competitive concepts.", features: ["Expert Faculty", "Physics, Chemistry, Maths, Bio", "Detailed study material", "Doubt-clearing sessions"] },
  { id: "f4", title: "Commerce Stream", category: "commerce", duration: "12 Months", price: "₹600/subject/month", description: "Comprehensive coaching for Accountancy, Business Studies, and Economics for board success.", features: ["Board Exam Focus", "Accountancy mastery", "Regular practice tests", "Concept-based learning"] },
  { id: "f5", title: "NDA & CDS Full Course", category: "nda", duration: "1 Academic Year", price: "₹25,000/year", description: "Complete preparation for NDA and CDS written exams, including aptitude and career guidance.", features: ["Written exam prep", "Mathematics & Aptitude", "General Ability Test (GAT)", "Career Guidance & SSB tips"] },
  { id: "f6", title: "CLAT Preparation", category: "clat", duration: "1 Academic Year", price: "₹20,000/year", description: "Dedicated coaching for CLAT written exam preparation and legal career guidance.", features: ["Legal Reasoning", "Current Affairs & GK", "English & Logical Reasoning", "Career Guidance"] },
  { id: "f7", title: "Sainik School Entrance", category: "sainik", duration: "12 Months", price: "₹20,000/month", description: "Intensive preparation for Sainik School entrance exams with written prep and career guidance.", features: ["Written exam preparation", "Intelligence & IQ tests", "Mock interviews", "Career Guidance"] },
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
    staleTime: 5000,
  });

  // Use DB courses if available; fall back to demo data when DB is empty, errored, or still loading
  const allCourses = (dbCourses && dbCourses.length > 0) ? dbCourses : FALLBACK_COURSES;

  // Group courses into visual sub-sections automatically
  const groupedCourses = allCourses.reduce((acc: any, course: any) => {
    let catId = (course.category || "other").toLowerCase().trim();
    if (catId.includes("5-8") || catId.includes("5–8")) catId = "5-8";
    if (catId.includes("9-10") || catId.includes("9–10")) catId = "9-10";
    if (catId.includes("11-12") || catId.includes("11–12")) catId = "11-12";
    if (catId.includes("commerce")) catId = "commerce";
    if (catId.includes("nda")) catId = "nda";
    if (catId.includes("clat")) catId = "clat";
    if (catId.includes("sainik")) catId = "sainik";
    
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
          {isLoading && !dbCourses && (
            <div className="flex justify-center items-center py-4 text-gold animate-pulse text-sm font-medium italic">
              Updating with latest courses...
            </div>
          )}
          
          {categories.length === 0 && !isLoading ? (
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
