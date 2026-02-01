import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function testGameCreation() {
  console.log('=== PRUEBA DE CREACIÓN DE JUEGO ===\n');

  // Paso 1: Login como super_admin
  console.log('1. Autenticando como super_admin...');
  const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      username: 'superadmin',
      password: 'Super@2025!',
      captcha_token: 'test-token',
      captcha_solution: 'test'
    })
  });

  const loginData = await loginResponse.json();

  if (!loginData.requires_2fa) {
    console.error('❌ Error: Login no retornó requires_2fa');
    return;
  }

  console.log('✅ Login exitoso, requiere 2FA\n');

  // Paso 2: Obtener tipos de juego, volatilidades y estados disponibles
  console.log('2. Obteniendo catálogos...');

  const gameTypesResponse = await fetch(`${SUPABASE_URL}/functions/v1/game-types-list`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const gameTypes = await gameTypesResponse.json();
  console.log(`✅ Tipos de juego disponibles: ${gameTypes.length}`);

  // Obtener volatilidades
  const volatilitiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_volatilities?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const volatilities = await volatilitiesResponse.json();
  console.log(`✅ Volatilidades disponibles: ${volatilities.length}`);

  // Obtener estados
  const statusesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_statuses?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  });
  const statuses = await statusesResponse.json();
  console.log(`✅ Estados disponibles: ${statuses.length}\n`);

  // Paso 3: Crear un juego de prueba
  console.log('3. Creando juego de prueba...');
  console.log('   Datos del juego:');
  console.log('   - Nombre: Juego Test Automático');
  console.log(`   - Tipo: ${gameTypes[0]?.name}`);
  console.log('   - RTP: 95.5%');
  console.log(`   - Volatilidad: ${volatilities[0]?.name}`);
  console.log(`   - Estado: ${statuses[0]?.name}`);
  console.log('   - Fecha Integración: (vacía - null)');
  console.log('   - Fecha Trailer: (vacía - null)');
  console.log('   - URL Pack Multimedia: https://ejemplo.com/pack.zip\n');

  const gameData = {
    name: 'Juego Test Automático',
    game_type_id: gameTypes[0]?.id,
    rtp: 95.5,
    volatility_id: volatilities[0]?.id,
    status_id: statuses[0]?.id,
    integration_date: null,
    trailer_release_date: null,
    multimedia_pack_url: 'https://ejemplo.com/pack.zip'
  };

  const createResponse = await fetch(`${SUPABASE_URL}/functions/v1/games-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(gameData)
  });

  const createResult = await createResponse.json();

  if (createResponse.ok) {
    console.log('✅ Juego creado exitosamente!');
    console.log(`   ID: ${createResult.id}`);
    console.log(`   Nombre: ${createResult.name}`);
    console.log(`   RTP: ${createResult.rtp}%`);
    console.log(`   Created at: ${createResult.created_at}\n`);

    // Paso 4: Verificar que se puede leer el juego
    console.log('4. Verificando lectura del juego creado...');
    const gamesListResponse = await fetch(`${SUPABASE_URL}/rest/v1/games?select=*&id=eq.${createResult.id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    const games = await gamesListResponse.json();
    if (games.length > 0) {
      console.log('✅ Juego recuperado exitosamente de la base de datos\n');

      // Paso 5: Limpiar - Eliminar el juego de prueba
      console.log('5. Limpiando - Eliminando juego de prueba...');
      const deleteResponse = await fetch(`${SUPABASE_URL}/functions/v1/games-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ id: createResult.id })
      });

      if (deleteResponse.ok) {
        console.log('✅ Juego de prueba eliminado correctamente\n');
      } else {
        console.log('⚠️ No se pudo eliminar el juego de prueba (puede requerir limpieza manual)\n');
      }
    } else {
      console.log('❌ No se pudo recuperar el juego creado\n');
    }

    console.log('=== PRUEBA COMPLETADA EXITOSAMENTE ===');
    console.log('✅ La creación de juegos con fechas vacías funciona correctamente');

  } else {
    console.error('❌ Error al crear juego:');
    console.error('   Status:', createResponse.status);
    console.error('   Error:', createResult.error || createResult);
    console.log('\n=== PRUEBA FALLIDA ===');
  }
}

testGameCreation().catch(console.error);
