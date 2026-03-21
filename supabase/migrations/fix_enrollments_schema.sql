-- Safely add all required missing columns to the enrollments table
ALTER TABLE public.enrollments 
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS class TEXT;

-- Drop older policies if exist and re-create for safety
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.enrollments;

CREATE POLICY "Admins can manage enrollments" ON public.enrollments 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
