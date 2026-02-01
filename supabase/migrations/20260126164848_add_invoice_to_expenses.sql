/*
  # Add Invoice Field to Expenses

  1. Changes
    - Add `invoice_url` column to `expenses` table to store the URL of uploaded invoice files
    - Add `invoice_filename` column to store the original filename for display purposes
    
  2. Storage
    - Create storage bucket for expense invoices
    - Enable RLS on the bucket
    - Add policies for authenticated users to upload and view invoices
*/

-- Add invoice fields to expenses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'invoice_url'
  ) THEN
    ALTER TABLE expenses ADD COLUMN invoice_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'invoice_filename'
  ) THEN
    ALTER TABLE expenses ADD COLUMN invoice_filename text;
  END IF;
END $$;

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-invoices', 'expense-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON storage.objects;

-- Allow authenticated users to upload invoices
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'expense-invoices');

-- Allow authenticated users to view invoices
CREATE POLICY "Authenticated users can view invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense-invoices');

-- Allow authenticated users to delete invoices
CREATE POLICY "Authenticated users can delete invoices"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'expense-invoices');