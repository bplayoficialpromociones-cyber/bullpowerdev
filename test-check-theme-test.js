import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkThemeTest() {
  console.log('=== VERIFICANDO TEMÁTICA "TEST" EN BASE DE DATOS ===\n');

  try {
    // Buscar temáticas con nombre similar a "Test"
    console.log('1. Buscando temáticas que contengan "Test" en el nombre...');
    const { data: themes, error } = await supabase
      .from('themes')
      .select('*')
      .ilike('name', '%test%')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error al buscar temáticas:', error.message);
      return;
    }

    if (!themes || themes.length === 0) {
      console.log('⚠️ No se encontraron temáticas con "Test" en el nombre\n');
    } else {
      console.log(`✅ Se encontraron ${themes.length} temática(s) con "Test" en el nombre:\n`);
      themes.forEach((theme, index) => {
        console.log(`--- Temática ${index + 1} ---`);
        console.log(`   ID: ${theme.id}`);
        console.log(`   Nombre: ${theme.name}`);
        console.log(`   Descripción: ${theme.description || 'Sin descripción'}`);
        console.log(`   Imagen: ${theme.thumbnail_url || 'Sin imagen'}`);
        console.log(`   Creada: ${theme.created_at}`);
        console.log(`   Actualizada: ${theme.updated_at}\n`);
      });
    }

    // Listar todas las temáticas recientes (últimas 10)
    console.log('2. Listando las 10 temáticas más recientes...');
    const { data: recentThemes, error: recentError } = await supabase
      .from('themes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.log('❌ Error al listar temáticas recientes:', recentError.message);
      return;
    }

    if (recentThemes && recentThemes.length > 0) {
      console.log(`✅ Últimas ${recentThemes.length} temáticas creadas:\n`);
      recentThemes.forEach((theme, index) => {
        console.log(`${index + 1}. ${theme.name} (${theme.created_at}) - ${theme.thumbnail_url ? 'Con imagen' : 'Sin imagen'}`);
      });
      console.log('');
    }

    // Contar total de temáticas
    console.log('3. Contando total de temáticas...');
    const { count, error: countError } = await supabase
      .from('themes')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error al contar temáticas:', countError.message);
    } else {
      console.log(`✅ Total de temáticas en la base de datos: ${count}\n`);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

checkThemeTest();
