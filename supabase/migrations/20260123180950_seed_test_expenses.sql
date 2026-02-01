/*
  # Seed Test Expenses

  1. Data Seeds
    - Create 30 test expenses for demonstration
    - 15 expenses in ARS (Peso Argentino)
    - 15 expenses in USD (Dólar Estadounidense)
    - Mix of Entrada (Income) and Salida (Expense) types
    - Various amounts and descriptions

  2. Important Notes
    - Uses existing clients and employees from CRM
    - Dates spread across recent months
    - Realistic expense names and descriptions
*/

DO $$
DECLARE
  ars_id uuid;
  usd_id uuid;
  entrada_id uuid;
  salida_id uuid;
  client_ids uuid[];
  employee_ids uuid[];
BEGIN
  -- Get currency IDs
  SELECT id INTO ars_id FROM expenses_currencies WHERE code = 'ARS';
  SELECT id INTO usd_id FROM expenses_currencies WHERE code = 'USD';
  
  -- Get expense type IDs
  SELECT id INTO entrada_id FROM expenses_types WHERE name = 'Entrada';
  SELECT id INTO salida_id FROM expenses_types WHERE name = 'Salida';
  
  -- Get some client and employee IDs
  SELECT ARRAY_AGG(id) INTO client_ids FROM (SELECT id FROM crm_clients ORDER BY created_at LIMIT 5) sub;
  SELECT ARRAY_AGG(id) INTO employee_ids FROM (SELECT id FROM crm_employees ORDER BY created_at LIMIT 5) sub;
  
  -- Only proceed if we have clients and employees
  IF array_length(client_ids, 1) > 0 AND array_length(employee_ids, 1) > 0 THEN
    
    -- Insert 15 expenses in ARS
    INSERT INTO expenses (name, date, amount, description, currency_id, expense_type_id, employee_id, client_id) VALUES
      ('Pago de Servicios', CURRENT_DATE - INTERVAL '2 days', 15000.00, 'Pago mensual de electricidad y agua', ars_id, salida_id, employee_ids[1], client_ids[1]),
      ('Venta de Productos', CURRENT_DATE - INTERVAL '5 days', 250000.00, 'Venta mayorista de productos tecnológicos', ars_id, entrada_id, employee_ids[2], client_ids[2]),
      ('Compra de Insumos', CURRENT_DATE - INTERVAL '7 days', 85000.00, 'Compra de materiales de oficina y papelería', ars_id, salida_id, employee_ids[1], client_ids[1]),
      ('Cobro de Factura', CURRENT_DATE - INTERVAL '10 days', 420000.00, 'Cobro de factura #1234 - Servicios de consultoría', ars_id, entrada_id, employee_ids[3], client_ids[3]),
      ('Mantenimiento Equipos', CURRENT_DATE - INTERVAL '12 days', 65000.00, 'Servicio técnico de equipos informáticos', ars_id, salida_id, employee_ids[2], client_ids[2]),
      ('Ingreso por Suscripción', CURRENT_DATE - INTERVAL '15 days', 180000.00, 'Renovación anual de suscripciones empresariales', ars_id, entrada_id, employee_ids[1], client_ids[1]),
      ('Alquiler de Oficina', CURRENT_DATE - INTERVAL '18 days', 120000.00, 'Pago mensual de alquiler de oficina comercial', ars_id, salida_id, employee_ids[3], client_ids[3]),
      ('Venta de Servicios', CURRENT_DATE - INTERVAL '20 days', 350000.00, 'Servicios de desarrollo web para cliente corporativo', ars_id, entrada_id, employee_ids[2], client_ids[2]),
      ('Impuestos Municipales', CURRENT_DATE - INTERVAL '22 days', 45000.00, 'Pago de tasas e impuestos municipales', ars_id, salida_id, employee_ids[1], client_ids[1]),
      ('Cobro de Proyecto', CURRENT_DATE - INTERVAL '25 days', 580000.00, 'Cobro por finalización de proyecto integral', ars_id, entrada_id, employee_ids[3], client_ids[3]),
      ('Publicidad Online', CURRENT_DATE - INTERVAL '28 days', 95000.00, 'Campaña publicitaria en redes sociales', ars_id, salida_id, employee_ids[2], client_ids[2]),
      ('Venta de Licencias', CURRENT_DATE - INTERVAL '30 days', 275000.00, 'Venta de licencias de software empresarial', ars_id, entrada_id, employee_ids[1], client_ids[1]),
      ('Capacitación Personal', CURRENT_DATE - INTERVAL '35 days', 38000.00, 'Curso de actualización profesional para equipo', ars_id, salida_id, employee_ids[3], client_ids[3]),
      ('Comisión por Venta', CURRENT_DATE - INTERVAL '40 days', 195000.00, 'Comisión por intermediación comercial', ars_id, entrada_id, employee_ids[2], client_ids[2]),
      ('Seguro Empresarial', CURRENT_DATE - INTERVAL '45 days', 72000.00, 'Póliza de seguro contra todo riesgo', ars_id, salida_id, employee_ids[1], client_ids[1]);
    
    -- Insert 15 expenses in USD
    INSERT INTO expenses (name, date, amount, description, currency_id, expense_type_id, employee_id, client_id) VALUES
      ('Software Subscription', CURRENT_DATE - INTERVAL '1 day', 299.00, 'Monthly payment for cloud services and SaaS tools', usd_id, salida_id, employee_ids[2], client_ids[2]),
      ('International Sale', CURRENT_DATE - INTERVAL '4 days', 8500.00, 'Export of products to international client', usd_id, entrada_id, employee_ids[1], client_ids[1]),
      ('Equipment Purchase', CURRENT_DATE - INTERVAL '8 days', 3200.00, 'Purchase of new laptops and peripherals', usd_id, salida_id, employee_ids[3], client_ids[3]),
      ('Consulting Payment', CURRENT_DATE - INTERVAL '11 days', 12000.00, 'Payment received for strategic consulting services', usd_id, entrada_id, employee_ids[2], client_ids[2]),
      ('Cloud Hosting', CURRENT_DATE - INTERVAL '14 days', 450.00, 'AWS and Azure monthly hosting fees', usd_id, salida_id, employee_ids[1], client_ids[1]),
      ('License Revenue', CURRENT_DATE - INTERVAL '17 days', 6700.00, 'Annual software license renewals from clients', usd_id, entrada_id, employee_ids[3], client_ids[3]),
      ('Marketing Campaign', CURRENT_DATE - INTERVAL '19 days', 1800.00, 'International digital marketing campaign', usd_id, salida_id, employee_ids[2], client_ids[2]),
      ('Service Contract', CURRENT_DATE - INTERVAL '23 days', 15500.00, 'Multi-year service contract with enterprise client', usd_id, entrada_id, employee_ids[1], client_ids[1]),
      ('Professional Fees', CURRENT_DATE - INTERVAL '26 days', 2400.00, 'Legal and accounting professional services', usd_id, salida_id, employee_ids[3], client_ids[3]),
      ('Product Export', CURRENT_DATE - INTERVAL '29 days', 22000.00, 'Large export order to US market', usd_id, entrada_id, employee_ids[2], client_ids[2]),
      ('Software Licenses', CURRENT_DATE - INTERVAL '32 days', 1650.00, 'Annual licenses for development tools', usd_id, salida_id, employee_ids[1], client_ids[1]),
      ('Training Income', CURRENT_DATE - INTERVAL '36 days', 4800.00, 'Revenue from corporate training programs', usd_id, entrada_id, employee_ids[3], client_ids[3]),
      ('Travel Expenses', CURRENT_DATE - INTERVAL '38 days', 3100.00, 'Business trip for international conference', usd_id, salida_id, employee_ids[2], client_ids[2]),
      ('Partnership Revenue', CURRENT_DATE - INTERVAL '42 days', 18500.00, 'Revenue from strategic partnership agreement', usd_id, entrada_id, employee_ids[1], client_ids[1]),
      ('Technology Stack', CURRENT_DATE - INTERVAL '47 days', 2900.00, 'Annual renewal of technology stack subscriptions', usd_id, salida_id, employee_ids[3], client_ids[3]);
      
  END IF;
END $$;