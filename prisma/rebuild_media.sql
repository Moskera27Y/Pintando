-- Rebuild media table for CMS Multimedia + add gallery table
-- The old media table (2 placeholder rows) is dropped and recreated with the
-- full CMS schema. gallery is a brand-new table for the public carousel.

DROP TABLE IF EXISTS "media" CASCADE;

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
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");
CREATE INDEX "media_category_idx" ON "media"("category");
CREATE INDEX "media_status_idx"   ON "media"("status");
CREATE INDEX "media_featured_idx" ON "media"("featured");

CREATE TABLE "gallery" (
  "id"           TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT,
  "imageUrl"     TEXT NOT NULL,
  "thumbnail"    TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "status"       TEXT NOT NULL DEFAULT 'active',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gallery_displayOrder_idx" ON "gallery"("displayOrder");
CREATE INDEX "gallery_status_idx"       ON "gallery"("status");
CREATE INDEX "gallery_featured_idx"     ON "gallery"("featured");
