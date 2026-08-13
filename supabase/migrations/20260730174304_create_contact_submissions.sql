/*
# Create contact_submissions table

1. New Tables
- `contact_submissions` — stores messages from the Pintando Sueños landing page contact form (investors, allies, family nominations).
- `id` (uuid, primary key)
- `name` (text, not null) — submitter's full name
- `email` (text, not null) — submitter's email
- `organization` (text) — optional company/organization
- `interest` (text, not null) — type of inquiry: ally, sponsor, family, other
- `message` (text, not null) — the message body
- `created_at` (timestamptz, defaults to now)

2. Security
- Enable RLS on `contact_submissions`.
- INSERT: allow `anon, authenticated` so the public (anon-key frontend) can submit the contact form without signing in.
- SELECT / UPDATE / DELETE: restricted to `authenticated` only, so contact submissions are NOT publicly readable (privacy). No anon read access is intentional — submissions contain private contact details.
- This is a deliberate mixed-policy design: public write, private read.

3. Important Notes
- The landing page has no sign-in screen, so inserts run as the `anon` role and must be permitted.
- Reading submissions later requires an authenticated (admin) session or the service role key server-side.
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  interest text NOT NULL DEFAULT 'other',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public can submit the contact form (insert only).
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
CREATE POLICY "anon_insert_contact"
ON contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users (admins) can read submissions.
DROP POLICY IF EXISTS "auth_select_contact" ON contact_submissions;
CREATE POLICY "auth_select_contact"
ON contact_submissions FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users (admins) can update submissions.
DROP POLICY IF EXISTS "auth_update_contact" ON contact_submissions;
CREATE POLICY "auth_update_contact"
ON contact_submissions FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- Only authenticated users (admins) can delete submissions.
DROP POLICY IF EXISTS "auth_delete_contact" ON contact_submissions;
CREATE POLICY "auth_delete_contact"
ON contact_submissions FOR DELETE
TO authenticated
USING (true);
