import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GraduationCap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const courseOptions = [
  "Foundation (Classes 5–8)",
  "Board Prep (Classes 9–10)",
  "Science 11–12 (PCM)",
  "Science 11–12 (PCB)",
  "Commerce 11–12",
  "NDA Coaching",
  "NDA + CDS Combined",
  "CUET Preparation",
  "Sainik School Entrance",
];

export default function EnrollPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", class: "", course: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.course) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);

    try {
      // Insert into enrollments table
      const { error: enrollError } = await supabase.from("enrollments").insert({
        student_name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        class: form.class.trim() || null,
        course: form.course,
      });

      if (enrollError) {
        console.error("Enrollment insert error:", enrollError);
      }

      // Also insert into contacts so admin can see it in one place
      const { error: contactError } = await supabase.from("contacts").insert({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        message: `📚 Enrollment Request\nCourse: ${form.course}\nCurrent Class: ${form.class || "Not specified"}`,
        type: "enrollment",
      });

      if (contactError) {
        console.error("Contact insert error:", contactError);
        // If both fail, show error
        if (enrollError) {
          toast.error("Submission failed. Please try again.");
          return;
        }
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-gold" />
          </div>
          <h2 className="text-foreground">Enrollment Submitted!</h2>
          <p className="mt-3 text-muted-foreground">
            Thank you, {form.name}. Our team will contact you within 24 hours to confirm your enrollment.
          </p>
          <Button variant="gold" size="lg" className="mt-8" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", class: "", course: "" }); }}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <section className="bg-navy py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl opacity-0 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Join Us</span>
            <h1 className="mt-3 text-gold-light text-balance">Enroll Now</h1>
            <p className="mt-4 text-gold-muted text-lg">Fill out the form below and take the first step toward academic excellence.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="h-6 w-6 text-gold" />
                <h3 className="text-foreground">Student Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student's full name" maxLength={100} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" maxLength={255} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone *</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 88088 59048" maxLength={15} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Current Class</label>
                <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="e.g., Class 10" maxLength={20} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Course *</label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a course</option>
                  {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Enrollment"}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
