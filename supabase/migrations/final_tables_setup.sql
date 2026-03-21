-- 1. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    course TEXT NOT NULL,
    phone TEXT NOT NULL,
    class TEXT,
    status TEXT DEFAULT 'pending'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Test Results Table
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    score DECIMAL NOT NULL,
    total_score DECIMAL NOT NULL,
    rank INTEGER,
    remarks TEXT,
    status TEXT DEFAULT 'published'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- 6. Grant basic public access where necessary
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT ON public.test_results TO anon, authenticated;

-- 7. Public Read Policies
DROP POLICY IF EXISTS "Enable read access for all users on courses" ON "public"."courses";
CREATE POLICY "Enable read access for all users on courses" ON "public"."courses" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users on test_results" ON "public"."test_results";
CREATE POLICY "Enable read access for all users on test_results" ON "public"."test_results" FOR SELECT USING (true);

-- 8. Admin Policies (Using the has_role function we built earlier)
DROP POLICY IF EXISTS "Admins can manage courses" ON "public"."courses";
CREATE POLICY "Admins can manage courses" ON "public"."courses" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage enrollments" ON "public"."enrollments";
CREATE POLICY "Admins can manage enrollments" ON "public"."enrollments" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage contacts" ON "public"."contacts";
CREATE POLICY "Admins can manage contacts" ON "public"."contacts" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage test_results" ON "public"."test_results";
CREATE POLICY "Admins can manage test_results" ON "public"."test_results" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Allow anyone to INSERT into enrollments and contacts
DROP POLICY IF EXISTS "Enable insert access for all users on enrollments" ON "public"."enrollments";
CREATE POLICY "Enable insert access for all users on enrollments" ON "public"."enrollments" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert access for all users on contacts" ON "public"."contacts";
CREATE POLICY "Enable insert access for all users on contacts" ON "public"."contacts" FOR INSERT WITH CHECK (true);
