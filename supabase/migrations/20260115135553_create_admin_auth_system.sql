/*
  # Create Admin Authentication System

  ## Overview
  Creates the complete authentication and authorization system for Bull Power Admin.
  This includes roles, permissions, and admin users with 2FA support.

  ## New Tables

  ### 1. `roles`
  Defines the 4 user roles in the system:
  - `id` (uuid, primary key)
  - `name` (text, unique) - Role name (super_admin, facturacion, integrador, soporte)
  - `display_name` (text) - Human-readable name
  - `description` (text) - Role description
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `permissions`
  Granular permissions for different actions:
  - `id` (uuid, primary key)
  - `name` (text, unique) - Permission identifier
  - `display_name` (text) - Human-readable name
  - `module` (text) - Module/section this permission belongs to
  - `description` (text)
  - `created_at` (timestamptz)

  ### 3. `role_permissions`
  Many-to-many relationship between roles and permissions:
  - `role_id` (uuid, foreign key to roles)
  - `permission_id` (uuid, foreign key to permissions)
  - `created_at` (timestamptz)
  - Primary key: (role_id, permission_id)

  ### 4. `admin_users`
  Admin user accounts with 2FA support:
  - `id` (uuid, primary key)
  - `email` (text, unique)
  - `password_hash` (text) - Bcrypt hashed password
  - `full_name` (text)
  - `role_id` (uuid, foreign key to roles)
  - `two_factor_secret` (text, nullable) - TOTP secret for 2FA
  - `two_factor_enabled` (boolean) - Whether 2FA is active
  - `last_login_at` (timestamptz, nullable)
  - `login_attempts` (integer) - Failed login counter
  - `locked_until` (timestamptz, nullable) - Account lock timestamp
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `created_by` (uuid, nullable) - User who created this record
  - `updated_by` (uuid, nullable) - User who last updated this record
  - `deleted_at` (timestamptz, nullable) - Soft delete timestamp
  - `deleted_by` (uuid, nullable) - User who deleted this record

  ### 5. `admin_audit_log`
  Complete audit trail of all admin actions:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to admin_users)
  - `action` (text) - Action performed (login, create_user, update_user, etc.)
  - `module` (text) - Module where action occurred
  - `entity_type` (text, nullable) - Type of entity affected
  - `entity_id` (uuid, nullable) - ID of affected entity
  - `old_values` (jsonb, nullable) - Previous values
  - `new_values` (jsonb, nullable) - New values
  - `ip_address` (text, nullable) - User's IP address
  - `user_agent` (text, nullable) - Browser/client info
  - `created_at` (timestamptz)

  ## Security
  - NO RLS policies (security handled at application level)
  - Soft deletes for admin_users (deleted_at column)
  - Audit logging for all actions
  - Password hashing with bcrypt
  - 2FA support with TOTP
  - Account locking after failed attempts

  ## Indexes
  - Email lookup on admin_users
  - Role lookup on admin_users
  - Audit log queries by user, action, and date
  - Soft delete queries (deleted_at IS NULL)
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  module text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE RESTRICT,
  two_factor_secret text,
  two_factor_enabled boolean DEFAULT false,
  last_login_at timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  updated_by uuid REFERENCES admin_users(id),
  deleted_at timestamptz,
  deleted_by uuid REFERENCES admin_users(id)
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  module text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admin_users_deleted_at ON admin_users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_module ON admin_audit_log(module);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_users updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for roles updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();