/*
  # Corregir políticas RLS para captcha_sessions

  1. Cambios
    - Eliminar la política restrictiva que bloquea TODO acceso
    - El service role key siempre debe tener acceso completo (bypassea RLS automáticamente)
    - Asegurar que anon key no pueda acceder directamente

  2. Notas
    - El service role bypasea RLS automáticamente
    - Solo necesitamos asegurar que usuarios anónimos no tengan acceso directo
*/

DROP POLICY IF EXISTS "No direct access to captcha_sessions" ON captcha_sessions;

CREATE POLICY "Service role full access to captcha_sessions"
  ON captcha_sessions
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Anon no access to captcha_sessions"
  ON captcha_sessions
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
