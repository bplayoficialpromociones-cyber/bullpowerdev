/*
  # Seed Estados de Facturas

  1. Datos Iniciales
    - Insertar los 4 estados predefinidos de facturas:
      - Cobrada
      - Pendiente de Pago
      - No cobrada
      - Rechazada
  
  2. Notas
    - Los estados son datos maestros que no se editarán en el futuro
    - Se usa ON CONFLICT para evitar duplicados
*/

-- Insertar estados de facturas
INSERT INTO billing_invoice_statuses (name, description) VALUES
  ('Cobrada', 'La factura ha sido cobrada exitosamente'),
  ('Pendiente de Pago', 'La factura está pendiente de ser cobrada'),
  ('No cobrada', 'La factura no fue cobrada'),
  ('Rechazada', 'La factura fue rechazada')
ON CONFLICT (name) DO NOTHING;
