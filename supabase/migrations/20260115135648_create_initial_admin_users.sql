/*
  # Create Initial Admin Users

  ## Overview
  Creates 2 test users for each of the 4 roles (8 users total).
  Passwords are hashed using pgcrypto extension with bcrypt.

  ## Users Created

  ### Super Admin (2 users)
  1. admin@bullpower.com - Password: BullPower2026!
  2. superadmin@bullpower.com - Password: SuperAdmin2026!

  ### Facturación (2 users)
  3. facturacion1@bullpower.com - Password: Factura2026!
  4. facturacion2@bullpower.com - Password: Factura2026!

  ### Integrador (2 users)
  5. integrador1@bullpower.com - Password: Integra2026!
  6. integrador2@bullpower.com - Password: Integra2026!

  ### Soporte (2 users)
  7. soporte1@bullpower.com - Password: Soporte2026!
  8. soporte2@bullpower.com - Password: Soporte2026!

  ## Security
  - All passwords are hashed with bcrypt (using pgcrypto extension)
  - 2FA is disabled by default (can be enabled per user)
  - All users are active by default
  - No account locks or failed login attempts initially
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert Super Admin users
INSERT INTO admin_users (
  email, 
  password_hash, 
  full_name, 
  role_id, 
  two_factor_enabled,
  is_active
) VALUES
  (
    'admin@bullpower.com',
    crypt('BullPower2026!', gen_salt('bf', 10)),
    'Administrador Principal',
    (SELECT id FROM roles WHERE name = 'super_admin'),
    false,
    true
  ),
  (
    'superadmin@bullpower.com',
    crypt('SuperAdmin2026!', gen_salt('bf', 10)),
    'Super Administrador',
    (SELECT id FROM roles WHERE name = 'super_admin'),
    false,
    true
  )
ON CONFLICT (email) DO NOTHING;

-- Insert Facturación users
INSERT INTO admin_users (
  email, 
  password_hash, 
  full_name, 
  role_id, 
  two_factor_enabled,
  is_active
) VALUES
  (
    'facturacion1@bullpower.com',
    crypt('Factura2026!', gen_salt('bf', 10)),
    'María Fernández',
    (SELECT id FROM roles WHERE name = 'facturacion'),
    false,
    true
  ),
  (
    'facturacion2@bullpower.com',
    crypt('Factura2026!', gen_salt('bf', 10)),
    'Carlos Rodríguez',
    (SELECT id FROM roles WHERE name = 'facturacion'),
    false,
    true
  )
ON CONFLICT (email) DO NOTHING;

-- Insert Integrador users
INSERT INTO admin_users (
  email, 
  password_hash, 
  full_name, 
  role_id, 
  two_factor_enabled,
  is_active
) VALUES
  (
    'integrador1@bullpower.com',
    crypt('Integra2026!', gen_salt('bf', 10)),
    'Juan López',
    (SELECT id FROM roles WHERE name = 'integrador'),
    false,
    true
  ),
  (
    'integrador2@bullpower.com',
    crypt('Integra2026!', gen_salt('bf', 10)),
    'Ana Martínez',
    (SELECT id FROM roles WHERE name = 'integrador'),
    false,
    true
  )
ON CONFLICT (email) DO NOTHING;

-- Insert Soporte users
INSERT INTO admin_users (
  email, 
  password_hash, 
  full_name, 
  role_id, 
  two_factor_enabled,
  is_active
) VALUES
  (
    'soporte1@bullpower.com',
    crypt('Soporte2026!', gen_salt('bf', 10)),
    'Laura García',
    (SELECT id FROM roles WHERE name = 'soporte'),
    false,
    true
  ),
  (
    'soporte2@bullpower.com',
    crypt('Soporte2026!', gen_salt('bf', 10)),
    'Diego Sánchez',
    (SELECT id FROM roles WHERE name = 'soporte'),
    false,
    true
  )
ON CONFLICT (email) DO NOTHING;