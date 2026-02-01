/*
  # Insert Initial Roles and Permissions

  ## Overview
  Populates the system with the 4 defined roles and their corresponding permissions.

  ## Roles Created
  1. **Super Admin** - Full system access without restrictions
  2. **Facturación** - Access to billing, payments, and financial reports
  3. **Integrador** - Access to integrations and onboarding processes
  4. **Soporte** - Access to ticketing system and customer support

  ## Permissions Structure
  Permissions are organized by modules:
  - usuarios_admin: User management
  - facturacion: Billing and payments
  - integraciones: Integrations management
  - soporte: Support tickets
  - trafico: Traffic monitoring
  - crm: Customer relationship management
  - gastos: Expenses and cash flow
  - analytics: Reports and analytics
  - configuracion: System configuration

  ## Permission Naming Convention
  Format: {module}_{action}
  Actions: view, create, edit, delete, manage
*/

-- Insert roles
INSERT INTO roles (name, display_name, description, is_active) VALUES
  ('super_admin', 'Super Admin', 'Acceso completo al sistema sin restricciones. Puede realizar cualquier acción en todas las pantallas.', true),
  ('facturacion', 'Facturación', 'Acceso a pantallas de facturación, pagos, cobranzas y reportes financieros.', true),
  ('integrador', 'Integrador', 'Acceso a pantallas de integración con operadores y agregadores. Gestiona onboarding y configuraciones técnicas.', true),
  ('soporte', 'Soporte', 'Acceso al sistema de tickets y soporte a clientes. Gestiona incidencias y consultas.', true)
ON CONFLICT (name) DO NOTHING;

-- Insert permissions

-- Usuarios Admin permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('usuarios_admin_view', 'Ver Usuarios', 'usuarios_admin', 'Ver lista de usuarios del sistema'),
  ('usuarios_admin_create', 'Crear Usuarios', 'usuarios_admin', 'Crear nuevos usuarios'),
  ('usuarios_admin_edit', 'Editar Usuarios', 'usuarios_admin', 'Modificar datos de usuarios existentes'),
  ('usuarios_admin_delete', 'Eliminar Usuarios', 'usuarios_admin', 'Eliminar usuarios del sistema'),
  ('usuarios_admin_manage', 'Gestionar Usuarios', 'usuarios_admin', 'Acceso completo a gestión de usuarios')
ON CONFLICT (name) DO NOTHING;

-- Facturación permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('facturacion_view', 'Ver Facturación', 'facturacion', 'Ver facturas y reportes financieros'),
  ('facturacion_create', 'Crear Facturas', 'facturacion', 'Generar nuevas facturas'),
  ('facturacion_edit', 'Editar Facturas', 'facturacion', 'Modificar facturas existentes'),
  ('facturacion_delete', 'Eliminar Facturas', 'facturacion', 'Anular facturas'),
  ('facturacion_manage', 'Gestionar Facturación', 'facturacion', 'Acceso completo al módulo de facturación')
ON CONFLICT (name) DO NOTHING;

-- Integraciones permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('integraciones_view', 'Ver Integraciones', 'integraciones', 'Ver integraciones y procesos de onboarding'),
  ('integraciones_create', 'Crear Integraciones', 'integraciones', 'Iniciar nuevas integraciones'),
  ('integraciones_edit', 'Editar Integraciones', 'integraciones', 'Modificar configuraciones de integraciones'),
  ('integraciones_delete', 'Eliminar Integraciones', 'integraciones', 'Eliminar integraciones'),
  ('integraciones_manage', 'Gestionar Integraciones', 'integraciones', 'Acceso completo al módulo de integraciones')
ON CONFLICT (name) DO NOTHING;

-- Soporte permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('soporte_view', 'Ver Tickets', 'soporte', 'Ver tickets de soporte'),
  ('soporte_create', 'Crear Tickets', 'soporte', 'Crear nuevos tickets'),
  ('soporte_edit', 'Editar Tickets', 'soporte', 'Responder y actualizar tickets'),
  ('soporte_delete', 'Eliminar Tickets', 'soporte', 'Cerrar y eliminar tickets'),
  ('soporte_manage', 'Gestionar Soporte', 'soporte', 'Acceso completo al módulo de soporte')
ON CONFLICT (name) DO NOTHING;

-- Tráfico permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('trafico_view', 'Ver Tráfico', 'trafico', 'Ver estadísticas de tráfico de juegos'),
  ('trafico_manage', 'Gestionar Tráfico', 'trafico', 'Configurar alertas y monitoreo de tráfico')
ON CONFLICT (name) DO NOTHING;

-- CRM permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('crm_view', 'Ver CRM', 'crm', 'Ver clientes B2B (operadores y agregadores)'),
  ('crm_create', 'Crear Clientes', 'crm', 'Agregar nuevos clientes'),
  ('crm_edit', 'Editar Clientes', 'crm', 'Modificar información de clientes'),
  ('crm_delete', 'Eliminar Clientes', 'crm', 'Eliminar clientes del CRM'),
  ('crm_manage', 'Gestionar CRM', 'crm', 'Acceso completo al módulo CRM')
ON CONFLICT (name) DO NOTHING;

-- Gastos permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('gastos_view', 'Ver Gastos', 'gastos', 'Ver gastos y flujo de caja'),
  ('gastos_create', 'Crear Gastos', 'gastos', 'Registrar nuevos gastos'),
  ('gastos_edit', 'Editar Gastos', 'gastos', 'Modificar gastos existentes'),
  ('gastos_delete', 'Eliminar Gastos', 'gastos', 'Eliminar registros de gastos'),
  ('gastos_manage', 'Gestionar Gastos', 'gastos', 'Acceso completo al módulo de gastos')
ON CONFLICT (name) DO NOTHING;

-- Analytics permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('analytics_view', 'Ver Analytics', 'analytics', 'Ver reportes y métricas'),
  ('analytics_export', 'Exportar Reportes', 'analytics', 'Exportar reportes en PDF/Excel/CSV'),
  ('analytics_manage', 'Gestionar Analytics', 'analytics', 'Configurar reportes y dashboards')
ON CONFLICT (name) DO NOTHING;

-- Configuración permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('configuracion_view', 'Ver Configuración', 'configuracion', 'Ver configuraciones del sistema'),
  ('configuracion_edit', 'Editar Configuración', 'configuracion', 'Modificar configuraciones'),
  ('configuracion_manage', 'Gestionar Configuración', 'configuracion', 'Acceso completo a configuraciones')
ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to Super Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'super_admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- Assign Facturación permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'facturacion'),
  id
FROM permissions
WHERE module IN ('facturacion', 'gastos', 'analytics')
   OR name IN ('crm_view', 'trafico_view')
ON CONFLICT DO NOTHING;

-- Assign Integrador permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'integrador'),
  id
FROM permissions
WHERE module IN ('integraciones', 'crm')
   OR name IN ('trafico_view', 'analytics_view', 'soporte_view')
ON CONFLICT DO NOTHING;

-- Assign Soporte permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'soporte'),
  id
FROM permissions
WHERE module IN ('soporte')
   OR name IN ('crm_view', 'integraciones_view', 'analytics_view')
ON CONFLICT DO NOTHING;