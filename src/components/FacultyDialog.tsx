import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, Clock, Award, Star } from "lucide-react";

interface FacultyDialogProps {
  faculty: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FacultyDialog({ faculty, open, onOpenChange }: FacultyDialogProps) {
  if (!faculty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-navy text-gold-muted border-navy-light max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-gold-light">
            Faculty Profile
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 flex flex-col md:flex-row gap-8">
          {/* Left Column: Avatar & Quick Stats */}
          <div className="shrink-0 flex flex-col items-center text-center">
            {faculty.photo_url ? (
              <img
                src={faculty.photo_url}
                alt={faculty.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gold/30 shadow-2xl mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-navy-light flex items-center justify-center border-4 border-gold/20 mb-4 shadow-2xl">
                <GraduationCap className="h-14 w-14 text-gold/40" />
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white leading-tight">{faculty.name}</h3>
            <p className="text-gold font-semibold mt-1">{faculty.subject}</p>
            
            {faculty.experience && (
              <span className="mt-4 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> {faculty.experience} Experience
              </span>
            )}
          </div>

          {/* Right Column: Bio & Achievements */}
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" /> Qualification
              </h4>
              <p className="text-sm text-gold-muted/90 leading-relaxed italic">
                {faculty.qualification}
              </p>
            </div>

            {faculty.bio && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-2">About</h4>
                <p className="text-sm text-gold-muted/80 leading-relaxed whitespace-pre-wrap">
                  {faculty.bio}
                </p>
              </div>
            )}

            {faculty.achievements?.length > 0 && (
              <div className="pt-4 border-t border-navy-light/30">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-gold" /> Key Achievements
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {faculty.achievements.map((a: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gold-muted/70">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-gold/40 shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
