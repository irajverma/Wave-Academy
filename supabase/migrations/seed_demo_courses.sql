-- Clear out existing buggy test courses (Be careful! This deletes everything in the courses table!)
DELETE FROM public.courses;

-- Insert beautiful demo courses mapping exactly to what the front page expects
INSERT INTO public.courses (title, category, duration, description, price, features)
VALUES 
(
  'Foundation Course (Classes 5–8)', 
  '5-10', 
  'Full Academic Year', 
  'Building strong fundamentals in Mathematics, Science, and English with concept-based learning and regular assessments.',
  6000,
  '["Conceptual clarity focus", "Weekly tests & feedback", "Olympiad preparation included", "Parent-teacher meetings"]'::JSONB
),
(
  'Board Preparation (Classes 9–10)', 
  '5-10', 
  'Full Academic Year', 
  'Intensive coaching for board exams with a focus on scoring high and building a strong base for competitive exams.',
  8000,
  '["CBSE/State board aligned", "Previous year paper practice", "Subject-wise mock tests", "Doubt resolution sessions"]'::JSONB
),
(
  'Science Stream (PCM / PCB)', 
  '11-12', 
  '2-Year Program', 
  'Comprehensive coaching for Class 11–12 science stream with integrated board and entrance exam preparation.',
  15000,
  '["Board + competitive synergy", "Lab practical guidance", "JEE/NEET foundation", "Performance tracking"]'::JSONB
),
(
  'NDA + CDS Combined Batch', 
  'nda', 
  '1 Year Program', 
  'Dual preparation for NDA and CDS exams with specialized modules for each exam pattern and requirement.',
  20000,
  '["Dual exam strategy", "Physical fitness guidance", "SSB interview prep", "Current affairs module"]'::JSONB
),
(
  'CUET Complete Course', 
  'cuet', 
  '6 Months', 
  'End-to-end preparation for CUET covering domain subjects, general test, and language proficiency sections.',
  12000,
  '["All domain subjects", "General test mastery", "Language section prep", "University selection guidance"]'::JSONB
);
