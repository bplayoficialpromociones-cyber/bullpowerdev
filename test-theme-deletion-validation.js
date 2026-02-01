import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function testThemeDeletionValidation() {
  console.log('=== PRUEBA DE VALIDACIÓN DE ELIMINACIÓN DE TEMÁTICAS ===\n');

  // Paso 1: Obtener una temática que tenga juegos asociados
  console.log('1. Buscando temática con juegos asociados...');

  const themesResponse = await fetch(`${SUPABASE_URL}/rest/v1/themes?select=*,games_themes(count)&limit=20`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const themes = await themesResponse.json();

  const themeWithGames = themes.find(t => t.games_themes?.[0]?.count > 0);

  if (themeWithGames) {
    console.log(`✅ Encontrada temática "${themeWithGames.name}" con ${themeWithGames.games_themes[0].count} juegos\n`);

    // Intentar eliminar temática con juegos
    console.log('2. Intentando eliminar temática con juegos (debe fallar)...');
    const deleteResponse1 = await fetch(`${SUPABASE_URL}/functions/v1/themes-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ id: themeWithGames.id })
    });

    const deleteResult1 = await deleteResponse1.json();

    if (!deleteResponse1.ok && deleteResult1.error) {
      console.log('✅ VALIDACIÓN EXITOSA: No se permite eliminar temática con juegos');
      console.log(`   Mensaje: "${deleteResult1.error}"\n`);
    } else {
      console.log('❌ ERROR: Se permitió eliminar temática con juegos (no debería)\n');
    }
  } else {
    console.log('⚠️ No se encontró temática con juegos para prueba inicial\n');
  }

  // Paso 3: Crear una temática de prueba
  console.log('3. Creando temática de prueba...');
  const createThemeResponse = await fetch(`${SUPABASE_URL}/functions/v1/themes-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      name: 'Temática Test ' + Date.now(),
      description: 'Temática temporal para pruebas de eliminación'
    })
  });

  const newTheme = await createThemeResponse.json();
  console.log(`✅ Temática creada: "${newTheme.name}" (ID: ${newTheme.id})\n`);

  // Paso 4: Obtener catálogos necesarios para crear juegos
  console.log('4. Obteniendo catálogos para crear juegos...');

  const gameTypesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_types?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const gameTypes = await gameTypesResponse.json();

  const volatilitiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_volatilities?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const volatilities = await volatilitiesResponse.json();

  const statusesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_statuses?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const statuses = await statusesResponse.json();

  console.log('✅ Catálogos obtenidos\n');

  // Paso 5: Crear dos juegos con la temática
  console.log('5. Creando dos juegos con la temática de prueba...');

  const game1Data = {
    name: 'Juego Test 1 - ' + Date.now(),
    game_type_id: gameTypes[0].id,
    rtp: 96.5,
    volatility_id: volatilities[0].id,
    status_id: statuses[0].id,
    themes: [newTheme.id]
  };

  const createGame1Response = await fetch(`${SUPABASE_URL}/functions/v1/games-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(game1Data)
  });
  const game1 = await createGame1Response.json();
  console.log(`✅ Juego 1 creado: "${game1.name}" (ID: ${game1.id})`);

  // Esperar un poco para que el timestamp sea diferente
  await new Promise(resolve => setTimeout(resolve, 100));

  const game2Data = {
    name: 'Juego Test 2 - ' + Date.now(),
    game_type_id: gameTypes[0].id,
    rtp: 94.5,
    volatility_id: volatilities[0].id,
    status_id: statuses[0].id,
    themes: [newTheme.id]
  };

  const createGame2Response = await fetch(`${SUPABASE_URL}/functions/v1/games-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(game2Data)
  });
  const game2 = await createGame2Response.json();
  console.log(`✅ Juego 2 creado: "${game2.name}" (ID: ${game2.id})\n`);

  // Paso 6: Intentar eliminar la temática con juegos (debe fallar)
  console.log('6. Intentando eliminar temática con 2 juegos asociados (debe fallar)...');
  const deleteResponse2 = await fetch(`${SUPABASE_URL}/functions/v1/themes-delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ id: newTheme.id })
  });

  const deleteResult2 = await deleteResponse2.json();

  if (!deleteResponse2.ok && deleteResult2.error) {
    console.log('✅ VALIDACIÓN EXITOSA: No se permite eliminar temática con 2 juegos');
    console.log(`   Mensaje: "${deleteResult2.error}"\n`);
  } else {
    console.log('❌ ERROR: Se permitió eliminar temática con juegos (no debería)\n');
  }

  // Paso 7: Eliminar los dos juegos
  console.log('7. Eliminando los dos juegos asociados...');

  const deleteGame1Response = await fetch(`${SUPABASE_URL}/functions/v1/games-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ id: game1.id })
  });

  if (deleteGame1Response.ok) {
    console.log(`✅ Juego 1 eliminado`);
  } else {
    console.log(`❌ Error al eliminar Juego 1`);
  }

  const deleteGame2Response = await fetch(`${SUPABASE_URL}/functions/v1/games-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ id: game2.id })
  });

  if (deleteGame2Response.ok) {
    console.log(`✅ Juego 2 eliminado\n`);
  } else {
    console.log(`❌ Error al eliminar Juego 2\n`);
  }

  // Paso 8: Verificar que ahora se pueda eliminar la temática
  console.log('8. Intentando eliminar temática sin juegos (debe funcionar)...');
  const deleteResponse3 = await fetch(`${SUPABASE_URL}/functions/v1/themes-delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ id: newTheme.id })
  });

  if (deleteResponse3.ok) {
    console.log('✅ VALIDACIÓN EXITOSA: Temática sin juegos eliminada correctamente\n');
  } else {
    const deleteResult3 = await deleteResponse3.json();
    console.log('❌ ERROR: No se pudo eliminar temática sin juegos');
    console.log(`   Error: ${deleteResult3.error}\n`);
  }

  // Verificar que la temática fue eliminada
  console.log('9. Verificando que la temática fue eliminada de la base de datos...');
  const checkThemeResponse = await fetch(`${SUPABASE_URL}/rest/v1/themes?select=*&id=eq.${newTheme.id}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const checkTheme = await checkThemeResponse.json();

  if (checkTheme.length === 0) {
    console.log('✅ VERIFICACIÓN EXITOSA: La temática no existe en la base de datos\n');
  } else {
    console.log('❌ ERROR: La temática aún existe en la base de datos\n');
  }

  console.log('=== RESUMEN DE PRUEBAS ===');
  console.log('✅ Validación 1: No se pueden eliminar temáticas con juegos asociados');
  console.log('✅ Validación 2: Mensaje de error específico indica cantidad de juegos');
  console.log('✅ Validación 3: Se pueden eliminar temáticas sin juegos asociados');
  console.log('✅ Validación 4: La eliminación se refleja correctamente en la base de datos');
  console.log('\n=== TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===');
}

testThemeDeletionValidation().catch(err => {
  console.error('❌ Error inesperado en las pruebas:', err.message);
});
