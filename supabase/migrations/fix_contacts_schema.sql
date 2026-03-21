-- Create the contacts table if it completely does not exist
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to avoid conflicts
DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;

-- Secure policies for contacts
CREATE POLICY "Public can insert contacts" ON public.contacts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view all contacts" ON public.contacts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
