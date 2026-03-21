-- Force add all missing columns to the courses table
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure RLS covers the new logic
DROP POLICY IF EXISTS "Public Read Courses" ON public.courses;
CREATE POLICY "Public Read Courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_active = true);
