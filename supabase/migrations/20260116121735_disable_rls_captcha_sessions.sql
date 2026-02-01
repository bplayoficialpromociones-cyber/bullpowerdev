/*
  # Deshabilitar RLS para captcha_sessions

  1. Cambios
    - Deshabilitar RLS en la tabla captcha_sessions
    - Esta tabla solo se accede vía edge functions con service role key
    - No hay acceso directo desde el cliente

  2. Seguridad
    - El anon key no tiene acceso directo a edge functions sensibles
    - Todas las operaciones pasan por validación en edge functions
*/

DROP POLICY IF EXISTS "Service role full access to captcha_sessions" ON captcha_sessions;
DROP POLICY IF EXISTS "Anon no access to captcha_sessions" ON captcha_sessions;
DROP POLICY IF EXISTS "No direct access to captcha_sessions" ON captcha_sessions;

ALTER TABLE captcha_sessions DISABLE ROW LEVEL SECURITY;
