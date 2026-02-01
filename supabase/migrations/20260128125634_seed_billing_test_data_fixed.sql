/*
  # Seed de datos de prueba para Facturación

  ## Descripción
  Esta migración carga 15 facturas de prueba con sus líneas de detalle para poder visualizar
  el sistema de facturación funcionando con datos reales.

  ## Datos Incluidos
  - 15 facturas con diferentes estados, montos y clientes
  - Múltiples líneas de detalle por factura
  - Fechas variadas para testing de filtros

  ## Notas
  - Se usan clientes existentes de la tabla crm_clients
  - Se usan estados y monedas existentes
  - Los montos totales se calculan como suma de items
*/

DO $$
DECLARE
  v_client_ids uuid[];
  v_status_cobrada uuid;
  v_status_pendiente uuid;
  v_status_no_cobrada uuid;
  v_status_rechazada uuid;
  v_currency_ars uuid;
  v_currency_usd uuid;
  v_invoice_id uuid;
  v_date date;
  i integer;
BEGIN
  -- Obtener IDs de clientes existentes
  SELECT ARRAY_AGG(id) INTO v_client_ids FROM crm_clients LIMIT 10;
  
  -- Si no hay clientes, salir
  IF array_length(v_client_ids, 1) IS NULL THEN
    RAISE NOTICE 'No hay clientes en la base de datos. Primero carga datos de CRM.';
    RETURN;
  END IF;

  -- Obtener IDs de estados
  SELECT id INTO v_status_cobrada FROM billing_invoice_statuses WHERE name = 'Cobrada' LIMIT 1;
  SELECT id INTO v_status_pendiente FROM billing_invoice_statuses WHERE name = 'Pendiente de Pago' LIMIT 1;
  SELECT id INTO v_status_no_cobrada FROM billing_invoice_statuses WHERE name = 'No cobrada' LIMIT 1;
  SELECT id INTO v_status_rechazada FROM billing_invoice_statuses WHERE name = 'Rechazada' LIMIT 1;

  -- Obtener IDs de monedas
  SELECT id INTO v_currency_ars FROM expenses_currencies WHERE code = 'ARS' LIMIT 1;
  SELECT id INTO v_currency_usd FROM expenses_currencies WHERE code = 'USD' LIMIT 1;

  -- Crear 15 facturas con items
  FOR i IN 1..15 LOOP
    v_date := CURRENT_DATE - (i * 5 || ' days')::interval;
    
    -- Factura 1-5: Cobradas
    IF i <= 5 THEN
      INSERT INTO billing_invoices (
        client_id,
        invoice_date,
        status_id,
        amount,
        currency_id,
        description,
        is_active
      ) VALUES (
        v_client_ids[1 + (i % array_length(v_client_ids, 1))],
        v_date,
        v_status_cobrada,
        48000.00,
        CASE WHEN i % 2 = 0 THEN v_currency_ars ELSE v_currency_usd END,
        'Factura de servicios mensuales',
        true
      ) RETURNING id INTO v_invoice_id;

      -- Items para esta factura
      INSERT INTO billing_invoice_items (invoice_id, description, quantity, unit_price, subtotal) VALUES
        (v_invoice_id, 'Servicio de hosting premium', 1, 15000.00, 15000.00),
        (v_invoice_id, 'Licencias de software', 10, 2500.00, 25000.00),
        (v_invoice_id, 'Soporte técnico mensual', 1, 8000.00, 8000.00);

    -- Factura 6-10: Pendientes
    ELSIF i <= 10 THEN
      INSERT INTO billing_invoices (
        client_id,
        invoice_date,
        status_id,
        amount,
        currency_id,
        description,
        is_active
      ) VALUES (
        v_client_ids[1 + (i % array_length(v_client_ids, 1))],
        v_date,
        v_status_pendiente,
        288000.00,
        CASE WHEN i % 3 = 0 THEN v_currency_usd ELSE v_currency_ars END,
        'Factura de desarrollo web',
        true
      ) RETURNING id INTO v_invoice_id;

      INSERT INTO billing_invoice_items (invoice_id, description, quantity, unit_price, subtotal) VALUES
        (v_invoice_id, 'Desarrollo frontend React', 40, 3500.00, 140000.00),
        (v_invoice_id, 'Desarrollo backend Node.js', 30, 4000.00, 120000.00),
        (v_invoice_id, 'Testing y QA', 10, 2800.00, 28000.00);

    -- Factura 11-13: No cobradas
    ELSIF i <= 13 THEN
      INSERT INTO billing_invoices (
        client_id,
        invoice_date,
        status_id,
        amount,
        currency_id,
        description,
        is_active
      ) VALUES (
        v_client_ids[1 + (i % array_length(v_client_ids, 1))],
        v_date,
        v_status_no_cobrada,
        141000.00,
        v_currency_ars,
        'Factura de consultoría',
        true
      ) RETURNING id INTO v_invoice_id;

      INSERT INTO billing_invoice_items (invoice_id, description, quantity, unit_price, subtotal) VALUES
        (v_invoice_id, 'Consultoría estratégica IT', 8, 12000.00, 96000.00),
        (v_invoice_id, 'Auditoría de seguridad', 1, 45000.00, 45000.00);

    -- Factura 14-15: Rechazadas
    ELSE
      INSERT INTO billing_invoices (
        client_id,
        invoice_date,
        status_id,
        amount,
        currency_id,
        description,
        is_active
      ) VALUES (
        v_client_ids[1 + (i % array_length(v_client_ids, 1))],
        v_date,
        v_status_rechazada,
        1650.00,
        v_currency_usd,
        'Factura de servicios cloud',
        true
      ) RETURNING id INTO v_invoice_id;

      INSERT INTO billing_invoice_items (invoice_id, description, quantity, unit_price, subtotal) VALUES
        (v_invoice_id, 'AWS Cloud Services', 1, 850.00, 850.00),
        (v_invoice_id, 'CDN y distribución', 1, 320.00, 320.00),
        (v_invoice_id, 'Base de datos gestionada', 1, 480.00, 480.00);
    END IF;
  END LOOP;

  RAISE NOTICE 'Se crearon 15 facturas de prueba con sus items';
END $$;
