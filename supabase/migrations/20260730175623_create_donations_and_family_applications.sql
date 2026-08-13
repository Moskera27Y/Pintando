/*
# Create donations and family_applications tables

1. New Tables
- `donations` — records donation pledges from the landing page (individual and corporate).
  - `id` (uuid, pk)
  - `donor_type` (text, not null) — 'individual' | 'corporate'
  - `amount` (numeric, not null) — pledged amount in USD
  - `is_anonymous` (boolean, default false) — donor wishes to remain anonymous
  - `donor_name` (text) — null when anonymous
  - `donor_email` (text) — null when anonymous
  - `organization` (text) — optional, corporate donor company name
  - `frequency` (text, not null default 'one_time') — 'one_time' | 'monthly' | 'annual'
  - `created_at` (timestamptz, default now())

- `family_applications` — multi-step family nomination/intake submissions.
  - `id` (uuid, pk)
  - `applicant_name` (text, not null)
  - `applicant_email` (text, not null)
  - `applicant_phone` (text)
  - `family_name` (text, not null)
  - `address` (text)
  - `city` (text)
  - `state` (text)
  - `spaces` (text) — comma-separated list of spaces needing remodel (kitchen, bathroom, living, etc.)
  - `story` (text, not null) — the family's story (step 3)
  - `media_urls` (jsonb, default '[]') — array of public URLs for uploaded photos/videos in Supabase Storage
  - `status` (text, not null default 'submitted') — workflow status
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- INSERT: allow `anon, authenticated` so the public (anon-key frontend) can submit donations and applications without signing in. This is a public-write landing page.
- SELECT / UPDATE / DELETE: restricted to `authenticated` only, so submissions and donations are NOT publicly readable (privacy — they contain personal contact details). No anon read access is intentional.
- Mixed public-write / private-read design, same as contact_submissions.

3. Storage
- A storage bucket `family-media` is created separately for uploaded photos/videos. Bucket policies allow public uploads via the anon key and public read of uploaded objects.
*/

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_type text NOT NULL CHECK (donor_type IN ('individual','corporate')),
  amount numeric(10,2) NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  donor_name text,
  donor_email text,
  organization text,
  frequency text NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time','monthly','annual')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_donations" ON donations;
CREATE POLICY "anon_insert_donations"
ON donations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_donations" ON donations;
CREATE POLICY "auth_select_donations"
ON donations FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "auth_update_donations" ON donations;
CREATE POLICY "auth_update_donations"
ON donations FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_donations" ON donations;
CREATE POLICY "auth_delete_donations"
ON donations FOR DELETE
TO authenticated
USING (true);

CREATE TABLE IF NOT EXISTS family_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  family_name text NOT NULL,
  address text,
  city text,
  state text,
  spaces text,
  story text NOT NULL,
  media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE family_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_family_applications" ON family_applications;
CREATE POLICY "anon_insert_family_applications"
ON family_applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_family_applications" ON family_applications;
CREATE POLICY "auth_select_family_applications"
ON family_applications FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "auth_update_family_applications" ON family_applications;
CREATE POLICY "auth_update_family_applications"
ON family_applications FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_family_applications" ON family_applications;
CREATE POLICY "auth_delete_family_applications"
ON family_applications FOR DELETE
TO authenticated
USING (true);
