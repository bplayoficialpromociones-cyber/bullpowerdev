/*
  # Sistema de Facturación

  1. Nuevas Tablas
    - `billing_invoice_statuses`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Nombre del estado
      - `description` (text) - Descripción del estado
      - `created_at` (timestamp)
    
    - `billing_invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (bigserial, unique) - Número de factura auto-incremental
      - `client_id` (uuid, foreign key a crm_clients)
      - `invoice_date` (date) - Fecha de la factura
      - `status_id` (uuid, foreign key a billing_invoice_statuses)
      - `invoice_file_url` (text) - URL al archivo de factura (jpg, png, pdf)
      - `amount` (decimal) - Monto de la factura
      - `currency_id` (uuid, foreign key a expenses_currencies)
      - `description` (text) - Descripción de la factura
      - `is_active` (boolean) - Si está activa
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp) - Soft delete

  2. Relaciones
    - Un cliente puede tener 0 o muchas facturas
    - Una factura pertenece a un solo cliente
    - Una factura tiene un estado
    - Una factura tiene una moneda

  3. Seguridad
    - Habilitar RLS en todas las tablas
    - Solo super_admin y facturacion pueden acceder
*/

-- Tabla de Estados de Factura
CREATE TABLE IF NOT EXISTS billing_invoice_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number bigserial UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES crm_clients(id) ON DELETE RESTRICT,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  status_id uuid NOT NULL REFERENCES billing_invoice_statuses(id) ON DELETE RESTRICT,
  invoice_file_url text,
  amount decimal(15, 2) NOT NULL DEFAULT 0.00,
  currency_id uuid NOT NULL REFERENCES expenses_currencies(id) ON DELETE RESTRICT,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_billing_invoices_client_id ON billing_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status_id ON billing_invoices(status_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_currency_id ON billing_invoices(currency_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_invoice_date ON billing_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_deleted_at ON billing_invoices(deleted_at);

-- Habilitar RLS
ALTER TABLE billing_invoice_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas para billing_invoice_statuses
CREATE POLICY "Super admin y facturacion pueden ver estados"
  ON billing_invoice_statuses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Políticas para billing_invoices
CREATE POLICY "Super admin y facturacion pueden ver facturas"
  ON billing_invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

CREATE POLICY "Super admin y facturacion pueden crear facturas"
  ON billing_invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

CREATE POLICY "Super admin y facturacion pueden actualizar facturas"
  ON billing_invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

CREATE POLICY "Solo super admin puede eliminar facturas"
  ON billing_invoices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );
