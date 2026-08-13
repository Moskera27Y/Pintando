-- Seed donation guide categories with realistic content
-- These are example categories showing how donations transform family homes

INSERT INTO "donation_guide_categories" ("id", "title", "description", "icon", "color", "imageUrl", "items", "sortOrder", "status") VALUES
(
  'cat-kitchen',
  'Cocina de Ensueño',
  'Transformamos cocinas deterioradas en espacios funcionales y seguros donde las familias pueden preparar comidas nutritivas.',
  'Home',
  'blue',
  NULL,
  '[
    {"label":"Estufa de 4 hornillas","amount":450,"description":"Reemplazo de estufa vieja o insegura","urgent":true},
    {"label":"Refrigerador energético","amount":650,"description":"Nevera nueva eficiente","urgent":true},
    {"label":"Gabinete completo","amount":800,"description":"Módulos de almacenamiento"},
    {"label":"Lavaplatos","amount":350,"description":"Fregadero e instalación"}
  ]'::jsonb,
  0,
  'active'
),
(
  'cat-bathroom',
  'Baño Seguro',
  'Reparamos baños con problemas de plomería, moho y accesibilidad para garantizar higiene y dignidad.',
  'Bath',
  'green',
  NULL,
  '[
    {"label":"Inodoro nuevo","amount":250,"description":"Reemplazo completo","urgent":true},
    {"label":"Revestimiento de pared","amount":400,"description":"Eliminación de moho y baldosas nuevas"},
    {"label":"Lavamanos","amount":180,"description":"Instalación de fregadero"},
    {"label":"Barra de apoyo","amount":75,"description":"Accesibilidad para adultos mayores"}
  ]'::jsonb,
  1,
  'active'
),
(
  'cat-bedroom',
  'Dormitorio de Descanso',
  'Creamos espacios de descanso cómodos con camas adecuadas y almacenamiento para niños y adultos.',
  'Bed',
  'gold',
  NULL,
  '[
    {"label":"Cama matrimonial","amount":500,"description":"Colchón y base nueva","urgent":true},
    {"label":"Litera para niños","amount":350,"description":"Estructura de pino macizo"},
    {"label":"Closet organizador","amount":600,"description":"Sistema de almacenamiento"},
    {"label":"Ropa de cama","amount":120,"description":"Juego de sábanas y cobijas"}
  ]'::jsonb,
  2,
  'active'
),
(
  'cat-living',
  'Sala Familiar',
  'Renovamos la sala como el corazón del hogar: un lugar cómodo para reunirse, estudiar y crecer juntos.',
  'Sofa',
  'orange',
  NULL,
  '[
    {"label":"Sofá cómodo","amount":700,"description":"Seccional de 3 plazas","urgent":true},
    {"label":"Mesa de centro","amount":200,"description":"Madera maciza"},
    {"label":"Pintura de paredes","amount":150,"description":"Mano de obra y pintura"},
    {"label":"Lámpara de piso","amount":80,"description":"Iluminación cálida"}
  ]'::jsonb,
  3,
  'active'
),
(
  'cat-repairs',
  'Reparaciones Estructurales',
  'Solucionamos problemas críticos: techos con goteras, pisos dañados y electricidad insegura.',
  'Wrench',
  'accent',
  NULL,
  '[
    {"label":"Reparación de techo","amount":1200,"description":"Impermeabilización completa","urgent":true},
    {"label":"Pisos nuevos","amount":900,"description":"Laminado de alta resistencia"},
    {"label":"Panel eléctrico","amount":450,"description":"Actualización de tablero","urgent":true},
    {"label":"Plomería general","amount":350,"description":"Reparación de fugas"}
  ]'::jsonb,
  4,
  'active'
),
(
  'cat-painting',
  'Pintura y Acabados',
  'Damos vida a los muros con colores cálidos y acabados profesionales que renuevan todo el ambiente.',
  'PaintRoller',
  'purple',
  NULL,
  '[
    {"label":"Pintura interior completa","amount":600,"description":"Toda la casa"},
    {"label":"Una habitación","amount":150,"description":"Paredes y techo"},
    {"label":"Acabados decorativos","amount":250,"description":"Técnicas especiales"},
    {"label":"Materiales básicos","amount":100,"description":"Brochas, rodillos, cinta"}
  ]'::jsonb,
  5,
  'active'
)
ON CONFLICT ("id") DO NOTHING;

-- Update hero with Spanish content and a real image
UPDATE "donation_guide_hero"
SET "title" = 'Guía de Donación',
    "subtitle" = 'Mira exactamente cómo cada dólar transforma el hogar de una familia.',
    "buttonText" = 'Donar ahora',
    "buttonHref" = '#donacion'
WHERE "id" = 'hero-main';
