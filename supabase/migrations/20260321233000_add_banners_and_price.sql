-- 1. Create courses table (since it was missing)
CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "title" text NOT NULL,
    "category" text NOT NULL,
    "description" text,
    "duration" text,
    "features" text[],
    "is_active" boolean DEFAULT true,
    "price" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- 2. Create test_results table (since it was missing)
CREATE TABLE IF NOT EXISTS "public"."test_results" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "student_name" text NOT NULL,
    "student_email" text,
    "test_name" text NOT NULL,
    "subject" text NOT NULL,
    "score" numeric NOT NULL,
    "total_marks" numeric NOT NULL,
    "test_date" date,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- 3. Create site_banners table
CREATE TABLE IF NOT EXISTS "public"."site_banners" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "image_url" text NOT NULL,
    "title" text,
    "description" text,
    "link" text,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "site_banners_pkey" PRIMARY KEY ("id")
);

-- 4. Set up Row Level Security for all tables
ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."test_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."site_banners" ENABLE ROW LEVEL SECURITY;

-- Select Policies (Public Read)
CREATE POLICY "Enable read access for all users on courses" ON "public"."courses" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on test_results" ON "public"."test_results" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on site_banners" ON "public"."site_banners" FOR SELECT USING (true);

-- All Policies (Admin/Auth Write)
CREATE POLICY "Enable all access for authenticated users on courses" ON "public"."courses" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users on test_results" ON "public"."test_results" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users on site_banners" ON "public"."site_banners" FOR ALL USING (auth.role() = 'authenticated');

-- 5. IMPORTANT: You must create the 'banners' bucket manually via the Supabase Dashboard before these policies take effect!

CREATE POLICY "Banner images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Users can upload banner images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update banner images" ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete banner images" ON storage.objects FOR DELETE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
