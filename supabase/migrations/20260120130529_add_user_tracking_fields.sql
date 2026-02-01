/*
  # Agregar campos de tracking de usuarios

  1. Campos agregados a `admin_users`
    - `last_login_ip` (text) - Dirección IP del último login
    - `last_login_city` (text) - Ciudad del último login
    - `last_login_country` (text) - País del último login
    - `is_online` (boolean) - Estado de conexión actual (online/offline)
    - `last_activity_at` (timestamptz) - Última actividad registrada

  2. Notas
    - Los campos permiten NULL para usuarios existentes sin datos
    - `is_online` tiene valor por defecto FALSE
    - Se agrega índice para optimizar consultas por estado online
*/

-- Agregar campos de geolocalización y tracking
DO $$
BEGIN
  -- Dirección IP del último login
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_login_ip text;
  END IF;

  -- Ciudad del último login
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_login_city'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_login_city text;
  END IF;

  -- País del último login
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_login_country'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_login_country text;
  END IF;

  -- Estado de conexión actual
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_online boolean DEFAULT false;
  END IF;

  -- Última actividad registrada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_activity_at timestamptz;
  END IF;
END $$;

-- Crear índice para optimizar consultas por estado online
CREATE INDEX IF NOT EXISTS idx_admin_users_is_online ON admin_users(is_online) WHERE is_online = true;

-- Crear índice para optimizar consultas por última actividad
CREATE INDEX IF NOT EXISTS idx_admin_users_last_activity ON admin_users(last_activity_at DESC) WHERE last_activity_at IS NOT NULL;