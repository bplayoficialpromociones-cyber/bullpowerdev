import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testGameTypeDelete() {
  console.log('\n=== TEST DE ELIMINACIÓN DE TIPO DE JUEGO CON FK CONSTRAINT ===\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('1. Listando todos los tipos de juego y sus juegos asociados...');
  const { data: allGameTypes } = await supabase
    .from('game_types')
    .select('id, name');

  if (!allGameTypes || allGameTypes.length === 0) {
    console.log('No se encontró ningún tipo de juego');
    return;
  }

  for (const type of allGameTypes) {
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', type.id);
    console.log(`   - ${type.name}: ${count || 0} juegos`);
  }

  console.log('\n2. Buscando un tipo de juego con juegos asociados...');
  let gameType = null;
  for (const type of allGameTypes) {
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', type.id);
    if (count && count > 0) {
      gameType = { ...type, gamesCount: count };
      break;
    }
  }

  if (!gameType) {
    console.log('No se encontró ningún tipo de juego con juegos asociados');
    return;
  }

  console.log(`   Tipo encontrado: ${gameType.name} (ID: ${gameType.id})`);
  console.log(`   Juegos asociados: ${gameType.gamesCount}\n`);

  console.log('3. Intentando eliminar el tipo de juego a través de la edge function...');

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/game-types-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: gameType.id }),
    });

    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);

    const result = await response.json();
    console.log('   Respuesta JSON:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.log('\n   ❌ La respuesta no fue exitosa (esto es esperado)');
      console.log(`   Código de error: ${result.code}`);
      console.log(`   Mensaje de error: ${result.error}`);
    } else {
      console.log('\n   ⚠️ La respuesta fue exitosa (esto NO es esperado si hay FK constraint)');
    }

  } catch (error) {
    console.log('\n   ❌ Error al llamar a la función:', error.message);
  }

  console.log('\n4. Verificando si el tipo de juego todavía existe...');
  const { data: stillExists } = await supabase
    .from('game_types')
    .select('id, name')
    .eq('id', gameType.id)
    .single();

  if (stillExists) {
    console.log(`   ✅ El tipo de juego "${stillExists.name}" todavía existe (correcto)`);
  } else {
    console.log('   ❌ El tipo de juego fue eliminado (incorrecto - no debería eliminarse con juegos asociados)');
  }

  console.log('\n5. Intentando eliminar directamente desde la base de datos...');
  const { error: dbError } = await supabase
    .from('game_types')
    .delete()
    .eq('id', gameType.id);

  if (dbError) {
    console.log('   ❌ Error de base de datos (esperado):');
    console.log(`   Código: ${dbError.code}`);
    console.log(`   Mensaje: ${dbError.message}`);
    console.log(`   Details: ${dbError.details}`);
    console.log(`   Hint: ${dbError.hint}`);
  } else {
    console.log('   ⚠️ No hubo error (inesperado)');
  }

  console.log('\n=== FIN DEL TEST ===\n');
}

testGameTypeDelete().catch(console.error);
