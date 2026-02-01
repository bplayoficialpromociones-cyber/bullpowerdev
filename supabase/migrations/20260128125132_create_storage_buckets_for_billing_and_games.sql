/*
  # Crear buckets de Storage para Facturación y Juegos

  ## Descripción
  Esta migración crea los buckets de almacenamiento necesarios para:
  - PDFs de facturas (invoices-pdf)
  - Imágenes de juegos (game-images)
  - Imágenes de tipos de juegos, temáticas y mecánicas (game-catalog-images)

  ## 1. Buckets Creados
    - `invoices-pdf`: Almacena archivos PDF de facturas
      - Público: NO
      - Tipos permitidos: application/pdf
      - Tamaño máximo: 10MB

    - `game-images`: Almacena thumbnails e imágenes de juegos
      - Público: SÍ (para mostrar en interfaces públicas)
      - Tipos permitidos: image/jpeg, image/png, image/webp
      - Tamaño máximo: 5MB

    - `game-catalog-images`: Almacena imágenes de catálogos (tipos, temáticas, mecánicas)
      - Público: SÍ
      - Tipos permitidos: image/jpeg, image/png, image/webp
      - Tamaño máximo: 5MB

  ## 2. Seguridad
    - Los buckets de facturas solo son accesibles por super_admin y facturacion
    - Los buckets de juegos son públicos para lectura
    - La escritura en buckets de juegos solo para super_admin

  ## 3. Políticas de Acceso
    - SELECT (leer): Según tipo de bucket
    - INSERT (subir): Según rol
    - UPDATE (actualizar): Según rol
    - DELETE (eliminar): Solo super_admin
*/

-- =====================================================
-- CREAR BUCKETS
-- =====================================================

-- Bucket para PDFs de facturas (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices-pdf',
  'invoices-pdf',
  false,
  10485760,  -- 10MB
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de juegos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-images',
  'game-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de catálogos de juegos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-catalog-images',
  'game-catalog-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS PARA BUCKET: invoices-pdf
-- =====================================================

-- Permitir lectura de PDFs de facturas a super_admin y facturacion
CREATE POLICY "Super admin y facturacion pueden leer PDFs de facturas"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices-pdf'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Permitir subir PDFs a super_admin y facturacion
CREATE POLICY "Super admin y facturacion pueden subir PDFs de facturas"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices-pdf'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Permitir actualizar PDFs a super_admin y facturacion
CREATE POLICY "Super admin y facturacion pueden actualizar PDFs de facturas"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'invoices-pdf'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name IN ('super_admin', 'facturacion')
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Solo super_admin puede eliminar PDFs
CREATE POLICY "Solo super admin puede eliminar PDFs de facturas"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'invoices-pdf'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- =====================================================
-- POLÍTICAS PARA BUCKET: game-images
-- =====================================================

-- Permitir lectura pública de imágenes de juegos
CREATE POLICY "Lectura pública de imágenes de juegos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-images');

-- Solo super_admin puede subir imágenes de juegos
CREATE POLICY "Solo super admin puede subir imágenes de juegos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'game-images'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Solo super_admin puede actualizar imágenes de juegos
CREATE POLICY "Solo super admin puede actualizar imágenes de juegos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'game-images'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Solo super_admin puede eliminar imágenes de juegos
CREATE POLICY "Solo super admin puede eliminar imágenes de juegos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'game-images'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- =====================================================
-- POLÍTICAS PARA BUCKET: game-catalog-images
-- =====================================================

-- Permitir lectura pública de imágenes de catálogos
CREATE POLICY "Lectura pública de imágenes de catálogos de juegos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-catalog-images');

-- Solo super_admin puede subir imágenes de catálogos
CREATE POLICY "Solo super admin puede subir imágenes de catálogos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'game-catalog-images'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Solo super_admin puede actualizar imágenes de catálogos
CREATE POLICY "Solo super admin puede actualizar imágenes de catálogos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'game-catalog-images'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );

-- Solo super_admin puede eliminar imágenes de catálogos
CREATE POLICY "Solo super admin puede eliminar imágenes de catálogos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'game-catalog-images'
    AND EXISTS (
      SELECT 1 FROM admin_users au
      JOIN roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.name = 'super_admin'
      AND au.is_active = true
      AND au.deleted_at IS NULL
    )
  );
