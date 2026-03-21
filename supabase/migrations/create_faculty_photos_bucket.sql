-- Run this in your Supabase SQL Editor to create the faculty-photos storage bucket

-- Create the bucket (public so photos are accessible on the website)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faculty-photos',
  'faculty-photos',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Public read faculty photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'faculty-photos');

-- Allow authenticated users (admins) to upload
CREATE POLICY "Admins can upload faculty photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'faculty-photos');

-- Allow authenticated users to update/replace photos
CREATE POLICY "Admins can update faculty photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'faculty-photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Admins can delete faculty photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'faculty-photos');
