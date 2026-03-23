/**
 * Run this function to seed demo testimonials into Supabase.
 */

import { supabase } from "@/integrations/supabase/client";

const DEMO_TESTIMONIALS = [
  {
    name: "Aryan Kapoor",
    role: "NDA Selected – 2024",
    text: "Wave Academy's disciplined approach to NDA preparation changed my life. The mock drills, GK sessions, and math modules were top-notch. I cleared NDA in my very first attempt!",
    rating: 5,
    is_active: true,
  },
  {
    name: "Sneha Mahajan",
    role: "CUET AIR 212 – 2024",
    text: "I joined Wave Academy just 4 months before CUET and still managed to score in the top 1%. The teachers were incredibly supportive and always available for doubt-clearing sessions.",
    rating: 5,
    is_active: true,
  },
  {
    name: "Dhruv Patel",
    role: "Class 12 Board Topper – 97%",
    text: "The personalized attention at Wave Academy is unmatched. With small batches of 20 students, every doubt is addressed immediately. My confidence and performance skyrocketed in just one year.",
    rating: 5,
    is_active: true,
  },
  {
    name: "Meera Singh",
    role: "CDS Selected – 2024",
    text: "Wave Academy doesn't just prepare you to pass exams — they build character. The motivation, strategy sessions, and faculty guidance helped me sail through the SSB interview too.",
    rating: 5,
    is_active: true,
  },
];

export async function seedTestimonials() {
  const { error } = await supabase
    .from("testimonials")
    .insert(DEMO_TESTIMONIALS);

  if (error) {
    console.error("❌ Error seeding testimonials:", error);
    throw error;
  }
  
  console.log("🎉 All demo testimonials seeded successfully!");
}
