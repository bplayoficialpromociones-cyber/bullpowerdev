import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testThemeImageUpload() {
  console.log('=== PRUEBA DE SUBIDA DE IMAGEN DE TEMÁTICA ===\n');

  // Paso 1: Crear una imagen de prueba (1x1 pixel PNG)
  console.log('1. Creando imagen de prueba...');
  // PNG de 1x1 pixel rojo en base64
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(base64Image, 'base64');

  // Crear un Blob desde el buffer
  const blob = new Blob([imageBuffer], { type: 'image/png' });
  console.log('✅ Imagen de prueba creada (1x1 pixel PNG)\n');

  // Paso 2: Obtener una temática existente
  console.log('2. Obteniendo temática existente...');
  const { data: themes, error: themesError } = await supabase
    .from('themes')
    .select('*')
    .limit(1);

  if (themesError || !themes || themes.length === 0) {
    console.log('❌ No se pudo obtener una temática');
    return;
  }

  const theme = themes[0];
  console.log(`✅ Temática obtenida: "${theme.name}" (ID: ${theme.id})\n`);

  // Paso 3: Subir imagen al bucket
  console.log('3. Subiendo imagen al bucket game-catalog-images...');
  const fileName = `theme-${theme.id}-${Date.now()}.png`;
  const filePath = fileName;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('game-catalog-images')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/png'
    });

  if (uploadError) {
    console.log('❌ Error al subir imagen:', uploadError.message);
    return;
  }

  console.log('✅ Imagen subida exitosamente al bucket\n');

  // Paso 4: Obtener URL pública de la imagen
  console.log('4. Obteniendo URL pública de la imagen...');
  const { data: publicUrlData } = supabase.storage
    .from('game-catalog-images')
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;
  console.log(`✅ URL pública obtenida: ${imageUrl}\n`);

  // Paso 5: Actualizar temática con la URL de la imagen
  console.log('5. Actualizando temática con URL de imagen...');
  const updateResponse = await fetch(`${SUPABASE_URL}/functions/v1/themes-update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      id: theme.id,
      thumbnail_url: imageUrl
    })
  });

  if (updateResponse.ok) {
    const updatedTheme = await updateResponse.json();
    console.log('✅ Temática actualizada exitosamente');
    console.log(`   Thumbnail URL: ${updatedTheme.thumbnail_url}\n`);
  } else {
    const error = await updateResponse.json();
    console.log('❌ Error al actualizar temática:', error.error);
    return;
  }

  // Paso 6: Verificar que la imagen está accesible
  console.log('6. Verificando que la imagen es accesible públicamente...');
  try {
    const imageCheckResponse = await fetch(imageUrl);
    if (imageCheckResponse.ok) {
      console.log('✅ Imagen accesible públicamente\n');
    } else {
      console.log(`⚠️ Imagen no accesible (status: ${imageCheckResponse.status})\n`);
    }
  } catch (error) {
    console.log('⚠️ No se pudo verificar acceso a la imagen\n');
  }

  console.log('=== PRUEBA COMPLETADA EXITOSAMENTE ===');
  console.log('✅ La subida de imágenes de temáticas funciona correctamente');
  console.log(`\n💡 Puedes ver la imagen en: ${imageUrl}`);
}

testThemeImageUpload().catch(err => {
  console.error('❌ Error inesperado:', err.message);
});
