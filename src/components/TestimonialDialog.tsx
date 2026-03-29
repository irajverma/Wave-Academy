import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Quote } from "lucide-react";

interface TestimonialDialogProps {
  testimonial: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestimonialDialog({ testimonial, open, onOpenChange }: TestimonialDialogProps) {
  if (!testimonial) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-navy text-gold-muted border-navy-light p-8 overflow-hidden">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-display font-bold text-gold-light flex items-center gap-3">
            <Quote className="h-6 w-6 text-gold opacity-50" />
            Student Story
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="flex gap-1.5">
            {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
          </div>

          {/* Feedback */}
          <div className="relative">
            <p className="text-lg text-white leading-relaxed font-body italic">
              "{testimonial.text}"
            </p>
          </div>

          {/* Student Info */}
          <div className="pt-6 border-t border-navy-light/30 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-gold font-bold text-lg">
                {testimonial.name?.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-gold-light text-lg">
                {testimonial.name}
              </div>
              <div className="text-sm text-gold-muted/70">
                {testimonial.role || "Former Student"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
