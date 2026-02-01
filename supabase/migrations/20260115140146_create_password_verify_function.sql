/*
  # Create Password Verification Function

  ## Overview
  Creates a PostgreSQL function to verify passwords using bcrypt.
  This function is needed for the authentication edge functions.

  ## Function
  - verify_password(password text, hash text) RETURNS boolean
  - Uses pgcrypto extension for bcrypt comparison
*/

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;