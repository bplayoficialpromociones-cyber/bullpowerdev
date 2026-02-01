import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testDeleteHoldWin() {
  console.log('\n=== TEST DE ELIMINACIÓN DE "HOLD & WIN" ===\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // ID de Hold & Win según la consulta anterior
  const holdWinId = '7e244d1e-b13e-40f4-8da8-1d37fefa0a58';

  console.log('1. Verificando tipo de juego "Hold & Win"...');
  const { data: holdWin } = await supabase
    .from('game_types')
    .select('id, name')
    .eq('id', holdWinId)
    .single();

  if (!holdWin) {
    console.log('   ❌ No se encontró el tipo de juego');
    return;
  }

  console.log(`   ✅ Tipo encontrado: ${holdWin.name} (${holdWin.id})`);

  console.log('\n2. Verificando juegos asociados...');
  const { data: associatedGames } = await supabase
    .from('games')
    .select('id, name')
    .eq('game_type_id', holdWinId);

  console.log(`   Juegos encontrados: ${associatedGames?.length || 0}`);
  associatedGames?.forEach(game => {
    console.log(`   - ${game.name}`);
  });

  console.log('\n3. Intentando eliminar a través de la edge function...');

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/game-types-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: holdWinId }),
    });

    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);

    const contentType = response.headers.get('content-type');
    console.log(`   Content-Type: ${contentType}`);

    const responseText = await response.text();
    console.log(`   Response (raw): ${responseText}`);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('   Response (parsed):', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('   ❌ No se pudo parsear como JSON');
    }

    if (!response.ok) {
      console.log('\n   ✅ La respuesta NO fue exitosa (esto es correcto)');
      if (result) {
        console.log(`   Código de error: ${result.code}`);
        console.log(`   Mensaje: ${result.error}`);
      }
    } else {
      console.log('\n   ❌ La respuesta FUE exitosa (esto es INCORRECTO)');
    }

  } catch (error) {
    console.log('\n   ❌ Error al llamar a la función:', error.message);
  }

  console.log('\n4. Verificando si el tipo todavía existe...');
  const { data: stillExists } = await supabase
    .from('game_types')
    .select('id, name')
    .eq('id', holdWinId)
    .single();

  if (stillExists) {
    console.log(`   ✅ El tipo "${stillExists.name}" todavía existe (CORRECTO)`);
  } else {
    console.log('   ❌ El tipo fue eliminado (INCORRECTO)');
  }

  console.log('\n5. Intentando eliminar directamente desde la base de datos (para ver el error real)...');
  const { error: dbError } = await supabase
    .from('game_types')
    .delete()
    .eq('id', holdWinId);

  if (dbError) {
    console.log('   ✅ Error de base de datos (esto es esperado):');
    console.log(`   Código: ${dbError.code}`);
    console.log(`   Mensaje: ${dbError.message}`);
    console.log(`   Details: ${dbError.details}`);
    console.log(`   Hint: ${dbError.hint}`);
  } else {
    console.log('   ❌ No hubo error (inesperado)');
  }

  console.log('\n=== FIN DEL TEST ===\n');
}

testDeleteHoldWin().catch(console.error);
