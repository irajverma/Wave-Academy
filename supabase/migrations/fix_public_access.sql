-- 1. Ensure the anonymous role has permission to query the table
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.site_banners TO anon;
GRANT SELECT ON public.courses TO anon;

-- 2. Make absolutely sure the Row Level Security policy allows reads
DROP POLICY IF EXISTS "Enable read access for all users on site_banners" ON "public"."site_banners";
DROP POLICY IF EXISTS "Public Read Banners" ON "public"."site_banners";

CREATE POLICY "Public Read Banners" 
ON "public"."site_banners" 
FOR SELECT 
TO public 
USING (is_active = true);
