import { Link } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";

export const Footer = () => (
  <footer className="bg-navy text-gold-muted">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-7 w-7 text-gold" />
            <span className="font-display text-lg font-bold text-gold-light">
              Wave Academy
            </span>
          </div>
          <p className="text-sm leading-relaxed text-pretty">
            Empowering students from Classes 5–12 with expert coaching for NDA, CUET, 
            and Sainik School preparation since 2015.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-semibold text-gold mb-4 text-base">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Courses", href: "/courses" },
              { label: "About Us", href: "/#about" },
              { label: "Contact", href: "/contact" },
              { label: "Enroll Now", href: "/enroll" },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Programs */}
        <div>
          <h4 className="font-display font-semibold text-gold mb-4 text-base">Programs</h4>
          <ul className="space-y-2 text-sm">
            {["Classes 5–10", "Classes 11–12", "NDA Preparation", "CUET Coaching", "Sainik School"].map(
              (p) => (
                <li key={p}>{p}</li>
              )
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold text-gold mb-4 text-base">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              123 Education Lane, Knowledge City, India
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold shrink-0" />
              +91 88088 59048
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold shrink-0" />
              info@waveacademy.in
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-navy-light/30 text-center text-xs flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>© {new Date().getFullYear()} Wave Academy. All rights reserved.</span>
        <span className="hidden sm:inline text-navy-light/40">•</span>
        <span className="opacity-80">Made with ❤️ by Raj</span>
      </div>
    </div>
  </footer>
);
