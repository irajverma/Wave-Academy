import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import heroBg from "@/assets/hero-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  BookOpen, Users, Trophy, Target, Star, ChevronRight, ChevronLeft,
  GraduationCap, Clock, Shield, TrendingUp, Phone, Mail, MapPin, 
  Image as ImageIcon, Boxes
} from "lucide-react";
import { Gallery } from "@/components/Gallery";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const stats = [
  { value: "2,500+", label: "Students Coached" },
  { value: "92%", label: "Selection Rate" },
  { value: "15+", label: "Expert Faculty" },
  { value: "8", label: "Years of Excellence" },
];

const courses = [
  { title: "Classes 5–8", desc: "Foundation years coaching with ₹1,000 monthly fee", icon: BookOpen, color: "from-blue-500/20 to-blue-600/5" },
  { title: "Classes 9–10", desc: "Secondary excellence with daily 2-hour intensive sessions", icon: Target, color: "from-emerald-500/20 to-emerald-600/5" },
  { title: "Classes 11–12", desc: "Board mastery with expert faculty at ₹600 per subject", icon: GraduationCap, color: "from-amber-500/20 to-amber-600/5" },
  { title: "Commerce", desc: "Comprehensive stream support for Accountancy & Economics", icon: Boxes, color: "from-indigo-500/20 to-indigo-600/5" },
  { title: "NDA & CDS", desc: "Full year preparation for written exams and career guidance", icon: Shield, color: "from-rose-500/20 to-rose-600/5" },
  { title: "CLAT Exam", desc: "Dedicated preparation for legal careers at ₹20,000 yearly", icon: Target, color: "from-orange-500/20 to-orange-600/5" },
  { title: "Sainik School", desc: "Intensive entrance coaching with monthly guidance", icon: Shield, color: "from-cyan-500/20 to-cyan-600/5" },
];

const features = [
  { icon: Users, title: "Small Batch Sizes", desc: "Maximum 25 students per batch for personalized attention" },
  { icon: Trophy, title: "Proven Track Record", desc: "Consistently high selection rates across competitive exams" },
  { icon: Clock, title: "Flexible Timings", desc: "Morning, afternoon, and evening batches to suit every schedule" },
  { icon: TrendingUp, title: "Regular Assessments", desc: "Weekly tests and detailed performance analytics for growth" },
  { icon: BookOpen, title: "Study Material", desc: "Comprehensive course material designed by experienced faculty" },
  { icon: Target, title: "Doubt Sessions", desc: "Dedicated doubt-clearing sessions every week" },
];

const testimonials = [
  { name: "Raj Verma", role: "VIT Bhopal", text: "Wave Academy provided me with the solid foundation needed to excel in my engineering journey. The faculty's dedication is unparalleled.", rating: 5 },
  { name: "Nitya Sukhla", role: "BIT Mesra", text: "The structured approach to complex subjects helped me clear competitive exams with confidence. Highly recommended!", rating: 5 },
  { name: "Ayushi Mishra", role: "Book Author & Hon. Political Science", text: "A truly inspirational learning environment. The focus on conceptual clarity helped me even in my career as a political science scholar and author.", rating: 5 },
  { name: "Akashya Tripathi", role: "JEE Mains Cleared", text: "I owe my JEE success to the rigorous testing and personalized attention I received at Wave Academy. The teachers are always available for doubts.", rating: 5 },
  { name: "Prakash Mishra", role: "100 in Maths, 12th Board", text: "Scoring a perfect 100 was possible only because of the shortcut methods and constant practice sessions here. Best coaching in town!", rating: 5 },
  { name: "Tanu Singh", role: "VIT Bhopal", text: "From board preparation to university entrance, Wave Academy guided me every step of the way. I'm proud to be an alumna.", rating: 5 },
  { name: "Arjun Mehta", role: "NDA Selected, 2024", text: "Wave Academy's structured approach and mock tests were instrumental in my NDA selection. The faculty truly cares about each student's success.", rating: 5 },
];

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  const courseAutoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const { data: homeBanners } = useQuery({
    queryKey: ["site-banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_banners").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!homeBanners || homeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % homeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [homeBanners]);

  const { data: settings } = useSiteSettings();

  const { data: dynamicTestimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: facultyList } = useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faculty")
        .select("*")
        .eq("is_active", true)
        .order("order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const displayTestimonials = dynamicTestimonials && dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials;

  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-navy overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/60 z-0" />

        <div className="container mx-auto px-4 relative z-10 py-32">
          <div className="max-w-3xl">
            <div
              className="opacity-0 animate-fade-up pointer-events-auto"
              style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-medium mb-6">
                Classes 5–12 · NDA · CUET · Sainik School
              </div>
              <h1 className="text-gold-light leading-[1.1] text-balance">
                Ride the Wave <br />to Academic <span className="text-gold">Excellence</span>
              </h1>
              <p className="mt-6 text-lg text-gold-muted max-w-lg leading-relaxed text-pretty">
                Expert-led coaching with personalized attention, rigorous test series, 
                and a proven track record of turning aspirations into achievements.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/enroll">
                  <Button variant="hero" size="xl">
                    Enroll Now <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="hero-outline" size="xl">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl opacity-0 animate-fade-up"
            style={{ animationDelay: "1000ms", animationFillMode: "forwards" }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-gold font-display">{s.value}</div>
                <div className="text-sm text-gold-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Courses Preview */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold font-semibold text-sm uppercase tracking-widest">Our Programs</span>
              <h2 className="mt-3 text-foreground text-balance">
                Comprehensive Coaching Programs
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
                From academic excellence to competitive exam success, our programs are 
                designed to bring out the best in every student.
              </p>
            </div>
          </ScrollReveal>
          <div className="w-full max-w-7xl mx-auto px-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[courseAutoplay.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {courses.map((c, i) => (
                  <CarouselItem key={i} className="pl-4 sm:basis-1/2 lg:basis-1/4">
                    <ScrollReveal delay={i * 100}>
                      <Link to="/courses" className="group block h-full">
                        <div className={`h-full p-6 rounded-xl bg-gradient-to-br ${c.color} border border-border/50 hover:shadow-lg transition-shadow duration-300 flex flex-col`}>
                          <c.icon className="h-10 w-10 text-gold mb-4" />
                          <h3 className="text-lg text-foreground">{c.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-grow">{c.desc}</p>
                          <div className="mt-4 text-gold text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                            Learn More <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-4 mt-8 md:hidden">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
              <h2 className="mt-3 text-foreground text-balance">The Wave Academy Advantage</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="flex gap-4 p-6 rounded-xl hover:bg-muted/50 transition-colors duration-300">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-navy flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Faculty */}
      {facultyList && facultyList.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-gold font-semibold text-sm uppercase tracking-widest">Expert Educators</span>
                <h2 className="mt-3 text-foreground text-balance">Meet Our Faculty</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
                  Guided by experienced educators and defence veterans who are passionate about nurturing every student's potential.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facultyList.map((f: any, i: number) => (
                <ScrollReveal key={f.id} delay={i * 100}>
                  <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-gold/30 transition-all duration-300 h-full">
                    {/* Avatar */}
                    {f.photo_url ? (
                      <img src={f.photo_url} alt={f.name} className="w-24 h-24 rounded-full object-cover border-4 border-gold/20 group-hover:border-gold/50 transition-colors mb-4 shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center border-4 border-gold/20 group-hover:border-gold/50 transition-colors mb-4 shadow-md">
                        <GraduationCap className="h-10 w-10 text-gold" />
                      </div>
                    )}

                    {/* Name & subject */}
                    <h3 className="font-display font-bold text-foreground text-base leading-tight">{f.name}</h3>
                    <p className="text-gold font-semibold text-sm mt-1">{f.subject}</p>

                    {/* Qualification */}
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{f.qualification}</p>

                    {/* Experience badge */}
                    {f.experience && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground border border-border">
                        <Clock className="h-3 w-3" /> {f.experience}
                      </span>
                    )}

                    {/* Bio */}
                    {f.bio && (
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed text-pretty">{f.bio}</p>
                    )}

                    {/* Achievement pills */}
                    {f.achievements?.length > 0 && (
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        {f.achievements.slice(0, 3).map((a: string, j: number) => (
                          <span key={j} className="text-xs bg-gold/10 text-gold px-2.5 py-0.5 rounded-full border border-gold/20 font-medium">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="bg-background">
        <Gallery />
        <div className="container mx-auto px-4 pb-20 text-center -mt-12">
          <Link to="/gallery">
            <Button variant="outline" size="lg" className="rounded-full border-gold text-gold hover:bg-gold hover:text-navy transition-all px-8">
              View All Photos <ImageIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-navy">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold font-semibold text-sm uppercase tracking-widest">Testimonials</span>
              <h2 className="mt-3 text-gold-light text-balance">What Our Students Say</h2>
            </div>
          </ScrollReveal>
          <div className="w-full max-w-6xl mx-auto px-12 md:px-0">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full relative"
            >
              <CarouselContent className="-ml-4 md:-ml-8">
                {displayTestimonials.map((t, i) => (
                  <CarouselItem key={i} className="pl-4 md:pl-8 md:basis-1/2 lg:basis-1/3">
                    <ScrollReveal delay={i * 120}>
                      <div className="p-8 rounded-xl bg-navy-light/50 border border-navy-light/30 min-h-[280px] flex flex-col">
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: t.rating || 5 }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                          ))}
                        </div>
                        <p className="text-gold-muted text-sm leading-relaxed flex-1 text-pretty overflow-hidden">"{t.text}"</p>
                        <div className="mt-6 pt-4 border-t border-navy-light/30">
                          <div className="font-semibold text-gold-light text-sm line-clamp-1">{t.name}</div>
                          <div className="text-xs text-gold-muted mt-0.5 line-clamp-1">{t.role}</div>
                        </div>
                      </div>
                    </ScrollReveal>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-navy border-gold/30 text-gold hover:bg-gold hover:text-navy transition-colors items-center justify-center p-0" />
              <CarouselNext className="hidden md:flex -right-12 bg-navy border-gold/30 text-gold hover:bg-gold hover:text-navy transition-colors items-center justify-center p-0" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center bg-navy rounded-2xl p-12 md:p-16">
              <h2 className="text-gold-light text-balance">Ready to Start Your Journey?</h2>
              <p className="mt-4 text-gold-muted max-w-lg mx-auto text-pretty">
                Join thousands of successful students who chose Wave Academy as their launchpad to excellence.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/enroll">
                  <Button variant="gold" size="xl">Enroll Now</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="gold-outline" size="xl">Contact Us</Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
