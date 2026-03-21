import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query as fsQuery, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const WhatsAppButton = () => {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const q = fsQuery(collection(db, "site_settings"), limit(1));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty ? null : querySnapshot.docs[0].data();
    },
  });

  const whatsappNumber = settings?.whatsapp_number || "918808859048";

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27m%20interested%20in%20Wave%20Academy%20courses`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      style={{ animation: "pulse-gold 2s infinite" }}
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};
