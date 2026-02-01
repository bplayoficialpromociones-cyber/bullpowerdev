/*
  # Update Invoice Bucket to Public

  1. Changes
    - Update the expense-invoices bucket to be public
    - This allows public URL access to uploaded invoices
    
  2. Security
    - Files are still uploaded through authenticated edge functions
    - Only authenticated users can upload/delete files
    - Public read access for viewing invoices
*/

-- Update bucket to public
UPDATE storage.buckets
SET public = true
WHERE id = 'expense-invoices';
