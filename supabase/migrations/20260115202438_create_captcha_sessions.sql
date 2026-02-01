/*
  # Crear sistema de sesiones de CAPTCHA

  1. Nueva Tabla
    - `captcha_sessions`
      - `id` (uuid, primary key)
      - `session_token` (text, unique) - Token único para identificar la sesión
      - `answer` (integer) - Respuesta correcta del CAPTCHA
      - `verified` (boolean) - Si el CAPTCHA ya fue verificado
      - `expires_at` (timestamptz) - Fecha de expiración (5 minutos)
      - `created_at` (timestamptz) - Fecha de creación
      - `ip_address` (text) - Dirección IP del solicitante

  2. Seguridad
    - Enable RLS en `captcha_sessions`
    - No se permiten selects directos (solo a través de edge functions con service role)
    - Limpieza automática de sesiones expiradas

  3. Índices
    - Índice en `session_token` para búsquedas rápidas
    - Índice en `expires_at` para limpieza eficiente
*/

CREATE TABLE IF NOT EXISTS captcha_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  answer integer NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE captcha_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to captcha_sessions"
  ON captcha_sessions
  FOR ALL
  TO authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_captcha_sessions_token ON captcha_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_captcha_sessions_expires ON captcha_sessions(expires_at);

CREATE OR REPLACE FUNCTION cleanup_expired_captcha_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM captcha_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;