import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    whatsapp_number: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    announcement_text: "",
    announcement_active: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp_number: settings.whatsapp_number || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        address: settings.address || "",
        announcement_text: settings.announcement_text || "",
        announcement_active: settings.announcement_active || false,
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const payload = {
        ...newData,
        id: settings?.id, // Keep the same ID if updating
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground mb-6">Site Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Update the global contact details shown across the website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number (include country code, no spaces)</Label>
              <Input 
                id="whatsapp" 
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="e.g. 918808859048"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Public Contact Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Public Contact Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Textarea 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcement Banner</CardTitle>
            <CardDescription>Manage the banner displayed at the top of the Home Page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="banner-active" 
                checked={formData.announcement_active}
                onCheckedChange={(checked) => setFormData({ ...formData, announcement_active: checked })}
              />
              <Label htmlFor="banner-active">Show Announcement Banner</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-text">Announcement Text</Label>
              <Textarea 
                id="banner-text" 
                value={formData.announcement_text}
                onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
                placeholder="Registration for 2026 is now open!"
                disabled={!formData.announcement_active}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateSettings.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
