/**
 * Run this function to seed demo testimonials into Supabase.
 */

import { supabase } from "@/integrations/supabase/client";

const DEMO_TESTIMONIALS = [
  {
    name: "Raj Verma",
    role: "VIT Bhopal",
    text: "Wave Academy provided me with the solid foundation needed to excel in my engineering journey. The faculty's dedication is unparalleled.",
    rating: 5,
    is_active: true,
  },
  {
    name: "Nitya Sukhla",
    role: "BIT Mesra",
    text: "The structured approach to complex subjects helped me clear competitive exams with confidence. Highly recommended!",
    rating: 5,
    is_active: true,
  },
  {
    name: "Ayushi Mishra",
    role: "Book Author & Hon. Political Science",
    text: "A truly inspirational learning environment. The focus on conceptual clarity helped me even in my career as a political science scholar and author.",
    rating: 5,
    is_active: true,
  },
  {
    name: "Akashya Tripathi",
    role: "JEE Mains Cleared",
    text: "I owe my JEE success to the rigorous testing and personalized attention I received at Wave Academy. The teachers are always available for doubts.",
    rating: 5,
    is_active: true,
  },
  {
    name: "Prakash Mishra",
    role: "100 in Maths, 12th Board",
    text: "Scoring a perfect 100 was possible only because of the shortcut methods and constant practice sessions here. Best coaching in town!",
    rating: 5,
    is_active: true,
  },
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
