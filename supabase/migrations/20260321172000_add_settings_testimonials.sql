-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number text NOT NULL DEFAULT '919876543210',
  contact_email text,
  contact_phone text,
  address text,
  announcement_text text,
  announcement_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a default row
INSERT INTO public.site_settings (whatsapp_number, contact_email, contact_phone, address, announcement_text, announcement_active)
VALUES (
  '919876543210', 
  'support@waveacademy.com', 
  '+91 98765 43210', 
  '123 Education Lane, Learning City', 
  'Welcome to Wave Academy! Registration for 2026 is now open.', 
  true
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default testimonials
INSERT INTO public.testimonials (name, role, text, rating, is_active)
VALUES 
('Arjun Mehta', 'NDA Selected, 2024', 'Wave Academy''s structured approach and mock tests were instrumental in my NDA selection. The faculty truly cares about each student''s success.', 5, true),
('Priya Sharma', 'CUET Topper, 2024', 'The CUET preparation here was outstanding. From strategy sessions to daily practice, everything was perfectly organized.', 5, true),
('Rahul Verma', 'Class 12, Board Topper', 'I scored 96% in my boards thanks to Wave Academy. The teachers made even the toughest concepts feel simple.', 5, true);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access for testimonials" ON public.testimonials FOR SELECT USING (true);

-- Admin full access policies
CREATE POLICY "Admin full access for site_settings" ON public.site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);
CREATE POLICY "Admin full access for testimonials" ON public.testimonials FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);
