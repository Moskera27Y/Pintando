/*
# Create media storage bucket for CMS Multimedia

## What changed
- Creates a public `media` storage bucket (50MB limit) for the Media Manager CMS.
- Adds storage policies: public read, authenticated upload/update/delete.

## Notes
- The existing `family-media` bucket is untouched.
- Public read means the anon-key frontend can load images without auth.
- Writes require an authenticated session (admin panel).
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY[
    'image/jpeg','image/png','image/webp','image/svg+xml','image/gif',
    'video/mp4','video/quicktime','video/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg','image/png','image/webp','image/svg+xml','image/gif',
    'video/mp4','video/quicktime','video/webm',
    'application/pdf'
  ];

-- Public read
DROP POLICY IF EXISTS "anon_read_media_bucket" ON storage.objects;
CREATE POLICY "anon_read_media_bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

-- Authenticated insert
DROP POLICY IF EXISTS "auth_insert_media_bucket" ON storage.objects;
CREATE POLICY "auth_insert_media_bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Authenticated update
DROP POLICY IF EXISTS "auth_update_media_bucket" ON storage.objects;
CREATE POLICY "auth_update_media_bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

-- Authenticated delete
DROP POLICY IF EXISTS "auth_delete_media_bucket" ON storage.objects;
CREATE POLICY "auth_delete_media_bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');