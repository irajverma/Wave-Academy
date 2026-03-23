import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  whatsapp_number: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  announcement_text: string | null;
  announcement_active: boolean | null;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching site settings:", error);
        throw error;
      }

      // Default fallback if no settings exist yet
      if (!data) {
        return {
          whatsapp_number: "918808859048",
          contact_email: "info@waveacademy.in",
          contact_phone: "+91 88088 59048",
          address: "123 Education Lane, Knowledge City, India",
          announcement_text: "",
          announcement_active: false,
        } as SiteSettings;
      }

      return data as SiteSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
