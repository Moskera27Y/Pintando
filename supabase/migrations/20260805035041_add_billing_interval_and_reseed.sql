-- Add billingInterval column
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "billingInterval" TEXT NOT NULL DEFAULT 'monthly';

-- Delete any generic plans
DELETE FROM "plans" WHERE "name" IN ('Mensual', 'Trimestral', 'Anual', 'mensual', 'trimestral', 'anual');

-- Upsert the 3 official plans with updated data
INSERT INTO "plans" ("id", "name", "description", "tagline", "price", "currency", "billingInterval", "stripePriceId", "benefits", "icon", "color", "sortOrder", "active", "createdAt", "updatedAt")
VALUES
  (
    'plan_dreamer_friend',
    'Dreamer Friend',
    'The first step to transform lives. Your monthly support keeps the dream wheel spinning.',
    'The first step to transform lives',
    20.00, 'USD', 'monthly',
    'price_1U0uUQQKhZHmrcgyoVTpBnVc',
    '["Monthly impact report","Recognition on our supporters page","Exclusive newsletter","Early access to community events"]'::jsonb,
    'Heart', 'blue', 1, true, now(), now()
  ),
  (
    'plan_transformation_sponsor',
    'Transformation Sponsor',
    'Sponsor complete interventions. Your generosity transforms an entire family''s home.',
    'Sponsor complete interventions',
    50.00, 'USD', 'monthly',
    'price_1U0uVeQKhZHmrcgyn8WurC7f',
    '["Everything included in Dreamer Friend","Sponsor a community art initiative","Quarterly impact report","Invitation to exclusive events"]'::jsonb,
    'Sparkles', 'purple', 2, true, now(), now()
  ),
  (
    'plan_strategic_ally',
    'Strategic Ally',
    'Strategic leadership and CSR visibility. Partner with us to scale social impact regionally.',
    'Strategic leadership and CSR visibility',
    100.00, 'USD', 'monthly',
    'price_1U0uWjQKhZHmrcgyhiAtWw8M',
    '["Everything included in Transformation Sponsor","Strategic partner recognition","Direct communication with the foundation","Featured on the website","Annual impact meeting"]'::jsonb,
    'Award', 'gold', 3, true, now(), now()
  )
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "tagline" = EXCLUDED."tagline",
  "price" = EXCLUDED."price",
  "currency" = EXCLUDED."currency",
  "billingInterval" = EXCLUDED."billingInterval",
  "stripePriceId" = EXCLUDED."stripePriceId",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "sortOrder" = EXCLUDED."sortOrder",
  "active" = EXCLUDED."active",
  "updatedAt" = now();
