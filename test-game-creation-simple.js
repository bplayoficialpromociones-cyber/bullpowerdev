import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function testGameCreation() {
  console.log('=== PRUEBA SIMPLIFICADA DE CREACIÓN DE JUEGO ===\n');

  // Paso 1: Obtener tipos de juego, volatilidades y estados disponibles
  console.log('1. Obteniendo catálogos necesarios...');

  // Obtener tipos de juego
  const gameTypesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_types?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const gameTypes = await gameTypesResponse.json();
  console.log(`✅ Tipo de juego: ${gameTypes[0]?.name}`);

  // Obtener volatilidades
  const volatilitiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_volatilities?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const volatilities = await volatilitiesResponse.json();
  console.log(`✅ Volatilidad: ${volatilities[0]?.name}`);

  // Obtener estados
  const statusesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_statuses?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const statuses = await statusesResponse.json();
  console.log(`✅ Estado: ${statuses[0]?.name}\n`);

  // Paso 2: Crear un juego de prueba (sin autenticación - solo testing)
  console.log('2. Intentando crear juego de prueba...');
  console.log('   Datos del juego:');
  console.log('   - Nombre: Test Game ' + Date.now());
  console.log(`   - Tipo: ${gameTypes[0]?.name}`);
  console.log('   - RTP: 95.5%');
  console.log(`   - Volatilidad: ${volatilities[0]?.name}`);
  console.log(`   - Estado: ${statuses[0]?.name}`);
  console.log('   - Fecha Integración: null (campo opcional vacío)');
  console.log('   - Fecha Trailer: null (campo opcional vacío)');
  console.log('   - URL Pack Multimedia: https://ejemplo.com/pack.zip\n');

  const gameData = {
    name: 'Test Game ' + Date.now(),
    game_type_id: gameTypes[0]?.id,
    rtp: 95.5,
    volatility_id: volatilities[0]?.id,
    status_id: statuses[0]?.id,
    integration_date: null,
    trailer_release_date: null,
    multimedia_pack_url: 'https://ejemplo.com/pack.zip'
  };

  console.log('   Llamando a games-create edge function...');
  const createResponse = await fetch(`${SUPABASE_URL}/functions/v1/games-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(gameData)
  });

  const responseText = await createResponse.text();
  let createResult;

  try {
    createResult = JSON.parse(responseText);
  } catch (e) {
    createResult = responseText;
  }

  console.log(`   Status HTTP: ${createResponse.status}\n`);

  if (createResponse.ok) {
    console.log('✅ JUEGO CREADO EXITOSAMENTE!');
    console.log(`   ID: ${createResult.id}`);
    console.log(`   Nombre: ${createResult.name}`);
    console.log(`   RTP: ${createResult.rtp}%`);
    console.log(`   Fecha Integración: ${createResult.integration_date || 'null (correcto)'}`);
    console.log(`   Fecha Trailer: ${createResult.trailer_release_date || 'null (correcto)'}`);
    console.log(`   Created at: ${createResult.created_at}\n`);

    console.log('=== PRUEBA COMPLETADA EXITOSAMENTE ===');
    console.log('✅ La creación de juegos con fechas vacías (null) funciona correctamente');
    console.log('✅ No hay errores de sintaxis SQL ni violaciones de RLS');
    console.log(`\n💡 Puedes eliminar el juego manualmente con ID: ${createResult.id}`);

  } else {
    console.error('❌ ERROR AL CREAR JUEGO:');
    console.error('   Status:', createResponse.status);
    console.error('   Respuesta:', createResult);
    console.log('\n=== ANÁLISIS DEL ERROR ===');

    if (createResponse.status === 400) {
      console.log('   Código 400: Solicitud incorrecta');
      if (typeof createResult === 'object' && createResult.error) {
        console.log('   Mensaje:', createResult.error);

        if (createResult.error.includes('date')) {
          console.log('   ❌ PROBLEMA: Error relacionado con fechas');
          console.log('   → Las fechas vacías no se están enviando como null correctamente');
        } else if (createResult.error.includes('row-level security')) {
          console.log('   ❌ PROBLEMA: Error de RLS (Row Level Security)');
          console.log('   → El edge function no tiene permisos suficientes');
        }
      }
    }
    console.log('\n=== PRUEBA FALLIDA ===');
  }
}

testGameCreation().catch(err => {
  console.error('❌ Error inesperado:', err.message);
});
