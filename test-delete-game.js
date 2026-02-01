import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testDeleteGame() {
  console.log('\n=== TEST DE ELIMINACIÓN DE JUEGO "MYSTERIES OF THE PHOENIX" ===\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const gameId = '0955ef97-3f9a-479f-8e30-7f9c67b223ce';

  console.log('1. Verificando que el juego existe...');
  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('id, name, game_type_id')
    .eq('id', gameId)
    .single();

  if (fetchError || !game) {
    console.log('   ❌ El juego no existe o hubo un error:', fetchError?.message);
    return;
  }

  console.log(`   ✅ Juego encontrado: "${game.name}" (ID: ${game.id})`);

  console.log('\n2. Intentando eliminar el juego a través de la edge function...');

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/games-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: gameId }),
    });

    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);

    const responseText = await response.text();
    console.log(`   Response (raw): ${responseText}`);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('   Response (parsed):', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('   ❌ No se pudo parsear como JSON');
    }

    if (response.ok) {
      console.log('\n   ✅ La respuesta FUE exitosa');
    } else {
      console.log('\n   ❌ La respuesta NO fue exitosa');
      if (result) {
        console.log(`   Error: ${result.error}`);
      }
    }

  } catch (error) {
    console.log('\n   ❌ Error al llamar a la función:', error.message);
  }

  console.log('\n3. Verificando si el juego todavía existe...');
  const { data: stillExists, error: checkError } = await supabase
    .from('games')
    .select('id, name')
    .eq('id', gameId)
    .single();

  if (stillExists) {
    console.log(`   ❌ El juego "${stillExists.name}" TODAVÍA EXISTE (INCORRECTO si se intentó eliminar)`);
  } else {
    console.log('   ✅ El juego fue eliminado correctamente');
  }

  if (checkError) {
    console.log(`   Error al verificar: ${checkError.message}`);
  }

  console.log('\n4. Intentando eliminar directamente desde la base de datos...');
  const { error: dbError } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId);

  if (dbError) {
    console.log('   ❌ Error de base de datos:');
    console.log(`   Código: ${dbError.code}`);
    console.log(`   Mensaje: ${dbError.message}`);
    console.log(`   Details: ${dbError.details}`);
  } else {
    console.log('   ✅ Eliminación directa desde DB funcionó (o no hay error visible)');
  }

  console.log('\n5. Verificación final...');
  const { data: finalCheck } = await supabase
    .from('games')
    .select('id, name')
    .eq('id', gameId)
    .single();

  if (finalCheck) {
    console.log(`   ❌ El juego "${finalCheck.name}" SIGUE EXISTIENDO`);
  } else {
    console.log('   ✅ El juego YA NO EXISTE en la base de datos');
  }

  console.log('\n=== FIN DEL TEST ===\n');
}

testDeleteGame().catch(console.error);
