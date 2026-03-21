/**
 * Run this file ONCE to seed demo testimonials into Firebase.
 * Usage: just import & call seedTestimonials() from a button or the browser console.
 */

import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEMO_TESTIMONIALS = [
  {
    name: "Aryan Kapoor",
    role: "NDA Selected – 2024",
    text: "Wave Academy's disciplined approach to NDA preparation changed my life. The mock drills, GK sessions, and math modules were top-notch. I cleared NDA in my very first attempt!",
    rating: 5,
    is_active: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Sneha Mahajan",
    role: "CUET AIR 212 – 2024",
    text: "I joined Wave Academy just 4 months before CUET and still managed to score in the top 1%. The teachers were incredibly supportive and always available for doubt-clearing sessions.",
    rating: 5,
    is_active: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Dhruv Patel",
    role: "Class 12 Board Topper – 97%",
    text: "The personalized attention at Wave Academy is unmatched. With small batches of 20 students, every doubt is addressed immediately. My confidence and performance skyrocketed in just one year.",
    rating: 5,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Meera Singh",
    role: "CDS Selected – 2024",
    text: "Wave Academy doesn't just prepare you to pass exams — they build character. The motivation, strategy sessions, and faculty guidance helped me sail through the SSB interview too.",
    rating: 5,
    is_active: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function seedTestimonials() {
  const col = collection(db, "testimonials");
  for (const t of DEMO_TESTIMONIALS) {
    await addDoc(col, t);
    console.log(`✅ Added testimonial: ${t.name}`);
  }
  console.log("🎉 All demo testimonials seeded successfully!");
}
