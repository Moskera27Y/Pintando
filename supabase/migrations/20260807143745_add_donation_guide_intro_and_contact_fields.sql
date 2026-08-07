-- Add introduction, contactEmail, and emailSubject to Donation Guide
ALTER TABLE "donation_guide_hero"
  ADD COLUMN IF NOT EXISTS "introduction" TEXT;

ALTER TABLE "donation_guide_categories"
  ADD COLUMN IF NOT EXISTS "contactEmail" TEXT NOT NULL DEFAULT 'donations@pintandosuenos.org',
  ADD COLUMN IF NOT EXISTS "emailSubject" TEXT NOT NULL DEFAULT 'Donation Inquiry';

-- Update hero with introduction text
UPDATE "donation_guide_hero"
SET "introduction" = 'Dear Community Partner,

Thank you for supporting Pintando Sueños.

Below you''ll find the materials and services most needed for our renovation projects. Every contribution—whether financial, material, or professional—brings us closer to transforming another family''s home.'
WHERE "id" = 'hero-main';

-- Clear old categories and seed new material-based ones
DELETE FROM "donation_guide_categories";

INSERT INTO "donation_guide_categories" ("id", "title", "description", "icon", "color", "imageUrl", "items", "sortOrder", "status", "contactEmail", "emailSubject") VALUES
(
  'cat-paint',
  'Paint & Painting Supplies',
  'Interior and exterior paint, primers, brushes, rollers, drop cloths, and painting tools to refresh walls and ceilings.',
  'PaintRoller',
  'blue',
  NULL,
  '[
    {"label":"Interior paint (1 gallon)","amount":35,"description":"Latex paint for walls and ceilings"},
    {"label":"Primer (1 gallon)","amount":25,"description":"Sealer for prepared surfaces"},
    {"label":"Paint roller set","amount":15,"description":"Roller frame, covers, and tray"},
    {"label":"Brush set (assorted)","amount":12,"description":"Various sizes for trim and detail"},
    {"label":"Drop cloths (pack of 2)","amount":20,"description":"Reusable canvas protection"},
    {"label":"Painter''s tape (pack of 3)","amount":10,"description":"Clean edge masking tape"}
  ]'::jsonb,
  0,
  'active',
  'donations@pintandosuenos.org',
  'Donation - Paint Supplies'
),
(
  'cat-building',
  'Building & Repair Materials',
  'Lumber, drywall, cement, insulation, roofing materials, and hardware for structural repairs and renovations.',
  'Wrench',
  'green',
  NULL,
  '[
    {"label":"Drywall sheet (4x8)","amount":15,"description":"Standard 1/2-inch thickness"},
    {"label":"Lumber (2x4, 8ft)","amount":8,"description":"Framing and structural use"},
    {"label":"Cement mix (80lb bag)","amount":12,"description":"For foundations and patching"},
    {"label":"Roof shingles (bundle)","amount":35,"description":"Asphalt shingles for roof repair"},
    {"label":"Insulation roll","amount":40,"description":"Fiberglass batt insulation"},
    {"label":"Screws & nails (assorted)","amount":15,"description":"Multi-size hardware box"}
  ]'::jsonb,
  1,
  'active',
  'donations@pintandosuenos.org',
  'Donation - Building Materials'
),
(
  'cat-tools',
  'Tools & Equipment',
  'Power tools, hand tools, ladders, safety gear, and equipment to carry out renovation work efficiently.',
  'Wrench',
  'orange',
  NULL,
  '[
    {"label":"Cordless drill","amount":120,"description":"18V with battery and charger"},
    {"label":"Circular saw","amount":90,"description":"7-1/4 inch blade"},
    {"label":"Extension ladder","amount":80,"description":"6ft aluminum ladder"},
    {"label":"Safety glasses (pack of 6)","amount":25,"description":"ANSI-rated protection"},
    {"label":"Work gloves (pack of 6)","amount":20,"description":"Heavy-duty grip gloves"},
    {"label":"Tool belt","amount":30,"description":"Adjustable multi-pocket belt"}
  ]'::jsonb,
  2,
  'active',
  'donations@pintandosuenos.org',
  'Donation - Tools & Equipment'
),
(
  'cat-giftcards',
  'Gift Cards',
  'Gift cards from home improvement stores allow us to purchase exactly what each project needs.',
  'Heart',
  'gold',
  NULL,
  '[
    {"label":"Home Depot gift card","amount":50,"description":"Any denomination welcome"},
    {"label":"Lowes gift card","amount":50,"description":"Any denomination welcome"},
    {"label":"Walmart gift card","amount":25,"description":"For general supplies"},
    {"label":"Amazon gift card","amount":25,"description":"For online tool purchases"}
  ]'::jsonb,
  3,
  'active',
  'donations@pintandosuenos.org',
  'Donation - Gift Cards'
),
(
  'cat-volunteer',
  'Volunteer Day Essentials',
  'Food, water, sunscreen, first aid supplies, and logistics to support volunteer renovation days.',
  'Sparkles',
  'accent',
  NULL,
  '[
    {"label":"Bottled water (case of 24)","amount":8,"description":"Hydration for volunteer crews"},
    {"label":"Boxed lunch (per volunteer)","amount":12,"description":"Sandwiches, fruit, snacks"},
    {"label":"Sunscreen (bulk pack)","amount":20,"description":"SPF 50 for outdoor work"},
    {"label":"First aid kit","amount":25,"description":"Job-site ready kit"},
    {"label":"T-shirts (pack of 10)","amount":100,"description":"Branded volunteer shirts"}
  ]'::jsonb,
  4,
  'active',
  'donations@pintandosuenos.org',
  'Donation - Volunteer Day Essentials'
),
(
  'cat-professional',
  'Financial & Professional Support',
  'Monetary donations and pro bono professional services: plumbing, electrical, carpentry, and design.',
  'Home',
  'purple',
  NULL,
  '[
    {"label":"Plumbing services (pro bono)","amount":0,"description":"Licensed plumber for a day"},
    {"label":"Electrical services (pro bono)","amount":0,"description":"Licensed electrician for a day"},
    {"label":"Carpentry services (pro bono)","amount":0,"description":"Finish carpentry work"},
    {"label":"Interior design consultation","amount":0,"description":"Space planning and color selection"},
    {"label":"General monetary donation","amount":50,"description":"Funds allocated where most needed"}
  ]'::jsonb,
  5,
  'active',
  'donations@pintandosuenos.org',
  'Donation - Financial & Professional Support'
)
ON CONFLICT ("id") DO NOTHING;
