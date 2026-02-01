/*
  # Sistema CRM - Bull Power
  
  ## Descripción
  Sistema completo de gestión de clientes (Operadores, Agregadores, Fabricantes) 
  y sus empleados para la industria regulada de juegos de azar.

  ## 1. Nuevas Tablas
  
  ### Geografía
  - `crm_countries` - Países del mundo (pre-cargados)
    - `id` (uuid, PK)
    - `name` (text) - Nombre del país
    - `code` (text) - Código ISO (AR, BR, US, etc)
    - `created_at` (timestamp)
  
  - `crm_states` - Provincias/Estados por país (pre-cargados)
    - `id` (uuid, PK)
    - `country_id` (uuid, FK -> crm_countries)
    - `name` (text) - Nombre de provincia/estado
    - `created_at` (timestamp)
  
  - `crm_addresses` - Direcciones compartibles
    - `id` (uuid, PK)
    - `street` (text) - Calle
    - `number` (text) - Número
    - `floor` (integer, nullable) - Piso
    - `apartment` (text, nullable) - Departamento
    - `neighborhood` (text, nullable) - Barrio
    - `postal_code` (text) - Código postal
    - `country_id` (uuid, FK -> crm_countries)
    - `state_id` (uuid, FK -> crm_states)
    - `google_maps_url` (text, auto-generado) - URL de Google Maps
    - `is_active` (boolean) - Soft delete
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
    - `deleted_at` (timestamp, nullable)

  ### Clientes
  - `crm_client_types` - Tipos de cliente (Operador, Agregador, Fabricante)
    - `id` (uuid, PK)
    - `name` (text) - Nombre del tipo
    - `description` (text, nullable) - Descripción
    - `created_at` (timestamp)
  
  - `crm_clients` - Clientes/Empresas
    - `id` (uuid, PK)
    - `name` (text) - Nombre del cliente
    - `client_type_id` (uuid, FK -> crm_client_types)
    - `address_id` (uuid, FK -> crm_addresses, nullable)
    - `anniversary_date` (date, nullable) - Fecha aniversario
    - `linkedin_url` (text, nullable)
    - `instagram_url` (text, nullable)
    - `facebook_url` (text, nullable)
    - `youtube_url` (text, nullable)
    - `twitch_url` (text, nullable)
    - `kick_url` (text, nullable)
    - `twitter_url` (text, nullable)
    - `is_active` (boolean) - Estado activo/inactivo
    - `created_at` (timestamp) - Fecha alta en sistema
    - `updated_at` (timestamp)
    - `deleted_at` (timestamp, nullable)

  ### Empleados
  - `crm_positions` - Cargos/Posiciones
    - `id` (uuid, PK)
    - `name` (text) - Nombre del cargo (CEO, CTO, etc)
    - `description` (text, nullable)
    - `created_at` (timestamp)
  
  - `crm_employees` - Empleados de clientes
    - `id` (uuid, PK)
    - `client_id` (uuid, FK -> crm_clients)
    - `first_name` (text) - Nombre
    - `last_name` (text) - Apellido
    - `email` (text, nullable)
    - `birth_date` (date, nullable) - Fecha de nacimiento
    - `telegram` (text, nullable)
    - `skype` (text, nullable)
    - `discord` (text, nullable)
    - `linkedin_url` (text, nullable)
    - `twitter_url` (text, nullable)
    - `instagram_url` (text, nullable)
    - `facebook_url` (text, nullable)
    - `is_active` (boolean) - Soft delete
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
    - `deleted_at` (timestamp, nullable)
  
  - `crm_employee_positions` - Relación Many-to-Many Empleados-Cargos
    - `id` (uuid, PK)
    - `employee_id` (uuid, FK -> crm_employees)
    - `position_id` (uuid, FK -> crm_positions)
    - `start_date` (date) - Fecha inicio en cargo
    - `end_date` (date, nullable) - Fecha fin (null si actual)
    - `is_current` (boolean) - Si es cargo actual
    - `created_at` (timestamp)

  ## 2. Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Solo usuarios autenticados pueden acceder
  - Políticas restrictivas por operación (SELECT, INSERT, UPDATE, DELETE)

  ## 3. Funciones
  - `generate_google_maps_url()` - Genera automáticamente URL de Google Maps
  - Trigger automático en INSERT/UPDATE de direcciones

  ## 4. Índices
  - Índices en FK para mejor performance
  - Índices en campos de búsqueda frecuente
  - Índices en soft delete (is_active, deleted_at)
*/

-- =====================================================
-- 1. TABLA: PAÍSES
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crm_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver países"
  ON crm_countries FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 2. TABLA: PROVINCIAS/ESTADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES crm_countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(country_id, name)
);

ALTER TABLE crm_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver estados"
  ON crm_states FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_crm_states_country_id ON crm_states(country_id);

-- =====================================================
-- 3. TABLA: DIRECCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street text NOT NULL,
  number text NOT NULL,
  floor integer,
  apartment text,
  neighborhood text,
  postal_code text NOT NULL,
  country_id uuid NOT NULL REFERENCES crm_countries(id) ON DELETE RESTRICT,
  state_id uuid NOT NULL REFERENCES crm_states(id) ON DELETE RESTRICT,
  google_maps_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE crm_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver direcciones activas"
  ON crm_addresses FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Usuarios autenticados pueden crear direcciones"
  ON crm_addresses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar direcciones"
  ON crm_addresses FOR UPDATE
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden soft-delete direcciones"
  ON crm_addresses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_crm_addresses_country_id ON crm_addresses(country_id);
CREATE INDEX idx_crm_addresses_state_id ON crm_addresses(state_id);
CREATE INDEX idx_crm_addresses_active ON crm_addresses(is_active, deleted_at);

-- =====================================================
-- 4. FUNCIÓN: GENERAR GOOGLE MAPS URL AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION generate_google_maps_url()
RETURNS TRIGGER AS $$
DECLARE
  country_name text;
  state_name text;
  full_address text;
BEGIN
  -- Obtener nombres de país y estado
  SELECT c.name, s.name INTO country_name, state_name
  FROM crm_countries c, crm_states s
  WHERE c.id = NEW.country_id AND s.id = NEW.state_id;

  -- Construir dirección completa
  full_address := NEW.street || ' ' || NEW.number;
  
  IF NEW.floor IS NOT NULL THEN
    full_address := full_address || ', Piso ' || NEW.floor;
  END IF;
  
  IF NEW.apartment IS NOT NULL THEN
    full_address := full_address || ', Depto ' || NEW.apartment;
  END IF;
  
  IF NEW.neighborhood IS NOT NULL THEN
    full_address := full_address || ', ' || NEW.neighborhood;
  END IF;
  
  full_address := full_address || ', ' || state_name || ', ' || country_name || ', CP ' || NEW.postal_code;
  
  -- Generar URL de Google Maps (encode URL)
  NEW.google_maps_url := 'https://www.google.com/maps/search/?api=1&query=' || replace(full_address, ' ', '+');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar URL automáticamente
CREATE TRIGGER trigger_generate_google_maps_url
  BEFORE INSERT OR UPDATE OF street, number, floor, apartment, neighborhood, postal_code, country_id, state_id
  ON crm_addresses
  FOR EACH ROW
  EXECUTE FUNCTION generate_google_maps_url();

-- =====================================================
-- 5. TABLA: TIPOS DE CLIENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_client_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crm_client_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver tipos de cliente"
  ON crm_client_types FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 6. TABLA: CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_type_id uuid NOT NULL REFERENCES crm_client_types(id) ON DELETE RESTRICT,
  address_id uuid REFERENCES crm_addresses(id) ON DELETE SET NULL,
  anniversary_date date,
  linkedin_url text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  twitch_url text,
  kick_url text,
  twitter_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver clientes activos"
  ON crm_clients FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Usuarios autenticados pueden crear clientes"
  ON crm_clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
  ON crm_clients FOR UPDATE
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden soft-delete clientes"
  ON crm_clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_crm_clients_type_id ON crm_clients(client_type_id);
CREATE INDEX idx_crm_clients_address_id ON crm_clients(address_id);
CREATE INDEX idx_crm_clients_active ON crm_clients(is_active, deleted_at);
CREATE INDEX idx_crm_clients_name ON crm_clients(name);

-- =====================================================
-- 7. TABLA: CARGOS/POSICIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crm_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver cargos"
  ON crm_positions FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 8. TABLA: EMPLEADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  birth_date date,
  telegram text,
  skype text,
  discord text,
  linkedin_url text,
  twitter_url text,
  instagram_url text,
  facebook_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE crm_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver empleados activos"
  ON crm_employees FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Usuarios autenticados pueden crear empleados"
  ON crm_employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar empleados"
  ON crm_employees FOR UPDATE
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden soft-delete empleados"
  ON crm_employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_crm_employees_client_id ON crm_employees(client_id);
CREATE INDEX idx_crm_employees_active ON crm_employees(is_active, deleted_at);
CREATE INDEX idx_crm_employees_email ON crm_employees(email);
CREATE INDEX idx_crm_employees_name ON crm_employees(last_name, first_name);

-- =====================================================
-- 9. TABLA: EMPLEADOS-CARGOS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_employee_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES crm_employees(id) ON DELETE CASCADE,
  position_id uuid NOT NULL REFERENCES crm_positions(id) ON DELETE RESTRICT,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
  UNIQUE(employee_id, position_id, start_date)
);

ALTER TABLE crm_employee_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver asignaciones de cargo"
  ON crm_employee_positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear asignaciones de cargo"
  ON crm_employee_positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar asignaciones de cargo"
  ON crm_employee_positions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar asignaciones de cargo"
  ON crm_employee_positions FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_crm_employee_positions_employee_id ON crm_employee_positions(employee_id);
CREATE INDEX idx_crm_employee_positions_position_id ON crm_employee_positions(position_id);
CREATE INDEX idx_crm_employee_positions_current ON crm_employee_positions(is_current);

-- =====================================================
-- 10. TRIGGER: UPDATED_AT AUTOMÁTICO
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_addresses_updated_at
  BEFORE UPDATE ON crm_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_clients_updated_at
  BEFORE UPDATE ON crm_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_employees_updated_at
  BEFORE UPDATE ON crm_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();