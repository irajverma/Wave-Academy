import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, Shield } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Faculty", href: "/faculty" },
  { label: "Gallery", href: "/gallery" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-navy-light/30">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <GraduationCap className="h-8 w-8 text-gold transition-transform duration-200 group-hover:scale-110" />
          <span className="font-display text-xl font-bold text-gold-light tracking-tight">
            Wave Academy
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isHashLink = link.href.startsWith("/#");

            return isHashLink ? (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (location.pathname === '/') {
                     e.preventDefault();
                     const targetId = link.href.replace('/#', '');
                     document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold ${
                  location.hash === link.href.replace('/', '') ? "text-gold" : "text-gold-muted"
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold ${
                  location.pathname === link.href ? "text-gold" : "text-gold-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2">
            <Link to="/enroll">
              <Button variant="gold" size="sm">Enroll Now</Button>
            </Link>
            <Link to="/admin" title="Admin Dashboard" className="text-gold-muted hover:text-gold transition-colors ml-4">
              <Shield className="h-5 w-5 hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gold-light p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } bg-navy border-t border-navy-light/30`}
      >
        <div className="px-4 pb-4 pt-2">
          {navLinks.map((link) => {
            const isHashLink = link.href.startsWith("/#");
            return isHashLink ? (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (location.pathname === '/') {
                     e.preventDefault();
                     const targetId = link.href.replace('/#', '');
                     document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setOpen(false);
                }}
                className={`block py-3 font-medium transition-colors duration-200 border-b border-navy-light/20 last:border-0 ${
                  location.hash === link.href.replace('/', '') ? "text-gold" : "text-gold-muted hover:text-gold"
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={`block py-3 font-medium transition-colors duration-200 border-b border-navy-light/20 last:border-0 ${
                  location.pathname === link.href ? "text-gold" : "text-gold-muted hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link to="/enroll" onClick={() => setOpen(false)}>
            <Button variant="gold" className="w-full mt-4">Enroll Now</Button>
          </Link>
          <Link 
            to="/admin" 
            onClick={() => setOpen(false)} 
            className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-navy-light/20 text-gold-muted hover:text-gold transition-colors"
          >
             <Shield className="h-4 w-4" />
             <span className="text-sm font-medium">Admin Access</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
