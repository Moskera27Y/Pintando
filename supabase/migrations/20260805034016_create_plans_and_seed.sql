-- Create the plans table (matches Prisma schema)
CREATE TABLE IF NOT EXISTS "plans" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "tagline" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "stripePriceId" TEXT,
  "benefits" JSONB,
  "icon" TEXT,
  "color" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "plans_active_idx" ON "plans"("active");
CREATE INDEX IF NOT EXISTS "plans_sortOrder_idx" ON "plans"("sortOrder");

-- Enable RLS
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;

-- Public can read all plans; admin API uses service role which bypasses RLS
DROP POLICY IF EXISTS "plans_select_public" ON "plans";
CREATE POLICY "plans_select_public" ON "plans" FOR SELECT
  TO anon, authenticated USING (true);

-- Seed the 3 real membership plans
INSERT INTO "plans" ("id", "name", "description", "tagline", "price", "currency", "stripePriceId", "benefits", "icon", "color", "sortOrder", "active", "createdAt", "updatedAt")
VALUES
  (
    'plan_dreamer_friend',
    'Dreamer Friend',
    'The first step to transform lives. Your monthly support keeps the dream wheel spinning.',
    'The first step to transform lives',
    20.00,
    'USD',
    'price_1U0uUQQKhZHmrcgyoVTpBnVc',
    '["Recognition in our digital community","Access to monthly impact reports","Mention in YouTube video credits"]'::jsonb,
    'Sparkles',
    'from-dream-blue to-primary-600',
    1,
    true,
    now(),
    now()
  ),
  (
    'plan_transformation_sponsor',
    'Transformation Sponsor',
    'Sponsor complete interventions. Your generosity transforms an entire family''s home.',
    'Sponsor complete interventions',
    50.00,
    'USD',
    'price_1U0uVeQKhZHmrcgyn8WurC7f',
    '["Everything in Dreamer Friend","Your name on a renovated home","Exclusive thank-you video from the family","Detailed quarterly report with photos"]'::jsonb,
    'Heart',
    'from-dream-orange to-dream-red',
    2,
    true,
    now(),
    now()
  ),
  (
    'plan_strategic_ally',
    'Strategic Ally',
    'Strategic leadership and CSR visibility. Partner with us to scale social impact regionally.',
    'Strategic leadership and CSR visibility',
    100.00,
    'USD',
    'price_1U0uWjQKhZHmrcgyhiAtWw8M',
    '["Everything in Transformation Sponsor","Your company logo on every sponsored video","Recognition as an official strategic ally","Invitation to events and regional tours","Custom CSR impact report"]'::jsonb,
    'Crown',
    'from-dream-purple to-dream-blue',
    3,
    true,
    now(),
    now()
  )
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "tagline" = EXCLUDED."tagline",
  "price" = EXCLUDED."price",
  "currency" = EXCLUDED."currency",
  "stripePriceId" = EXCLUDED."stripePriceId",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "sortOrder" = EXCLUDED."sortOrder",
  "active" = EXCLUDED."active",
  "updatedAt" = now();
