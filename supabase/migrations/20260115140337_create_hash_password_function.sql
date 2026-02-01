/*
  # Create Password Hashing Function

  ## Overview
  Creates a PostgreSQL function to hash passwords using bcrypt.
  This function is needed for creating new users.

  ## Function
  - hash_password(password text) RETURNS text
  - Uses pgcrypto extension for bcrypt hashing
*/

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;