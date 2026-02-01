/*
  # Agregar tabla de líneas de detalle para facturas

  ## Descripción
  Esta migración crea la tabla para gestionar los ítems/líneas de detalle de cada factura.
  Cada factura puede tener múltiples líneas de detalle con diferentes productos o servicios.

  ## 1. Nueva Tabla
    - `billing_invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key a billing_invoices) - Factura a la que pertenece
      - `description` (text) - Descripción del ítem/servicio/producto
      - `quantity` (numeric) - Cantidad de ítems
      - `unit_price` (numeric) - Precio unitario
      - `subtotal` (numeric) - Subtotal calculado (cantidad * precio unitario)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  ## 2. Relaciones
    - Una factura puede tener 1 o muchas líneas de detalle
    - Una línea de detalle pertenece a una sola factura

  ## 3. Seguridad
    - Habilitar RLS
    - Solo super_admin y facturacion pueden gestionar ítems
    - Las políticas heredan los permisos de billing_invoices

  ## 4. Notas Importantes
    - El campo `subtotal` se calcula automáticamente en el backend
    - Al eliminar una factura (soft delete), sus ítems se mantienen pero no se muestran
    - El monto total de la factura es la suma de todos los subtotales de sus ítems
*/

-- Tabla de ítems/líneas de detalle de facturas
CREATE TABLE IF NOT EXISTS billing_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10, 2) NOT NULL DEFAULT 1,
  unit_price numeric(15, 2) NOT NULL DEFAULT 0.00,
  subtotal numeric(15, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_unit_price CHECK (unit_price >= 0),
  CONSTRAINT positive_subtotal CHECK (subtotal >= 0)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_billing_invoice_items_invoice_id ON billing_invoice_items(invoice_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_billing_invoice_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_billing_invoice_items_updated_at') THEN
    CREATE TRIGGER update_billing_invoice_items_updated_at 
      BEFORE UPDATE ON billing_invoice_items
      FOR EACH ROW 
      EXECUTE FUNCTION update_billing_invoice_items_updated_at();
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE billing_invoice_items ENABLE ROW LEVEL SECURITY;

-- Políticas para billing_invoice_items
CREATE POLICY "Super admin y facturacion pueden ver items"
  ON billing_invoice_items FOR SELECT
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

CREATE POLICY "Super admin y facturacion pueden crear items"
  ON billing_invoice_items FOR INSERT
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

CREATE POLICY "Super admin y facturacion pueden actualizar items"
  ON billing_invoice_items FOR UPDATE
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

CREATE POLICY "Solo super admin puede eliminar items"
  ON billing_invoice_items FOR DELETE
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
