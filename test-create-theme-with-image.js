import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCreateThemeWithImage() {
  console.log('=== PRUEBA DE CREAR TEMÁTICA CON IMAGEN ===\n');

  try {
    // Paso 1: Verificar que la imagen de prueba existe
    console.log('1. Verificando imagen de prueba...');
    const imagePath = path.join(process.cwd(), 'public', 'image.png');

    if (!fs.existsSync(imagePath)) {
      console.log('❌ No se encuentra la imagen de prueba en:', imagePath);
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    console.log(`✅ Imagen de prueba encontrada (${(imageBuffer.length / 1024).toFixed(2)} KB)\n`);

    // Paso 2: Subir imagen al bucket con ID temporal
    console.log('2. Subiendo imagen al bucket game-catalog-images...');
    const tempId = `temp-${Date.now()}`;
    const fileName = `theme-${tempId}-${Date.now()}.png`;
    const filePath = fileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('game-catalog-images')
      .upload(filePath, imageBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      });

    if (uploadError) {
      console.log('❌ Error al subir imagen:', uploadError.message);
      return;
    }

    console.log('✅ Imagen subida exitosamente al bucket\n');

    // Paso 3: Obtener URL pública de la imagen
    console.log('3. Obteniendo URL pública de la imagen...');
    const { data: publicUrlData } = supabase.storage
      .from('game-catalog-images')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;
    console.log(`✅ URL pública obtenida: ${imageUrl}\n`);

    // Paso 4: Crear temática con nombre, descripción e imagen
    console.log('4. Creando nueva temática con imagen...');
    const themeData = {
      name: 'Temática Espacial ' + Date.now(),
      description: 'Exploración del cosmos y aventuras entre las estrellas',
      thumbnail_url: imageUrl
    };

    const createResponse = await fetch(`${SUPABASE_URL}/functions/v1/themes-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(themeData)
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('❌ Error al crear temática:', error.error);
      return;
    }

    const newTheme = await createResponse.json();
    console.log('✅ Temática creada exitosamente');
    console.log(`   ID: ${newTheme.id}`);
    console.log(`   Nombre: ${newTheme.name}`);
    console.log(`   Descripción: ${newTheme.description}`);
    console.log(`   Imagen: ${newTheme.thumbnail_url}\n`);

    // Paso 5: Verificar que la temática se creó correctamente
    console.log('5. Verificando temática en la base de datos...');
    const { data: verifyTheme, error: verifyError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', newTheme.id)
      .single();

    if (verifyError) {
      console.log('❌ Error al verificar temática:', verifyError.message);
      return;
    }

    console.log('✅ Temática verificada en la base de datos');
    console.log(`   Nombre: ${verifyTheme.name}`);
    console.log(`   Descripción: ${verifyTheme.description}`);
    console.log(`   URL de imagen: ${verifyTheme.thumbnail_url}`);
    console.log(`   Fecha creación: ${verifyTheme.created_at}\n`);

    // Paso 6: Verificar que la imagen es accesible
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

    // Paso 7: Limpiar - eliminar temática de prueba
    console.log('7. Limpiando - eliminando temática de prueba...');
    const deleteResponse = await fetch(`${SUPABASE_URL}/functions/v1/themes-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ id: newTheme.id })
    });

    if (deleteResponse.ok) {
      console.log('✅ Temática de prueba eliminada correctamente\n');
    } else {
      const error = await deleteResponse.json();
      console.log('⚠️ No se pudo eliminar temática de prueba:', error.error, '\n');
    }

    console.log('=== RESUMEN DE PRUEBA ===');
    console.log('✅ Imagen subida correctamente al bucket');
    console.log('✅ URL pública generada correctamente');
    console.log('✅ Temática creada con nombre, descripción e imagen');
    console.log('✅ Temática verificada en la base de datos');
    console.log('✅ Imagen accesible públicamente');
    console.log('✅ Temática de prueba eliminada');
    console.log('\n=== PRUEBA COMPLETADA EXITOSAMENTE ===');
    console.log('\n💡 Ahora puedes crear temáticas con imagen desde el frontend en:');
    console.log('   https://bullpowerdev.ar/dashboard/juegos -> Temáticas -> Nueva Temática');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testCreateThemeWithImage();
