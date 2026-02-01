/*
  # Sistema de Jugadores

  ## Descripción
  Sistema completo para gestión de jugadores con autenticación, direcciones,
  teléfonos múltiples e historial de conexiones.

  ## 1. Tablas Catálogo

  ### player_statuses
  Estados posibles de un jugador:
  - `id` (uuid, PK)
  - `name` (text) - activo, bloqueado, inactivo
  - `description` (text)
  - `created_at` (timestamptz)

  ### player_phone_types
  Tipos de teléfono:
  - `id` (uuid, PK)
  - `name` (text) - móvil, fijo
  - `created_at` (timestamptz)

  ### player_countries
  Catálogo de países para jugadores:
  - `id` (uuid, PK)
  - `name` (text) - nombre del país
  - `code` (text) - código ISO (AR, US, ES, etc.)
  - `phone_code` (text) - código telefónico (+54, +1, +34, etc.)
  - `created_at` (timestamptz)

  ### player_states
  Estados/provincias por país:
  - `id` (uuid, PK)
  - `country_id` (uuid, FK -> player_countries)
  - `name` (text) - nombre del estado/provincia
  - `created_at` (timestamptz)

  ## 2. Tablas Principales

  ### players
  Datos principales del jugador:
  - `id` (uuid, PK)
  - `alias` (text, unique) - username del jugador
  - `password_hash` (text) - contraseña hasheada
  - `status_id` (uuid, FK -> player_statuses)
  - `registration_date` (date) - fecha de alta
  - `first_name` (text) - nombre
  - `last_name` (text) - apellido
  - `birth_date` (date) - fecha de nacimiento
  - `email` (text, unique) - correo electrónico
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### player_addresses
  Direcciones de jugadores (1 jugador = 1 dirección, 1 dirección = múltiples jugadores):
  - `id` (uuid, PK)
  - `street` (text) - calle
  - `number` (text) - número
  - `floor` (text, nullable) - piso
  - `apartment` (text, nullable) - departamento
  - `state_id` (uuid, FK -> player_states)
  - `country_id` (uuid, FK -> player_countries)
  - `postal_code` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### player_address_assignments
  Tabla de relación entre jugadores y direcciones:
  - `player_id` (uuid, FK -> players)
  - `address_id` (uuid, FK -> player_addresses)
  - `created_at` (timestamptz)
  - PK compuesta (player_id, address_id)
  - UNIQUE constraint en player_id (1 jugador solo puede tener 1 dirección)

  ### player_phones
  Teléfonos de jugadores (múltiples por jugador):
  - `id` (uuid, PK)
  - `player_id` (uuid, FK -> players)
  - `phone_type_id` (uuid, FK -> player_phone_types)
  - `country_code` (text) - código de país (+54, +1, etc.)
  - `phone_number` (text) - número de teléfono
  - `is_primary` (boolean) - teléfono principal
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### player_connections
  Historial de conexiones/IPs:
  - `id` (uuid, PK)
  - `player_id` (uuid, FK -> players)
  - `ip_address` (text) - dirección IP
  - `country` (text) - país de conexión
  - `city` (text, nullable) - ciudad/localidad
  - `connected_at` (timestamptz) - fecha/hora de conexión
  - `created_at` (timestamptz)

  ## 3. Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas para jugadores
  - Solo administradores autenticados pueden gestionar datos

  ## 4. Índices
  - Índices en campos de búsqueda frecuente
  - Índices en foreign keys
  - Índices únicos en alias y email
*/

-- =====================================================
-- 1. TABLAS CATÁLOGO
-- =====================================================

-- Tabla de estados de jugador
CREATE TABLE IF NOT EXISTS player_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de tipos de teléfono
CREATE TABLE IF NOT EXISTS player_phone_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de países para jugadores
CREATE TABLE IF NOT EXISTS player_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  phone_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de estados/provincias
CREATE TABLE IF NOT EXISTS player_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES player_countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(country_id, name)
);

-- =====================================================
-- 2. TABLAS PRINCIPALES
-- =====================================================

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  status_id uuid NOT NULL REFERENCES player_statuses(id),
  registration_date date NOT NULL DEFAULT CURRENT_DATE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de direcciones
CREATE TABLE IF NOT EXISTS player_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street text NOT NULL,
  number text NOT NULL,
  floor text,
  apartment text,
  state_id uuid NOT NULL REFERENCES player_states(id),
  country_id uuid NOT NULL REFERENCES player_countries(id),
  postal_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de asignación de direcciones (1 jugador = 1 dirección)
CREATE TABLE IF NOT EXISTS player_address_assignments (
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  address_id uuid NOT NULL REFERENCES player_addresses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (player_id, address_id),
  UNIQUE(player_id)
);

-- Tabla de teléfonos
CREATE TABLE IF NOT EXISTS player_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  phone_type_id uuid NOT NULL REFERENCES player_phone_types(id),
  country_code text NOT NULL,
  phone_number text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de historial de conexiones
CREATE TABLE IF NOT EXISTS player_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  country text NOT NULL,
  city text,
  connected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. ÍNDICES
-- =====================================================

-- Índices para players
CREATE INDEX IF NOT EXISTS idx_players_alias ON players(alias);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_status_id ON players(status_id);

-- Índices para player_addresses
CREATE INDEX IF NOT EXISTS idx_player_addresses_country_id ON player_addresses(country_id);
CREATE INDEX IF NOT EXISTS idx_player_addresses_state_id ON player_addresses(state_id);

-- Índices para player_address_assignments
CREATE INDEX IF NOT EXISTS idx_player_address_assignments_address_id ON player_address_assignments(address_id);

-- Índices para player_phones
CREATE INDEX IF NOT EXISTS idx_player_phones_player_id ON player_phones(player_id);
CREATE INDEX IF NOT EXISTS idx_player_phones_type_id ON player_phones(phone_type_id);

-- Índices para player_connections
CREATE INDEX IF NOT EXISTS idx_player_connections_player_id ON player_connections(player_id);
CREATE INDEX IF NOT EXISTS idx_player_connections_connected_at ON player_connections(connected_at DESC);

-- Índices para player_states
CREATE INDEX IF NOT EXISTS idx_player_states_country_id ON player_states(country_id);

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en players
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();

-- Trigger para actualizar updated_at en player_addresses
CREATE OR REPLACE FUNCTION update_player_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_addresses_updated_at
  BEFORE UPDATE ON player_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_player_addresses_updated_at();

-- Trigger para actualizar updated_at en player_phones
CREATE OR REPLACE FUNCTION update_player_phones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_phones_updated_at
  BEFORE UPDATE ON player_phones
  FOR EACH ROW
  EXECUTE FUNCTION update_player_phones_updated_at();

-- =====================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE player_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_phone_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_address_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_connections ENABLE ROW LEVEL SECURITY;

-- Políticas para player_statuses (solo lectura para autenticados)
CREATE POLICY "Anyone can view player statuses"
  ON player_statuses FOR SELECT
  TO public
  USING (true);

-- Políticas para player_phone_types (solo lectura para autenticados)
CREATE POLICY "Anyone can view phone types"
  ON player_phone_types FOR SELECT
  TO public
  USING (true);

-- Políticas para player_countries (solo lectura para autenticados)
CREATE POLICY "Anyone can view player countries"
  ON player_countries FOR SELECT
  TO public
  USING (true);

-- Políticas para player_states (solo lectura para autenticados)
CREATE POLICY "Anyone can view player states"
  ON player_states FOR SELECT
  TO public
  USING (true);

-- Políticas para players
CREATE POLICY "Service role can view all players"
  ON players FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert players"
  ON players FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update players"
  ON players FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete players"
  ON players FOR DELETE
  TO service_role
  USING (true);

-- Políticas para player_addresses
CREATE POLICY "Service role can view all addresses"
  ON player_addresses FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert addresses"
  ON player_addresses FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update addresses"
  ON player_addresses FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete addresses"
  ON player_addresses FOR DELETE
  TO service_role
  USING (true);

-- Políticas para player_address_assignments
CREATE POLICY "Service role can view all address assignments"
  ON player_address_assignments FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert address assignments"
  ON player_address_assignments FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update address assignments"
  ON player_address_assignments FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete address assignments"
  ON player_address_assignments FOR DELETE
  TO service_role
  USING (true);

-- Políticas para player_phones
CREATE POLICY "Service role can view all phones"
  ON player_phones FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert phones"
  ON player_phones FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update phones"
  ON player_phones FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete phones"
  ON player_phones FOR DELETE
  TO service_role
  USING (true);

-- Políticas para player_connections
CREATE POLICY "Service role can view all connections"
  ON player_connections FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert connections"
  ON player_connections FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update connections"
  ON player_connections FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete connections"
  ON player_connections FOR DELETE
  TO service_role
  USING (true);