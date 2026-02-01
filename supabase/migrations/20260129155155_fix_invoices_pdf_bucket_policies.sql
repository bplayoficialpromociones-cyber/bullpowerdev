/*
  # Fix invoices-pdf bucket policies

  1. Changes
    - Create RLS policies for invoices-pdf bucket
    - Allow public SELECT (read) access to PDF files
    - Allow authenticated users to INSERT PDFs
    - Allow authenticated users to DELETE PDFs
    
  2. Security
    - Public can view all invoices PDFs
    - Only authenticated users can upload/delete PDFs
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view invoice PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload invoice PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete invoice PDFs" ON storage.objects;

-- Allow public SELECT on invoices-pdf bucket
CREATE POLICY "Public can view invoice PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invoices-pdf');

-- Allow authenticated users to INSERT
CREATE POLICY "Authenticated users can upload invoice PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices-pdf');

-- Allow authenticated users to DELETE
CREATE POLICY "Authenticated users can delete invoice PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invoices-pdf');