-- Add 'type' column to contacts table to distinguish enrollment vs contact messages
-- Run this in Supabase SQL Editor

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'contact';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone TEXT;

-- Make sure RLS allows public inserts (for enrollment form)
CREATE POLICY IF NOT EXISTS "Allow public insert contacts"
ON contacts FOR INSERT
WITH CHECK (true);

-- Allow admins to read all contacts
CREATE POLICY IF NOT EXISTS "Allow authenticated read contacts"
ON contacts FOR SELECT
USING (auth.role() = 'authenticated');
