/*
  # Sistema de Gastos - Bull Power
  
  ## Descripción
  Sistema completo de gestión de gastos (entradas y salidas) asociados a clientes y empleados.
  Permite registrar gastos en diferentes monedas y clasificarlos por tipo.

  ## 1. Nuevas Tablas
  
  ### Monedas
  - `expenses_currencies` - Tipos de moneda para gastos
    - `id` (uuid, PK)
    - `name` (text) - Nombre de la moneda (ej: "Peso Argentino", "Dólar Estadounidense")
    - `prefix` (text) - Prefijo/símbolo (ej: "$", "US$", "€")
    - `created_at` (timestamp)
  
  ### Tipos de Gasto
  - `expenses_types` - Clasificación de gastos (Entrada/Salida)
    - `id` (uuid, PK)
    - `name` (text) - Nombre del tipo ("Entrada", "Salida")
    - `created_at` (timestamp)
  
  ### Gastos
  - `expenses` - Registro de gastos
    - `id` (uuid, PK)
    - `name` (text) - Nombre descriptivo del gasto
    - `date` (date) - Fecha del gasto
    - `amount` (numeric(12,2)) - Valor del gasto
    - `description` (text, nullable) - Descripción detallada
    - `currency_id` (uuid, FK -> expenses_currencies)
    - `expense_type_id` (uuid, FK -> expenses_types)
    - `employee_id` (uuid, FK -> crm_employees) - Empleado que registró el gasto
    - `client_id` (uuid, FK -> crm_clients) - Cliente asociado al gasto
    - `is_active` (boolean) - Soft delete
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
    - `deleted_at` (timestamp, nullable)

  ## 2. Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Solo usuarios autenticados pueden leer datos
  - Solo super_admin y facturacion pueden crear/modificar gastos
  - Solo super_admin puede eliminar gastos

  ## 3. Datos Iniciales
  - Monedas comunes: Peso Argentino, Dólar Estadounidense, Euro
  - Tipos de gasto: Entrada, Salida

  ## 4. Índices
  - Índices en foreign keys para mejorar performance
  - Índice en fecha de gasto para reportes
*/

-- Create currencies table
CREATE TABLE IF NOT EXISTS expenses_currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  prefix text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create expense types table
CREATE TABLE IF NOT EXISTS expenses_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  description text,
  currency_id uuid NOT NULL REFERENCES expenses_currencies(id),
  expense_type_id uuid NOT NULL REFERENCES expenses_types(id),
  employee_id uuid NOT NULL REFERENCES crm_employees(id),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_client ON expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_active ON expenses(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE expenses_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses_currencies
CREATE POLICY "Authenticated users can view currencies"
  ON expenses_currencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super_admin can insert currencies"
  ON expenses_currencies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

CREATE POLICY "Only super_admin can update currencies"
  ON expenses_currencies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

CREATE POLICY "Only super_admin can delete currencies"
  ON expenses_currencies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

-- RLS Policies for expenses_types
CREATE POLICY "Authenticated users can view expense types"
  ON expenses_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super_admin can insert expense types"
  ON expenses_types FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

CREATE POLICY "Only super_admin can update expense types"
  ON expenses_types FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

CREATE POLICY "Only super_admin can delete expense types"
  ON expenses_types FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Authenticated users can view active expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Authorized users can insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
    )
  );

CREATE POLICY "Authorized users can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
    )
  );

CREATE POLICY "Only super_admin can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

-- Insert default currencies
INSERT INTO expenses_currencies (name, prefix) VALUES
  ('Peso Argentino', '$'),
  ('Dólar Estadounidense', 'US$'),
  ('Euro', '€')
ON CONFLICT (name) DO NOTHING;

-- Insert default expense types
INSERT INTO expenses_types (name) VALUES
  ('Entrada'),
  ('Salida')
ON CONFLICT (name) DO NOTHING;
