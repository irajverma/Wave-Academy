import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, GraduationCap, Phone, Mail, Calendar, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Tab = "contacts" | "enrollments";

export default function AdminContacts() {
  const [activeTab, setActiveTab] = useState<Tab>("enrollments");

  const { data: allContacts, isLoading, isError, error } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    retry: 1,
  });
  
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: (err: any) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  const contacts = (allContacts || []).filter((c: any) => c.type !== "enrollment");
  const enrollments = (allContacts || []).filter((c: any) => c.type === "enrollment");

  const tabs = [
    { id: "enrollments" as Tab, label: "Enrollment Requests", icon: GraduationCap, count: enrollments.length, color: "text-gold" },
    { id: "contacts" as Tab, label: "Contact Messages", icon: MessageSquare, count: contacts.length, color: "text-blue-500" },
  ];

  const activeList = activeTab === "enrollments" ? enrollments : contacts;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Inbox</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-gold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ""}`} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-muted-foreground animate-pulse py-8 text-center">Loading...</div>
      ) : isError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl">
          <h3 className="font-semibold mb-1">Database Error</h3>
          <p className="text-sm">{(error as any)?.message || "Could not load data."}</p>
          <p className="text-sm mt-2">Make sure the <code>contacts</code> table has a <code>type</code> column (TEXT, nullable). Run this in Supabase SQL Editor:<br />
            <code className="text-xs bg-muted px-2 py-0.5 rounded">ALTER TABLE contacts ADD COLUMN IF NOT EXISTS type TEXT;</code>
          </p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          {activeTab === "enrollments" ? (
            <>
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No enrollment requests yet.</p>
            </>
          ) : (
            <>
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No contact messages yet.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeList.map((c: any) => (
            <div
              key={c.id}
              className={`bg-card rounded-xl p-5 border transition-shadow hover:shadow-md ${
                activeTab === "enrollments" ? "border-gold/20" : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left: identity */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    activeTab === "enrollments" ? "bg-gold/10" : "bg-blue-500/10"
                  }`}>
                    {activeTab === "enrollments"
                      ? <GraduationCap className="h-5 w-5 text-gold" />
                      : <MessageSquare className="h-5 w-5 text-blue-500" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {c.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {c.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        activeTab === "enrollments"
                          ? "bg-gold/10 text-gold border-gold/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-200"
                      }`}>
                        {activeTab === "enrollments" ? "Enrollment" : "Message"}
                      </span>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Delete"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === c.id 
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />
                            }
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-popover border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              This action cannot be undone. This will permanently delete the entry from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-muted text-foreground border-border hover:bg-muted/80">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                deleteMutation.mutate(c.id);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {c.created_at && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

              {/* Message / Enrollment details */}
              {c.message && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{c.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
