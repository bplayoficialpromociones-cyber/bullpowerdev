/*
  # Add Website URL to Clients
  
  ## Description
  Adds a website_url field to the crm_clients table to store company websites.
  
  ## Changes Made
  1. Adds column `website_url` to `crm_clients`
    - Type: text (nullable)
    - Purpose: Store company website URL
    - Not required, can be left empty
  
  ## Notes
  - Field is optional and can be updated at any time
  - Uses standard URL format
  - No indexes needed as this field won't be used for filtering
*/

-- Add website_url column to crm_clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crm_clients' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE crm_clients ADD COLUMN website_url text;
  END IF;
END $$;
