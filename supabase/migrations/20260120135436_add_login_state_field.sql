/*
  # Agregar campo de estado/provincia para geolocalización

  1. Cambios
    - Agregar campo `last_login_state` (text) a tabla `admin_users`
    - Este campo almacenará el estado o provincia de la ubicación del último login
    - Permite NULL para usuarios existentes sin datos

  2. Notas
    - Complementa los campos existentes `last_login_city` y `last_login_country`
    - Proporciona información de geolocalización más completa
*/

-- Agregar campo de estado/provincia
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_login_state'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_login_state text;
  END IF;
END $$;
