/*
# Create Donation Guide tables

## What changed

Two new tables for a public "Donation Guide" page:
1. `donation_guide_categories` — categories of impact items (e.g. "Kitchen",
   "Bathroom") each with an icon, color, image, and a JSON array of line items
   showing exactly what a donation amount buys.
2. `donation_guide_hero` — a single-row table holding the hero section content
   (title, subtitle, background image, CTA button, optional PDF link).

Both are admin-managed and read publicly by the anon-key frontend.

## 1. donation_guide_categories table (new)

Columns:
- id          text PK (cuid)
- title       text NOT NULL — category name
- description text — optional caption
- icon        text NOT NULL DEFAULT 'Heart' — lucide icon name
- color       text NOT NULL DEFAULT 'blue' — theme color key
- imageUrl    text — optional category image
- items       jsonb DEFAULT '[]' — array of { label, amount, description }
- sortOrder   int  NOT NULL DEFAULT 0
- status      text NOT NULL DEFAULT 'active'
- createdAt   timestamptz NOT NULL DEFAULT now()
- updatedAt   timestamptz NOT NULL DEFAULT now()

Indexes: sortOrder, status

## 2. donation_guide_hero table (new)

Columns:
- id          text PK (cuid)
- title       text NOT NULL
- subtitle    text
- imageUrl    text — hero background image
- buttonText  text NOT NULL DEFAULT 'Donate Now'
- buttonHref  text NOT NULL DEFAULT '#donacion'
- pdfUrl      text — optional downloadable PDF guide
- updatedAt   timestamptz NOT NULL DEFAULT now()

## 3. RLS

Both tables are admin-managed but read publicly by the anon-key frontend
(no-auth public site reads them for rendering). SELECT open to anon+authenticated,
write restricted to authenticated (admin panel sends JWT).

## Important notes

1. Both tables are brand-new — no data loss.
2. No other tables are touched.
*/

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

ALTER TABLE "donation_guide_categories" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_donation_guide_categories" ON "donation_guide_categories";
CREATE POLICY "anon_select_donation_guide_categories"
  ON "donation_guide_categories" FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_donation_guide_categories" ON "donation_guide_categories";
CREATE POLICY "auth_insert_donation_guide_categories"
  ON "donation_guide_categories" FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_donation_guide_categories" ON "donation_guide_categories";
CREATE POLICY "auth_update_donation_guide_categories"
  ON "donation_guide_categories" FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_donation_guide_categories" ON "donation_guide_categories";
CREATE POLICY "auth_delete_donation_guide_categories"
  ON "donation_guide_categories" FOR DELETE
  TO authenticated USING (true);

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

ALTER TABLE "donation_guide_hero" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_donation_guide_hero" ON "donation_guide_hero";
CREATE POLICY "anon_select_donation_guide_hero"
  ON "donation_guide_hero" FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_donation_guide_hero" ON "donation_guide_hero";
CREATE POLICY "auth_insert_donation_guide_hero"
  ON "donation_guide_hero" FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_donation_guide_hero" ON "donation_guide_hero";
CREATE POLICY "auth_update_donation_guide_hero"
  ON "donation_guide_hero" FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_donation_guide_hero" ON "donation_guide_hero";
CREATE POLICY "auth_delete_donation_guide_hero"
  ON "donation_guide_hero" FOR DELETE
  TO authenticated USING (true);

-- ─── Seed a single hero row so the public page always has content ──────────
INSERT INTO "donation_guide_hero" ("id", "title", "subtitle")
VALUES ('hero-main', 'Your Donation Guide', 'See exactly how every dollar transforms a family home.')
ON CONFLICT ("id") DO NOTHING;