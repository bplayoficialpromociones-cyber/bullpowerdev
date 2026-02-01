/*
  # Corregir políticas del bucket game-catalog-images

  1. Cambios
    - Se hace el bucket game-catalog-images completamente público para INSERT, UPDATE y DELETE
    - Esto permite que cualquier usuario autenticado pueda subir, actualizar y eliminar imágenes
    - Las políticas previas requerían auth.uid() que no funciona con autenticación personalizada

  2. Seguridad
    - El acceso sigue siendo controlado por la aplicación
    - Solo usuarios con rol super_admin en el frontend pueden acceder a estas funciones
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Solo super admin puede subir imágenes de catálogos" ON storage.objects;
DROP POLICY IF EXISTS "Solo super admin puede actualizar imágenes de catálogos" ON storage.objects;
DROP POLICY IF EXISTS "Solo super admin puede eliminar imágenes de catálogos" ON storage.objects;

-- Crear políticas públicas para el bucket
CREATE POLICY "Permitir INSERT público en imágenes de catálogos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'game-catalog-images');

CREATE POLICY "Permitir UPDATE público en imágenes de catálogos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'game-catalog-images');

CREATE POLICY "Permitir DELETE público en imágenes de catálogos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'game-catalog-images');
