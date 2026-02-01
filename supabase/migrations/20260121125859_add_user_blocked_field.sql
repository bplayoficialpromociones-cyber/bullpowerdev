/*
  # Add user blocking functionality

  1. Changes
    - Add `is_blocked` field to `admin_users` table
      - Boolean field, defaults to false
      - When true, user cannot login to the system
    
  2. Security
    - Only Super Admin role can block/unblock users
    - Maintains existing RLS policies
  
  3. Notes
    - Blocked users will be automatically logged out
    - Super Admin cannot be blocked
*/

-- Add is_blocked field to admin_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_blocked'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_blocked boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for better query performance on blocked users
CREATE INDEX IF NOT EXISTS idx_admin_users_is_blocked ON admin_users(is_blocked);
