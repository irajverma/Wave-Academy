import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, FileUp, Download } from "lucide-react";
import * as xlsx from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(222, 55%, 18%)", "hsl(43, 72%, 55%)", "hsl(160, 50%, 45%)", "hsl(0, 70%, 55%)", "hsl(220, 60%, 50%)"];

export default function AdminResults() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_name: "", student_email: "", test_name: "", subject: "", score: "", total_marks: "", test_date: "",
  });

  const { data: results, isLoading, isError, error } = useQuery({
    queryKey: ["admin-results"],
    queryFn: async () => {
      const { data, error } = await supabase.from("test_results").select("*").order("test_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        student_name: form.student_name,
        student_email: form.student_email || null,
        test_name: form.test_name,
        subject: form.subject,
        score: Number(form.score),
        total_marks: Number(form.total_marks),
        test_date: form.test_date || undefined,
      };

      if (editId) {
        const { error } = await supabase.from("test_results").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("test_results").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Result updated" : "Result added");
      queryClient.invalidateQueries({ queryKey: ["admin-results"] });
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({ student_name: "", student_email: "", test_name: "", subject: "", score: "", total_marks: "", test_date: "" });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (r: any) => {
    setForm({
      student_name: r.student_name,
      student_email: r.student_email || "",
      test_name: r.test_name,
      subject: r.subject,
      score: r.score.toString(),
      total_marks: r.total_marks.toString(),
      test_date: r.test_date || "",
    });
    setEditId(r.id);
    setShowForm(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("test_results").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Result deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-results"] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info("Analyzing Excel file...");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        // Use cellDates: true to automatically convert Excel serial dates to JS Date objects
        const workbook = xlsx.read(data, { type: "binary", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);

        // Map json to payloads with robust column matching and date formatting
        const payloads = json.map((row: any) => {
          // Normalize keys to lowercase for easier matching
          const normalizedRow: any = {};
          Object.keys(row).forEach(k => {
            normalizedRow[k.toLowerCase().replace(/[\s_]/g, '')] = row[k];
          });

          const score = Number(normalizedRow.score || normalizedRow.marks || row.Score || 0);
          const total = Number(normalizedRow.totalmarks || normalizedRow.total || row.Total || 100);
          
          let formattedDate = new Date().toISOString().split('T')[0];
          const rawDate = row.Date || row.date || normalizedRow.date || normalizedRow.testdate;
          
          if (rawDate) {
            // Handle Excel serial dates (numbers like 45000)
            if (typeof rawDate === 'number' && rawDate > 30000) {
              const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
              if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
              }
            } else {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
              }
            }
          }
          
          return {
            student_name: row.Name || row.StudentName || normalizedRow.studentname || normalizedRow.name || row["Student Name"],
            student_email: row.Email || normalizedRow.email || normalizedRow.studentemail || null,
            test_name: row.Test || row.TestName || normalizedRow.testname || normalizedRow.test || "General Test",
            subject: row.Subject || normalizedRow.subject || "General",
            score: isNaN(score) ? 0 : score,
            total_marks: isNaN(total) ? 100 : total,
            test_date: formattedDate,
          };
        }).filter(p => p.student_name);

        console.log("Bulk Upload Payload Preview:", payloads);

        if (payloads.length === 0) {
          toast.error("No valid student names found in the Excel file!");
          return;
        }

        const { error: insertError } = await supabase.from("test_results").insert(payloads);
        if (insertError) throw insertError;
        
        toast.success(`Successfully imported ${payloads.length} test results!`);
        queryClient.invalidateQueries({ queryKey: ["admin-results"] });
        
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(err.message || "Failed to process Excel file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Student Name": "John Doe",
        "Email": "john@waveacademy.in",
        "Test Name": "Term 1 Midterms",
        "Subject": "Mathematics",
        "Score": 85,
        "Total Marks": 100,
        "Date": new Date().toISOString().split('T')[0],
      }
    ];
    
    const worksheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
    
    xlsx.writeFile(workbook, "Test_Results_Template.xlsx");
    toast.success("Template downloaded!");
  };

  // Analytics
  const subjectData = results && results.length > 0
    ? Object.entries(
        results.reduce((acc: any, r: any) => {
          if (!acc[r.subject]) acc[r.subject] = { total: 0, count: 0 };
          acc[r.subject].total += (r.score / r.total_marks) * 100;
          acc[r.subject].count += 1;
          return acc;
        }, {})
      ).map(([subject, { total, count }]: any) => ({
        subject,
        avg: Math.round(total / count),
      }))
    : [];

  const timelineData = results && results.length > 0
    ? Object.entries(
        results.reduce((acc: any, r: any) => {
          const date = r.test_date;
          if (!acc[date]) acc[date] = { total: 0, count: 0 };
          acc[date].total += (r.score / r.total_marks) * 100;
          acc[date].count += 1;
          return acc;
        }, {})
      )
        .map(([date, { total, count }]: any) => ({ date, avg: Math.round(total / count) }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-10)
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Test Results</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="text-muted-foreground hover:text-foreground border-border bg-card" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" /> Download Template
          </Button>

          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>

          <Button variant="gold" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Result
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 border border-border mb-6 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground font-semibold">{editId ? "Edit Test Result" : "Add Test Result"}</h3>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input placeholder="Student Name" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
            <Input placeholder="Student Email (Optional)" value={form.student_email} onChange={(e) => setForm({ ...form, student_email: e.target.value })} />
            <Input placeholder="Test Name" value={form.test_name} onChange={(e) => setForm({ ...form, test_name: e.target.value })} />
            <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Input placeholder="Score Obtained" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
            <Input placeholder="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
            <Input type="date" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} />
          </div>
          <Button variant="gold" className="mt-4 w-full sm:w-auto" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : editId ? "Update Result" : "Add Result"}
          </Button>
        </div>
      )}

      {/* Analytics Charts */}
      {results && results.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4">Subject-wise Average (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                <XAxis dataKey="subject" fontSize={12} stroke="currentColor" />
                <YAxis domain={[0, 100]} fontSize={12} stroke="currentColor" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="avg" fill="hsl(43, 72%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4">Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                <XAxis dataKey="date" fontSize={12} stroke="currentColor" />
                <YAxis domain={[0, 100]} fontSize={12} stroke="currentColor" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="avg" stroke="hsl(222, 55%, 18%)" strokeWidth={2} dot={{ fill: "hsl(43, 72%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results table */}
      {isLoading ? (
        <div className="text-muted-foreground animate-pulse text-center py-10">Loading results...</div>
      ) : isError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6">
          <h3 className="font-semibold text-lg mb-1">Database Schema Mismatch</h3>
          <p className="text-sm">
            {error?.message || "There was an error communicating with the database table."}
          </p>
        </div>
      ) : !results?.length ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          No test results yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
                <th className="py-3 px-4 font-medium text-foreground">Student</th>
                <th className="py-3 px-4 font-medium text-foreground">Test</th>
                <th className="py-3 px-4 font-medium text-foreground hidden sm:table-cell">Subject</th>
                <th className="py-3 px-4 font-medium text-foreground">Score</th>
                <th className="py-3 px-4 font-medium text-foreground hidden md:table-cell">Date</th>
                <th className="py-3 px-4 font-medium text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground max-w-[120px] sm:max-w-none truncate">{r.student_name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.test_name}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{r.subject}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs border ${(r.score / r.total_marks) >= 0.6 ? "text-emerald-700 bg-emerald-100 border-emerald-200" : "text-red-700 bg-red-100 border-red-200"}`}>
                      {r.score}/{r.total_marks}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{r.test_date}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(r)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(r.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
