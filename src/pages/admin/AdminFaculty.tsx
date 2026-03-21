import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, query as fsQuery, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, GraduationCap, Sparkles, ImagePlus, Loader2 } from "lucide-react";

const DEMO_FACULTY = [
  {
    name: "Satendra Singh",
    subject: "NDA & Defence Strategy",
    qualification: "B.Sc. (Defence Studies), Ex-NDA Officer",
    experience: "15+ years",
    bio: "Mr. Satendra Singh is the founder and lead mentor at Wave Academy. With over 15 years of experience training defence aspirants, he has guided hundreds of students to NDA, CDS, and Sainik School success.",
    achievements: ["NDA Cleared – Top 10", "500+ Defence Selections", "Founder, Wave Academy"],
    photo_url: "/satendra-singh.jpg",
    is_active: true,
    order: 1,
    created_at: new Date().toISOString(),
  },
  {
    name: "Dr. Priya Menon",
    subject: "Science (Physics & Chemistry)",
    qualification: "Ph.D. in Physics, IISc Bangalore",
    experience: "12 years",
    bio: "PhD from IISc Bangalore, Dr. Menon brings research-level depth to classroom teaching. Her simplified approach has helped hundreds of students ace board exams and JEE.",
    achievements: ["National Science Olympiad Mentor", "Author of 3 textbooks", "IISc Research Fellow"],
    photo_url: "",
    is_active: true,
    order: 2,
    created_at: new Date().toISOString(),
  },
  {
    name: "Mr. Anil Verma",
    subject: "English & CUET Preparation",
    qualification: "M.A. English Literature (DU), B.Ed.",
    experience: "10 years",
    bio: "Specializing in CUET Language & General Test preparation, Mr. Verma has a reputation for making English grammar and comprehension approachable and enjoyable.",
    achievements: ["95%+ CUET success rate", "Former DU Lecturer", "IELTS Band 8 Certified"],
    photo_url: "",
    is_active: true,
    order: 3,
    created_at: new Date().toISOString(),
  },
  {
    name: "Ms. Kavita Joshi",
    subject: "Mathematics (Classes 5–10)",
    qualification: "M.Sc. Mathematics, B.Ed.",
    experience: "9 years",
    bio: "Ms. Joshi is known for her ability to build strong mathematical foundations in young students. Her unique visual-learning methods make even complex concepts intuitive.",
    achievements: ["State Topper Coach (2022, 2023)", "100% pass rate for 5 years", "CBSE Paper Setter"],
    photo_url: "",
    is_active: true,
    order: 4,
    created_at: new Date().toISOString(),
  },
];

export default function AdminFaculty() {
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    name: "", subject: "", qualification: "", experience: "", bio: "", achievements: "", photo_url: "", is_active: true, order: 1,
  });

  const { data: faculty, isLoading } = useQuery({
    queryKey: ["faculty-admin"],
    queryFn: async () => {
      const q = fsQuery(collection(db, "faculty"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        subject: form.subject,
        qualification: form.qualification,
        experience: form.experience,
        bio: form.bio,
        achievements: form.achievements.split("\n").map(s => s.trim()).filter(Boolean),
        photo_url: form.photo_url,
        is_active: form.is_active,
        order: Number(form.order),
      };
      if (editId) {
        await setDoc(doc(db, "faculty", editId), payload, { merge: true });
      } else {
        await addDoc(collection(db, "faculty"), { ...payload, created_at: new Date().toISOString() });
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Teacher updated!" : "Teacher added!");
      queryClient.invalidateQueries({ queryKey: ["faculty-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "faculty", id));
    },
    onSuccess: () => {
      toast.success("Teacher removed");
      queryClient.invalidateQueries({ queryKey: ["faculty-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", subject: "", qualification: "", experience: "", bio: "", achievements: "", photo_url: "", is_active: true, order: 1 });
    setEditId(null);
    setShowForm(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      // Compress image client-side using canvas — no server upload needed
      const compressed = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const MAX = 400; // max width/height for profile photos
            const scale = Math.min(MAX / img.width, MAX / img.height, 1);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          };
          img.onerror = reject;
          img.src = ev.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setForm(prev => ({ ...prev, photo_url: compressed }));
      toast.success("Photo ready!");
    } catch (err: any) {
      toast.error("Failed to process image");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const startEdit = (t: any) => {
    setForm({
      name: t.name || "",
      subject: t.subject || "",
      qualification: t.qualification || "",
      experience: t.experience || "",
      bio: t.bio || "",
      achievements: (t.achievements || []).join("\n"),
      photo_url: t.photo_url || "",
      is_active: t.is_active !== false,
      order: t.order ?? 1,
    });
    setEditId(t.id);
    setShowForm(true);
  };

  const seedDemoFaculty = async () => {
    try {
      for (const f of DEMO_FACULTY) {
        await addDoc(collection(db, "faculty"), f);
      }
      toast.success("4 demo teachers added!");
      queryClient.invalidateQueries({ queryKey: ["faculty-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold font-display text-foreground">Manage Faculty</h1>
        <div className="flex flex-wrap items-center gap-2">
          {faculty?.length === 0 && (
            <Button variant="outline" onClick={seedDemoFaculty}>
              <Sparkles className="w-4 h-4 mr-2" /> Seed Demo Faculty
            </Button>
          )}
          <Button variant="gold" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Teacher
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 border border-border mb-8 animate-fade-up">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-foreground text-lg">{editId ? "Edit Teacher" : "Add New Teacher"}</h3>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
              <Input placeholder="e.g. Dr. Priya Menon" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Subject Expertise *</label>
              <Input placeholder="e.g. Physics & Chemistry" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Qualification *</label>
              <Input placeholder="e.g. Ph.D. Physics, IISc Bangalore" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Years of Experience</label>
              <Input placeholder="e.g. 12 years" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground mb-1 block">Bio / About</label>
              <Textarea placeholder="Short description about the teacher..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground mb-1 block">Achievements (one per line)</label>
              <Textarea placeholder={"IIT Delhi Graduate\nNDA Expert Trainer\nState Topper Coach"} value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} rows={4} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">Teacher Photo</label>
              <div className="flex items-center gap-4">
                {/* Live preview */}
                {form.photo_url ? (
                  <div className="relative shrink-0">
                    <img src={form.photo_url} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gold/30" />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, photo_url: '' }))}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center shrink-0">
                    <GraduationCap className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><ImagePlus className="h-4 w-4 mr-2" /> {form.photo_url ? 'Change Photo' : 'Upload Photo'}</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">Or paste a URL directly:</p>
                  <Input
                    placeholder="https://..."
                    value={form.photo_url}
                    onChange={e => setForm({ ...form, photo_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Display Order</label>
              <Input type="number" min="1" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-gold" />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">Visible on website</label>
            </div>
          </div>
          <Button variant="gold" className="mt-5 w-full sm:w-auto" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : editId ? "Update Teacher" : "Add Teacher"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse text-center py-10">Loading faculty...</div>
      ) : !faculty?.length ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No teachers added yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {faculty.map((t: any) => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-gold/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border-2 border-gold/20">
                      <GraduationCap className="h-6 w-6 text-gold" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{t.name}</p>
                    <p className="text-xs text-gold">{t.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(t)} className="p-1.5 rounded hover:bg-muted transition-colors">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { if (confirm("Remove this teacher?")) deleteMutation.mutate(t.id); }} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{t.bio}</p>

              <div className="space-y-1">
                <p className="text-xs text-foreground font-medium">{t.qualification}</p>
                {t.experience && <p className="text-xs text-muted-foreground">🕒 {t.experience} experience</p>}
              </div>

              {t.achievements?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {t.achievements.slice(0, 3).map((a: string, i: number) => (
                    <span key={i} className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">{a}</span>
                  ))}
                </div>
              )}

              <span className={`text-xs px-2 py-0.5 rounded-full border ${t.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"}`}>
                {t.is_active ? "Visible" : "Hidden"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
