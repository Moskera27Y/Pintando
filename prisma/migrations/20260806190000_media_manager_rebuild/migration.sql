-- Migration: Media Manager rebuild
-- Renames columns in the media table to match the new Media Manager spec.
-- Does NOT touch any other table.

-- Rename fileUrl -> blobUrl
ALTER TABLE "media" RENAME COLUMN "fileUrl" TO "blobUrl";

-- Rename thumbnail -> thumbnailUrl
ALTER TABLE "media" RENAME COLUMN "thumbnail" TO "thumbnailUrl";

-- Rename sortOrder -> displayOrder
ALTER TABLE "media" RENAME COLUMN "sortOrder" TO "displayOrder";

-- Add index on displayOrder (old sortOrder index is auto-renamed by Postgres)
CREATE INDEX IF NOT EXISTS "media_displayOrder_idx" ON "media"("displayOrder");

-- Drop old sortOrder index if it still exists under the old name
DROP INDEX IF EXISTS "media_sortOrder_idx";
