-- Migration: Create Donation Guide tables
-- Two new tables for the public "Donation Guide" page.
-- Both are admin-managed and read publicly by the anon-key frontend.

-- ─── donation_guide_categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "donation_guide_categories" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "icon"        TEXT NOT NULL DEFAULT 'Heart',
  "color"       TEXT NOT NULL DEFAULT 'blue',
  "imageUrl"    TEXT,
  "items"       JSONB DEFAULT '[]'::jsonb,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "status"      TEXT NOT NULL DEFAULT 'active',
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "donation_guide_categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "donation_guide_categories_sortOrder_idx"
  ON "donation_guide_categories"("sortOrder");
CREATE INDEX IF NOT EXISTS "donation_guide_categories_status_idx"
  ON "donation_guide_categories"("status");

-- ─── donation_guide_hero ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "donation_guide_hero" (
  "id"         TEXT NOT NULL,
  "title"      TEXT NOT NULL,
  "subtitle"   TEXT,
  "imageUrl"   TEXT,
  "buttonText" TEXT NOT NULL DEFAULT 'Donate Now',
  "buttonHref" TEXT NOT NULL DEFAULT '#donacion',
  "pdfUrl"     TEXT,
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "donation_guide_hero_pkey" PRIMARY KEY ("id")
);

-- ─── Seed a single hero row so the public page always has content ──────────
INSERT INTO "donation_guide_hero" ("id", "title", "subtitle")
VALUES ('hero-main', 'Your Donation Guide', 'See exactly how every dollar transforms a family home.')
ON CONFLICT ("id") DO NOTHING;
