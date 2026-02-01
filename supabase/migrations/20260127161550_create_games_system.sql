/*
  # Sistema de Gestión de Juegos de Casino

  ## Descripción
  Este sistema permite gestionar juegos de casino (slots, ruletas, bingos, etc.) con toda su información relacionada:
  tipos, temáticas, mecánicas, trailers, denominaciones de apuesta y calificaciones de jugadores.

  ## 1. Tablas de Catálogo (Valores Fijos)
  
  ### `game_volatilities`
  Catálogo de volatilidades de juegos
  - `id` (uuid, PK)
  - `name` (text) - Alta, Baja, Media, Media/Alta, Media/Baja
  - `created_at` (timestamptz)

  ### `game_statuses`
  Catálogo de estados de juegos
  - `id` (uuid, PK)
  - `name` (text) - activo, inactivo, con bugs
  - `created_at` (timestamptz)

  ## 2. Tablas Principales

  ### `game_types`
  Tipos de juegos (slots, ruletas, bingos, etc.)
  - `id` (uuid, PK)
  - `name` (text) - Nombre del tipo
  - `description` (text) - Descripción
  - `thumbnail_url` (text) - URL de imagen
  - `paylines` (integer) - Líneas de pago
  - `max_payout` (text) - Pago máximo
  - `reels_rows` (text) - Configuración reels/rows
  - `hit_frequency` (text) - Frecuencia de aciertos
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `themes`
  Temáticas de juegos (frutas, egipcia, etc.)
  - `id` (uuid, PK)
  - `name` (text) - Nombre de la temática
  - `description` (text) - Descripción
  - `thumbnail_url` (text) - URL de imagen
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `mechanics`
  Mecánicas de juegos (free games, cascadas, etc.)
  - `id` (uuid, PK)
  - `name` (text) - Nombre de la mecánica
  - `description` (text) - Descripción
  - `thumbnail_url` (text) - URL de imagen
  - `video_url` (text) - URL de video explicativo
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `denominations`
  Configuraciones de apuestas para juegos
  - `id` (uuid, PK)
  - `name` (text) - Nombre descriptivo
  - `currency_id` (uuid, FK) - Referencia a expenses_currencies
  - `min_bet` (numeric) - Apuesta mínima
  - `max_bet` (numeric) - Apuesta máxima
  - `available_bets` (numeric[]) - Array de valores de apuesta disponibles
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `games`
  Juegos de casino
  - `id` (uuid, PK)
  - `name` (text) - Nombre del juego
  - `game_type_id` (uuid, FK) - Tipo de juego
  - `trailer_release_date` (date) - Fecha de lanzamiento de trailers
  - `integration_date` (date) - Fecha de integración
  - `rtp` (numeric) - Return to Player (%)
  - `volatility_id` (uuid, FK) - Volatilidad
  - `status_id` (uuid, FK) - Estado
  - `multimedia_pack_url` (text) - Link al pack multimedia
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `trailers`
  Trailers promocionales de juegos
  - `id` (uuid, PK)
  - `game_id` (uuid, FK) - Juego al que pertenece
  - `name` (text) - Nombre del trailer
  - `description` (text) - Descripción
  - `trailer_date` (date) - Fecha del trailer
  - `thumbnail_url` (text) - URL de thumbnail
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `game_ratings`
  Calificaciones de juegos por jugadores
  - `id` (uuid, PK)
  - `game_id` (uuid, FK) - Juego calificado
  - `user_id` (uuid, FK) - Usuario que califica
  - `rating` (integer) - Calificación (1-5 estrellas)
  - `created_at` (timestamptz)
  - UNIQUE constraint en (game_id, user_id) - Un usuario solo puede calificar un juego una vez

  ## 3. Tablas Intermedias (Relaciones N:M)

  ### `games_themes`
  Relación juegos-temáticas
  - `id` (uuid, PK)
  - `game_id` (uuid, FK)
  - `theme_id` (uuid, FK)
  - `created_at` (timestamptz)
  - UNIQUE constraint en (game_id, theme_id)

  ### `games_mechanics`
  Relación juegos-mecánicas
  - `id` (uuid, PK)
  - `game_id` (uuid, FK)
  - `mechanic_id` (uuid, FK)
  - `created_at` (timestamptz)
  - UNIQUE constraint en (game_id, mechanic_id)

  ### `game_denominations`
  Relación juegos-denominaciones
  - `id` (uuid, PK)
  - `game_id` (uuid, FK)
  - `denomination_id` (uuid, FK)
  - `created_at` (timestamptz)
  - UNIQUE constraint en (game_id, denomination_id)

  ## 4. Seguridad
  - RLS habilitado en todas las tablas
  - Políticas para super_admin (acceso total)
  - Políticas de lectura pública para catálogos y datos de juegos
  - Políticas restrictivas para escritura (solo admin)
  - Políticas especiales para game_ratings (usuarios pueden crear sus propias calificaciones)

  ## 5. Índices
  - Índices en todas las foreign keys
  - Índices en campos de búsqueda frecuente (name, status_id, etc.)
*/

-- =====================================================
-- 1. TABLAS DE CATÁLOGO
-- =====================================================

-- Volatilidades de juegos
CREATE TABLE IF NOT EXISTS game_volatilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Estados de juegos
CREATE TABLE IF NOT EXISTS game_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. TABLAS PRINCIPALES
-- =====================================================

-- Tipos de juegos (slots, ruletas, bingos, etc.)
CREATE TABLE IF NOT EXISTS game_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  thumbnail_url text,
  paylines integer,
  max_payout text,
  reels_rows text,
  hit_frequency text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Temáticas de juegos
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mecánicas de juegos
CREATE TABLE IF NOT EXISTS mechanics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Denominaciones (configuraciones de apuesta)
CREATE TABLE IF NOT EXISTS denominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  currency_id uuid NOT NULL REFERENCES expenses_currencies(id) ON DELETE RESTRICT,
  min_bet numeric(15,2) NOT NULL DEFAULT 0,
  max_bet numeric(15,2) NOT NULL DEFAULT 0,
  available_bets numeric(15,2)[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT min_bet_less_than_max CHECK (min_bet <= max_bet)
);

-- Juegos
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  game_type_id uuid REFERENCES game_types(id) ON DELETE RESTRICT,
  trailer_release_date date,
  integration_date date,
  rtp numeric(5,2),
  volatility_id uuid REFERENCES game_volatilities(id) ON DELETE RESTRICT,
  status_id uuid REFERENCES game_statuses(id) ON DELETE RESTRICT,
  multimedia_pack_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT rtp_valid_range CHECK (rtp >= 0 AND rtp <= 100)
);

-- Trailers de juegos
CREATE TABLE IF NOT EXISTS trailers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trailer_date date,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calificaciones de juegos
CREATE TABLE IF NOT EXISTS game_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT rating_valid_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_user_game_rating UNIQUE (game_id, user_id)
);

-- =====================================================
-- 3. TABLAS INTERMEDIAS (N:M)
-- =====================================================

-- Relación juegos-temáticas
CREATE TABLE IF NOT EXISTS games_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  theme_id uuid NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_game_theme UNIQUE (game_id, theme_id)
);

-- Relación juegos-mecánicas
CREATE TABLE IF NOT EXISTS games_mechanics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mechanic_id uuid NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_game_mechanic UNIQUE (game_id, mechanic_id)
);

-- Relación juegos-denominaciones
CREATE TABLE IF NOT EXISTS game_denominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  denomination_id uuid NOT NULL REFERENCES denominations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_game_denomination UNIQUE (game_id, denomination_id)
);

-- =====================================================
-- 4. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_games_name ON games(name);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status_id);
CREATE INDEX IF NOT EXISTS idx_games_volatility ON games(volatility_id);
CREATE INDEX IF NOT EXISTS idx_trailers_game ON trailers(game_id);
CREATE INDEX IF NOT EXISTS idx_game_ratings_game ON game_ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_game_ratings_user ON game_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_games_themes_game ON games_themes(game_id);
CREATE INDEX IF NOT EXISTS idx_games_themes_theme ON games_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_games_mechanics_game ON games_mechanics(game_id);
CREATE INDEX IF NOT EXISTS idx_games_mechanics_mechanic ON games_mechanics(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_game_denominations_game ON game_denominations(game_id);
CREATE INDEX IF NOT EXISTS idx_game_denominations_denomination ON game_denominations(denomination_id);
CREATE INDEX IF NOT EXISTS idx_denominations_currency ON denominations(currency_id);

-- =====================================================
-- 5. FUNCIONES DE ACTUALIZACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_game_types_updated_at') THEN
    CREATE TRIGGER update_game_types_updated_at BEFORE UPDATE ON game_types
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_themes_updated_at') THEN
    CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mechanics_updated_at') THEN
    CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON mechanics
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_denominations_updated_at') THEN
    CREATE TRIGGER update_denominations_updated_at BEFORE UPDATE ON denominations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_games_updated_at') THEN
    CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trailers_updated_at') THEN
    CREATE TRIGGER update_trailers_updated_at BEFORE UPDATE ON trailers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE game_volatilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE denominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE games_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE games_mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_denominations ENABLE ROW LEVEL SECURITY;

-- Políticas para game_volatilities
CREATE POLICY "Anyone can view game volatilities"
  ON game_volatilities FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can insert game volatilities"
  ON game_volatilities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

CREATE POLICY "Only super_admin can update game volatilities"
  ON game_volatilities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

CREATE POLICY "Only super_admin can delete game volatilities"
  ON game_volatilities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para game_statuses
CREATE POLICY "Anyone can view game statuses"
  ON game_statuses FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can insert game statuses"
  ON game_statuses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

CREATE POLICY "Only super_admin can update game statuses"
  ON game_statuses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

CREATE POLICY "Only super_admin can delete game statuses"
  ON game_statuses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para game_types
CREATE POLICY "Anyone can view game types"
  ON game_types FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage game types"
  ON game_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para themes
CREATE POLICY "Anyone can view themes"
  ON themes FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage themes"
  ON themes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para mechanics
CREATE POLICY "Anyone can view mechanics"
  ON mechanics FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage mechanics"
  ON mechanics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para denominations
CREATE POLICY "Anyone can view denominations"
  ON denominations FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage denominations"
  ON denominations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para games
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage games"
  ON games FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para trailers
CREATE POLICY "Anyone can view trailers"
  ON trailers FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage trailers"
  ON trailers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para game_ratings
CREATE POLICY "Anyone can view game ratings"
  ON game_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create their own ratings"
  ON game_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON game_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON game_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage all ratings"
  ON game_ratings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para games_themes
CREATE POLICY "Anyone can view games themes relations"
  ON games_themes FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage games themes relations"
  ON games_themes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para games_mechanics
CREATE POLICY "Anyone can view games mechanics relations"
  ON games_mechanics FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage games mechanics relations"
  ON games_mechanics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );

-- Políticas para game_denominations
CREATE POLICY "Anyone can view game denominations relations"
  ON game_denominations FOR SELECT
  USING (true);

CREATE POLICY "Only super_admin can manage game denominations relations"
  ON game_denominations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role_id = (SELECT id FROM roles WHERE name = 'super_admin')
    )
  );
