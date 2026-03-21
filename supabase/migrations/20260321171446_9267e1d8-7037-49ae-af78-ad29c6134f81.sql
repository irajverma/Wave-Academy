
-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: only admins can read roles
CREATE POLICY "Admins can read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  class TEXT,
  course TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit enrollment" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view enrollments" ON public.enrollments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update enrollments" ON public.enrollments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Contact submissions table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contacts" ON public.contacts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Test results table
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  student_email TEXT,
  test_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL,
  total_marks NUMERIC NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view their results by email" ON public.test_results FOR SELECT USING (true);
CREATE POLICY "Admins can manage results" ON public.test_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
