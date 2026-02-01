/*
  # Datos Iniciales para Sistema de Jugadores

  ## Descripción
  Inserta los datos iniciales en las tablas catálogo del sistema de jugadores:
  - Estados de jugador (activo, bloqueado, inactivo)
  - Tipos de teléfono (móvil, fijo)
  - Países principales de Latinoamérica y otros
  - Estados/provincias de Argentina

  ## Contenido
  1. Estados de jugador (3 registros)
  2. Tipos de teléfono (2 registros)
  3. Países (20+ países)
  4. Estados de Argentina (24 provincias)
*/

-- =====================================================
-- 1. ESTADOS DE JUGADOR
-- =====================================================

INSERT INTO player_statuses (name, description) VALUES
  ('activo', 'Jugador activo en el sistema'),
  ('bloqueado', 'Jugador bloqueado temporalmente'),
  ('inactivo', 'Jugador inactivo')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. TIPOS DE TELÉFONO
-- =====================================================

INSERT INTO player_phone_types (name) VALUES
  ('móvil'),
  ('fijo')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. PAÍSES
-- =====================================================

INSERT INTO player_countries (name, code, phone_code) VALUES
  ('Argentina', 'AR', '+54'),
  ('Brasil', 'BR', '+55'),
  ('Chile', 'CL', '+56'),
  ('Uruguay', 'UY', '+598'),
  ('Paraguay', 'PY', '+595'),
  ('Bolivia', 'BO', '+591'),
  ('Perú', 'PE', '+51'),
  ('Colombia', 'CO', '+57'),
  ('Venezuela', 'VE', '+58'),
  ('Ecuador', 'EC', '+593'),
  ('México', 'MX', '+52'),
  ('Estados Unidos', 'US', '+1'),
  ('Canadá', 'CA', '+1'),
  ('España', 'ES', '+34'),
  ('Reino Unido', 'GB', '+44'),
  ('Francia', 'FR', '+33'),
  ('Alemania', 'DE', '+49'),
  ('Italia', 'IT', '+39'),
  ('Portugal', 'PT', '+351'),
  ('Países Bajos', 'NL', '+31'),
  ('Bélgica', 'BE', '+32'),
  ('Suiza', 'CH', '+41'),
  ('Austria', 'AT', '+43'),
  ('Suecia', 'SE', '+46'),
  ('Noruega', 'NO', '+47'),
  ('Dinamarca', 'DK', '+45'),
  ('Finlandia', 'FI', '+358'),
  ('Polonia', 'PL', '+48'),
  ('República Checa', 'CZ', '+420'),
  ('Hungría', 'HU', '+36')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 4. ESTADOS/PROVINCIAS DE ARGENTINA
-- =====================================================

-- Primero obtenemos el ID de Argentina
DO $$
DECLARE
  v_argentina_id uuid;
BEGIN
  SELECT id INTO v_argentina_id FROM player_countries WHERE code = 'AR';
  
  IF v_argentina_id IS NOT NULL THEN
    INSERT INTO player_states (country_id, name) VALUES
      (v_argentina_id, 'Buenos Aires'),
      (v_argentina_id, 'Ciudad Autónoma de Buenos Aires'),
      (v_argentina_id, 'Catamarca'),
      (v_argentina_id, 'Chaco'),
      (v_argentina_id, 'Chubut'),
      (v_argentina_id, 'Córdoba'),
      (v_argentina_id, 'Corrientes'),
      (v_argentina_id, 'Entre Ríos'),
      (v_argentina_id, 'Formosa'),
      (v_argentina_id, 'Jujuy'),
      (v_argentina_id, 'La Pampa'),
      (v_argentina_id, 'La Rioja'),
      (v_argentina_id, 'Mendoza'),
      (v_argentina_id, 'Misiones'),
      (v_argentina_id, 'Neuquén'),
      (v_argentina_id, 'Río Negro'),
      (v_argentina_id, 'Salta'),
      (v_argentina_id, 'San Juan'),
      (v_argentina_id, 'San Luis'),
      (v_argentina_id, 'Santa Cruz'),
      (v_argentina_id, 'Santa Fe'),
      (v_argentina_id, 'Santiago del Estero'),
      (v_argentina_id, 'Tierra del Fuego'),
      (v_argentina_id, 'Tucumán')
    ON CONFLICT (country_id, name) DO NOTHING;
  END IF;
END $$;