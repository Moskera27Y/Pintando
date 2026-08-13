-- ─── 1. Levels ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donation_sponsorship_levels (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_en         text NOT NULL,
  name_es         text NOT NULL,
  description_en  text,
  description_es  text,
  min_amount      numeric(10,2) NOT NULL DEFAULT 0,
  max_amount      numeric(10,2),
  button_text_en  text NOT NULL DEFAULT 'Donate',
  button_text_es  text NOT NULL DEFAULT 'Donar',
  button_action   text NOT NULL DEFAULT 'both',
  icon            text NOT NULL DEFAULT 'Award',
  color           text NOT NULL DEFAULT 'blue',
  featured        boolean NOT NULL DEFAULT false,
  status          text NOT NULL DEFAULT 'active',
  display_order   int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donation_sponsorship_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spk_levels_select" ON donation_sponsorship_levels;
CREATE POLICY "spk_levels_select" ON donation_sponsorship_levels
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "spk_levels_insert" ON donation_sponsorship_levels;
CREATE POLICY "spk_levels_insert" ON donation_sponsorship_levels
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "spk_levels_update" ON donation_sponsorship_levels;
CREATE POLICY "spk_levels_update" ON donation_sponsorship_levels
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "spk_levels_delete" ON donation_sponsorship_levels;
CREATE POLICY "spk_levels_delete" ON donation_sponsorship_levels
  FOR DELETE TO authenticated USING (true);

-- ─── 2. Benefits ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donation_sponsorship_benefits (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text_en       text NOT NULL,
  text_es       text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donation_sponsorship_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spk_benefits_select" ON donation_sponsorship_benefits;
CREATE POLICY "spk_benefits_select" ON donation_sponsorship_benefits
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "spk_benefits_insert" ON donation_sponsorship_benefits;
CREATE POLICY "spk_benefits_insert" ON donation_sponsorship_benefits
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "spk_benefits_update" ON donation_sponsorship_benefits;
CREATE POLICY "spk_benefits_update" ON donation_sponsorship_benefits
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "spk_benefits_delete" ON donation_sponsorship_benefits;
CREATE POLICY "spk_benefits_delete" ON donation_sponsorship_benefits
  FOR DELETE TO authenticated USING (true);

-- ─── 3. Junction: benefit ↔ level ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donation_sponsorship_benefit_levels (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  benefit_id  text NOT NULL REFERENCES donation_sponsorship_benefits(id) ON DELETE CASCADE,
  level_id    text NOT NULL REFERENCES donation_sponsorship_levels(id) ON DELETE CASCADE,
  included    boolean NOT NULL DEFAULT false,
  UNIQUE(benefit_id, level_id)
);

ALTER TABLE donation_sponsorship_benefit_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spk_bl_select" ON donation_sponsorship_benefit_levels;
CREATE POLICY "spk_bl_select" ON donation_sponsorship_benefit_levels
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "spk_bl_insert" ON donation_sponsorship_benefit_levels;
CREATE POLICY "spk_bl_insert" ON donation_sponsorship_benefit_levels
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "spk_bl_update" ON donation_sponsorship_benefit_levels;
CREATE POLICY "spk_bl_update" ON donation_sponsorship_benefit_levels
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "spk_bl_delete" ON donation_sponsorship_benefit_levels;
CREATE POLICY "spk_bl_delete" ON donation_sponsorship_benefit_levels
  FOR DELETE TO authenticated USING (true);

-- ─── 4. Section header (single row) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donation_sponsorship_section (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title_en        text NOT NULL DEFAULT 'Become a Community Sponsor',
  title_es        text NOT NULL DEFAULT 'Niveles de Patrocinio',
  subtitle_en     text NOT NULL DEFAULT 'Join us in transforming homes and changing lives.',
  subtitle_es     text NOT NULL DEFAULT 'Únase a nosotros como socio comunitario y transforme vidas.',
  description_en  text,
  description_es  text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donation_sponsorship_section ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spk_section_select" ON donation_sponsorship_section;
CREATE POLICY "spk_section_select" ON donation_sponsorship_section
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "spk_section_update" ON donation_sponsorship_section;
CREATE POLICY "spk_section_update" ON donation_sponsorship_section
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "spk_section_insert" ON donation_sponsorship_section;
CREATE POLICY "spk_section_insert" ON donation_sponsorship_section
  FOR INSERT TO authenticated WITH CHECK (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_spk_levels_order ON donation_sponsorship_levels(display_order);
CREATE INDEX IF NOT EXISTS idx_spk_levels_status ON donation_sponsorship_levels(status);
CREATE INDEX IF NOT EXISTS idx_spk_benefits_order ON donation_sponsorship_benefits(display_order);
CREATE INDEX IF NOT EXISTS idx_spk_bl_benefit ON donation_sponsorship_benefit_levels(benefit_id);
CREATE INDEX IF NOT EXISTS idx_spk_bl_level ON donation_sponsorship_benefit_levels(level_id);

-- ─── Seed: Section header ───────────────────────────────────────────────────
INSERT INTO donation_sponsorship_section (title_en, title_es, subtitle_en, subtitle_es, description_en, description_es)
SELECT 'Become a Community Sponsor', 'Niveles de Patrocinio',
       'Join us in transforming homes and changing lives.',
       'Únase a nosotros como socio comunitario y transforme vidas.',
       'Your sponsorship directly funds home renovations for families in need. Choose the level that fits your commitment and see exactly how your support transforms lives.',
       'Su patrocinio financia directamente renovaciones de hogares para familias necesitadas. Elija el nivel que se ajuste a su compromiso y vea cómo su apoyo transforma vidas.'
WHERE NOT EXISTS (SELECT 1 FROM donation_sponsorship_section);

-- ─── Seed: Levels ───────────────────────────────────────────────────────────
INSERT INTO donation_sponsorship_levels (name_en, name_es, description_en, description_es, min_amount, max_amount, button_text_en, button_text_es, button_action, icon, color, featured, status, display_order)
SELECT * FROM (VALUES
  ('Bronze',   'Bronce',    'Foundation support for community transformations', 'Apoyo fundamental para transformaciones comunitarias', 100, 499, 'Donate', 'Donar', 'both', 'Award', 'orange', false, 'active', 0),
  ('Silver',   'Plata',     'Growing impact with expanded recognition', 'Impacto creciente con reconocimiento expandido', 500, 999, 'Donate', 'Donar', 'both', 'Award', 'blue', false, 'active', 1),
  ('Gold',     'Oro',       'Major contributor status with premium benefits', 'Estatus de contribuyente principal con beneficios premium', 1000, 4999, 'Donate', 'Donar', 'both', 'Award', 'gold', true, 'active', 2),
  ('Platinum', 'Platino',   'Transformative partnership at the highest level', 'Asociación transformadora al más alto nivel', 5000, NULL, 'Donate', 'Donar', 'both', 'Award', 'accent', false, 'active', 3)
) AS v(name_en, name_es, description_en, description_es, min_amount, max_amount, button_text_en, button_text_es, button_action, icon, color, featured, status, display_order)
WHERE NOT EXISTS (SELECT 1 FROM donation_sponsorship_levels);

-- ─── Seed: Benefits ─────────────────────────────────────────────────────────
INSERT INTO donation_sponsorship_benefits (text_en, text_es, display_order)
SELECT * FROM (VALUES
  ('Recognition on our website', 'Reconocimiento en nuestro sitio web', 0),
  ('Personal thank-you letter', 'Carta de agradecimiento personal', 1),
  ('Quarterly impact report', 'Informe trimestral de impacto', 2),
  ('Social media feature', 'Destacado en redes sociales', 3),
  ('Invitation to volunteer days', 'Invitación a días de voluntariado', 4),
  ('Exclusive volunteer day experience', 'Experiencia exclusiva de día de voluntariado', 5),
  ('Logo on project signage', 'Logo en señalización de proyectos', 6),
  ('Annual impact breakfast', 'Desayuno anual de impacto', 7),
  ('Naming opportunity for a room', 'Oportunidad de nombrar una habitación', 8),
  ('Custom partnership package', 'Paquete de asociación personalizado', 9)
) AS v(text_en, text_es, display_order)
WHERE NOT EXISTS (SELECT 1 FROM donation_sponsorship_benefits);

-- ─── Seed: Junction (benefit × level matrix) ────────────────────────────────
INSERT INTO donation_sponsorship_benefit_levels (benefit_id, level_id, included)
SELECT b.id, l.id, true
FROM donation_sponsorship_benefits b
CROSS JOIN donation_sponsorship_levels l
WHERE NOT EXISTS (SELECT 1 FROM donation_sponsorship_benefit_levels)
  AND (
    (l.name_en = 'Bronze'   AND b.display_order <= 3) OR
    (l.name_en = 'Silver'   AND b.display_order <= 5) OR
    (l.name_en = 'Gold'     AND b.display_order <= 7) OR
    (l.name_en = 'Platinum' AND b.display_order <= 9)
  )
ON CONFLICT (benefit_id, level_id) DO NOTHING;

INSERT INTO donation_sponsorship_benefit_levels (benefit_id, level_id, included)
SELECT b.id, l.id, false
FROM donation_sponsorship_benefits b
CROSS JOIN donation_sponsorship_levels l
WHERE NOT EXISTS (
    SELECT 1 FROM donation_sponsorship_benefit_levels bl
    WHERE bl.benefit_id = b.id AND bl.level_id = l.id
  )
ON CONFLICT (benefit_id, level_id) DO NOTHING;