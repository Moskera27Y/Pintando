/*
# Storage policies for family-media bucket

1. Purpose
- The `family-media` bucket stores photos and videos uploaded by families during the multi-step
  application form. The public landing page (anon key) must be able to upload files and read them
  back for preview, since there is no sign-in flow.

2. Policies
- SELECT (read): public — anyone can view uploaded media (anon, authenticated).
- INSERT (upload): public — anyone can upload via the anon key.
- UPDATE / DELETE: authenticated only (admin management).
*/

DROP POLICY IF EXISTS "public_read_family_media" ON storage.objects;
CREATE POLICY "public_read_family_media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'family-media');

DROP POLICY IF EXISTS "anon_upload_family_media" ON storage.objects;
CREATE POLICY "anon_upload_family_media"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'family-media');

DROP POLICY IF EXISTS "auth_update_family_media" ON storage.objects;
CREATE POLICY "auth_update_family_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'family-media') WITH CHECK (bucket_id = 'family-media');

DROP POLICY IF EXISTS "auth_delete_family_media" ON storage.objects;
CREATE POLICY "auth_delete_family_media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'family-media');
