import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testThemesQuery() {
  console.log('=== PROBANDO QUERY DE TEMÁTICAS (IGUAL QUE FRONTEND) ===\n');

  try {
    console.log('1. Ejecutando query exacto del frontend...');
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        games_themes(count)
      `)
      .order('name', { ascending: true });

    if (error) {
      console.log('❌ Error en el query:', error.message);
      console.log('   Detalles:', error);
      return;
    }

    console.log(`✅ Query ejecutado exitosamente. Total de registros: ${data?.length || 0}\n`);

    if (data && data.length > 0) {
      console.log('2. Procesando datos (igual que frontend)...');
      const processedData = data.map(theme => ({
        ...theme,
        games_count: theme.games_themes?.[0]?.count || 0
      }));

      console.log(`✅ Datos procesados: ${processedData.length} temáticas\n`);

      console.log('3. Listando todas las temáticas procesadas:\n');
      processedData.forEach((theme, index) => {
        console.log(`${index + 1}. ${theme.name}`);
        console.log(`   ID: ${theme.id}`);
        console.log(`   Descripción: ${theme.description || 'Sin descripción'}`);
        console.log(`   Imagen: ${theme.thumbnail_url || 'Sin imagen'}`);
        console.log(`   Juegos: ${theme.games_count}`);
        console.log(`   games_themes: ${JSON.stringify(theme.games_themes)}`);
        console.log('');
      });

      // Verificar específicamente la temática "test"
      const testTheme = processedData.find(t => t.name.toLowerCase() === 'test');
      if (testTheme) {
        console.log('✅ Temática "test" encontrada en los resultados procesados!');
        console.log('   Debería mostrarse en el frontend.\n');
      } else {
        console.log('⚠️ Temática "test" NO encontrada en los resultados procesados');
        console.log('   Puede haber un problema con el query o el procesamiento.\n');
      }
    }

    // Verificar también con un query simple sin joins
    console.log('4. Verificando con query simple sin joins...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true });

    if (simpleError) {
      console.log('❌ Error en query simple:', simpleError.message);
    } else {
      console.log(`✅ Query simple: ${simpleData?.length || 0} temáticas`);
      const testThemeSimple = simpleData?.find(t => t.name.toLowerCase() === 'test');
      if (testThemeSimple) {
        console.log('✅ Temática "test" encontrada en query simple\n');
      }
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testThemesQuery();
