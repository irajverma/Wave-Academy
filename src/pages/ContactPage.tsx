import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("contacts").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      message: form.message.trim(),
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  return (
    <div className="pt-16">
      <section className="bg-navy py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl opacity-0 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">Get in Touch</span>
            <h1 className="mt-3 text-gold-light text-balance">Contact Us</h1>
            <p className="mt-4 text-gold-muted text-lg leading-relaxed">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            <ScrollReveal direction="left" className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" maxLength={255} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 88088 59048" maxLength={15} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    rows={5}
                    maxLength={1000}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <Button type="submit" variant="gold" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"} <Send className="h-4 w-4" />
                </Button>
              </form>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200} className="lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <h3 className="text-foreground mb-4">Contact Information</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Address</div>
                        <div className="text-sm text-muted-foreground">123 Education Lane, Knowledge City, India</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">+91 88088 59048</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">info@waveacademy.in</div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl overflow-hidden border border-border">
                  <iframe
                    title="Wave Academy Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.5!2d80.94!3d26.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDUxJzAwLjAiTiA4MMKwNTYnMjQuMCJF!5e0!3m2!1sen!2sin!4v1"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
