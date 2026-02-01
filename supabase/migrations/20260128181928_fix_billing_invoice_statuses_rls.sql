/*
  # Arreglar políticas RLS de estados de facturas

  1. Cambios
    - Eliminar la política restrictiva actual
    - Crear nueva política que permita lectura pública de estados
    - Los estados son datos de catálogo que deben ser accesibles para todos

  2. Seguridad
    - Solo permite SELECT (lectura)
    - Los estados no se pueden modificar desde el frontend
*/

-- Eliminar la política restrictiva actual
DROP POLICY IF EXISTS "Super admin y facturacion pueden ver estados" ON billing_invoice_statuses;

-- Permitir lectura pública de los estados (son datos de catálogo)
CREATE POLICY "Anyone can read invoice statuses"
  ON billing_invoice_statuses
  FOR SELECT
  TO authenticated, anon
  USING (true);
