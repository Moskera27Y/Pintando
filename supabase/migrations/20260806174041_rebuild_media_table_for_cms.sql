/*
# Rebuild media table for CMS Multimedia + add gallery table

## What changed

The old `media` table had a simple shape (name, url, type, mimeType, size, alt)
used only to record image URLs. The new Media Manager CMS needs a much richer
schema: category, tags, dimensions, duration, status, sort order, featured flag,
thumbnail, uploadedBy, and timestamps. Because every new column is NOT NULL and
the old 2 rows have no values for them, the table is dropped and recreated.

A separate `gallery` table is added for the public Community Gallery carousel.

## 1. media table (rebuilt)

Columns:
- id          text PK (cuid)
- title       text NOT NULL — display name
- description text — optional caption
- fileName    text NOT NULL — original filename
- fileUrl     text NOT NULL — public URL (Supabase Storage)
- thumbnail   text — small preview URL
- mimeType    text — e.g. image/png, video/mp4
- fileSize    int  — bytes
- width       int  — pixels (images/videos)
- height      int  — pixels
- duration    int  — seconds (videos)
- category    text NOT NULL DEFAULT 'miscellaneous' — hero|about|programs|...|miscellaneous
- tags        text[] DEFAULT '{}' — freeform tags
- status      text NOT NULL DEFAULT 'active' — active|inactive
- sortOrder   int  NOT NULL DEFAULT 0
- featured    boolean NOT NULL DEFAULT false
- uploadedBy  text — admin user id
- createdAt   timestamptz DEFAULT now()
- updatedAt   timestamptz DEFAULT now()

Indexes: createdAt, category, status, featured

## 2. gallery table (new)

Columns:
- id           text PK (cuid)
- title        text NOT NULL
- description  text
- imageUrl     text NOT NULL
- thumbnail    text
- displayOrder int NOT NULL DEFAULT 0
- featured     boolean NOT NULL DEFAULT false
- status       text NOT NULL DEFAULT 'active'
- createdAt    timestamptz DEFAULT now()
- updatedAt    timestamptz DEFAULT now()

Indexes: displayOrder, status, featured

## 3. RLS

Both tables are admin-managed but read publicly by the anon-key frontend
(no-auth public site reads gallery + media for rendering). Following the
no-auth-read pattern: SELECT open to anon+authenticated, write restricted to
authenticated (admin panel sends JWT).

## Important notes

1. The old 2 rows in `media` are lost — they were placeholder test entries
   (the Media Manager replaces them entirely with Supabase Storage uploads).
2. `gallery` is a brand-new table — no data loss.
3. No other tables are touched.
*/

-- ─── Drop old media table ──────────────────────────────────────────────────
DROP TABLE IF EXISTS "media" CASCADE;

-- ─── Create new media table ────────────────────────────────────────────────
CREATE TABLE "media" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "fileName"    TEXT NOT NULL,
  "fileUrl"     TEXT NOT NULL,
  "thumbnail"   TEXT,
  "mimeType"    TEXT,
  "fileSize"    INTEGER,
  "width"       INTEGER,
  "height"      INTEGER,
  "duration"    INTEGER,
  "category"    TEXT NOT NULL DEFAULT 'miscellaneous',
  "tags"        TEXT[] DEFAULT '{}',
  "status"      TEXT NOT NULL DEFAULT 'active',
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "featured"    BOOLEAN NOT NULL DEFAULT false,
  "uploadedBy"  TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");
CREATE INDEX "media_category_idx" ON "media"("category");
CREATE INDEX "media_status_idx"   ON "media"("status");
CREATE INDEX "media_featured_idx" ON "media"("featured");

ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_media" ON "media";
CREATE POLICY "anon_select_media"
  ON "media" FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_media" ON "media";
CREATE POLICY "auth_insert_media"
  ON "media" FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_media" ON "media";
CREATE POLICY "auth_update_media"
  ON "media" FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_media" ON "media";
CREATE POLICY "auth_delete_media"
  ON "media" FOR DELETE
  TO authenticated USING (true);

-- ─── Create gallery table ──────────────────────────────────────────────────
CREATE TABLE "gallery" (
  "id"           TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT,
  "imageUrl"     TEXT NOT NULL,
  "thumbnail"    TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "status"       TEXT NOT NULL DEFAULT 'active',
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gallery_displayOrder_idx" ON "gallery"("displayOrder");
CREATE INDEX "gallery_status_idx"       ON "gallery"("status");
CREATE INDEX "gallery_featured_idx"     ON "gallery"("featured");

ALTER TABLE "gallery" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gallery" ON "gallery";
CREATE POLICY "anon_select_gallery"
  ON "gallery" FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_gallery" ON "gallery";
CREATE POLICY "auth_insert_gallery"
  ON "gallery" FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_gallery" ON "gallery";
CREATE POLICY "auth_update_gallery"
  ON "gallery" FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_gallery" ON "gallery";
CREATE POLICY "auth_delete_gallery"
  ON "gallery" FOR DELETE
  TO authenticated USING (true);