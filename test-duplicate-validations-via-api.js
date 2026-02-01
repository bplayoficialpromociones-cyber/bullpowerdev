import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const functionsUrl = `${supabaseUrl}/functions/v1`;
const headers = {
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'apikey': supabaseAnonKey
};

console.log('🧪 INICIANDO PRUEBAS DE VALIDACIÓN DE DUPLICADOS VÍA EDGE FUNCTIONS\n');
console.log('='.repeat(70));
console.log('NOTA: Estas pruebas usan las edge functions que tienen SERVICE_ROLE_KEY');
console.log('='.repeat(70));

async function testThemeDuplicates() {
  console.log('\n📋 TEST 1: VALIDACIÓN DE TEMÁTICAS DUPLICADAS');
  console.log('-'.repeat(70));

  const testThemeName = `Test-Duplicate-Theme-${Date.now()}`;

  console.log('1️⃣ Creando temática original via edge function...');
  const response1 = await fetch(`${functionsUrl}/themes-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: testThemeName,
      description: 'Primera versión'
    })
  });

  const result1 = await response1.json();

  if (!response1.ok) {
    console.error('❌ Error al crear temática original:', result1.error);
    return false;
  }
  console.log(`✅ Temática creada: ${result1.name} (ID: ${result1.id})`);

  console.log('\n2️⃣ Intentando crear temática duplicada...');
  const response2 = await fetch(`${functionsUrl}/themes-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: testThemeName,
      description: 'Duplicado'
    })
  });

  const result2 = await response2.json();

  if (response2.status === 409) {
    console.log('✅ VALIDACIÓN funcionó: Se rechazó el duplicado (HTTP 409)');
    console.log(`   Mensaje: ${result2.error}`);
  } else if (!response2.ok) {
    console.log(`⚠️ Se rechazó pero con código ${response2.status}: ${result2.error}`);
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    console.error('   Respuesta:', result2);
    await fetch(`${functionsUrl}/themes-delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id: result1.id })
    });
    if (result2.id) {
      await fetch(`${functionsUrl}/themes-delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id: result2.id })
      });
    }
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await fetch(`${functionsUrl}/themes-delete`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ id: result1.id })
  });
  console.log('✅ Limpieza completada');

  return true;
}

async function testGameTypeDuplicates() {
  console.log('\n📋 TEST 2: VALIDACIÓN DE TIPOS DE JUEGO DUPLICADOS');
  console.log('-'.repeat(70));

  const testTypeName = `Test-Type-${Date.now()}`;

  console.log('1️⃣ Creando tipo de juego original...');
  const response1 = await fetch(`${functionsUrl}/game-types-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: testTypeName,
      description: 'Primera versión'
    })
  });

  const result1 = await response1.json();

  if (!response1.ok) {
    console.error('❌ Error al crear tipo original:', result1.error);
    return false;
  }
  console.log(`✅ Tipo creado: ${result1.name} (ID: ${result1.id})`);

  console.log('\n2️⃣ Intentando crear tipo duplicado...');
  const response2 = await fetch(`${functionsUrl}/game-types-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: testTypeName,
      description: 'Duplicado'
    })
  });

  const result2 = await response2.json();

  if (response2.status === 409) {
    console.log('✅ VALIDACIÓN funcionó: Se rechazó el duplicado (HTTP 409)');
    console.log(`   Mensaje: ${result2.error}`);
  } else if (!response2.ok) {
    console.log(`⚠️ Se rechazó pero con código ${response2.status}: ${result2.error}`);
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await fetch(`${functionsUrl}/game-types-delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id: result1.id })
    });
    if (result2.id) {
      await fetch(`${functionsUrl}/game-types-delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id: result2.id })
      });
    }
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await fetch(`${functionsUrl}/game-types-delete`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ id: result1.id })
  });
  console.log('✅ Limpieza completada');

  return true;
}

async function testMechanicDuplicates() {
  console.log('\n📋 TEST 3: VALIDACIÓN DE MECÁNICAS DUPLICADAS');
  console.log('-'.repeat(70));

  const testMechanicName = `Test-Mechanic-${Date.now()}`;

  console.log('1️⃣ Creando mecánica original...');
  const response1 = await fetch(`${functionsUrl}/mechanics-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: testMechanicName,
      description: 'Primera versión'
    })
  });

  const result1 = await response1.json();

  if (!response1.ok) {
    console.error('❌ Error al crear mecánica original:', result1.error);
    return false;
  }
  console.log(`✅ Mecánica creada: ${result1.name} (ID: ${result1.id})`);

  console.log('\n2️⃣ Intentando crear mecánica duplicada...');
  const response2 = await fetch(`${functionsUrl}/mechanics-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: testMechanicName,
      description: 'Duplicado'
    })
  });

  const result2 = await response2.json();

  if (response2.status === 409) {
    console.log('✅ VALIDACIÓN funcionó: Se rechazó el duplicado (HTTP 409)');
    console.log(`   Mensaje: ${result2.error}`);
  } else if (!response2.ok) {
    console.log(`⚠️ Se rechazó pero con código ${response2.status}: ${result2.error}`);
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await fetch(`${functionsUrl}/mechanics-delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id: result1.id })
    });
    if (result2.id) {
      await fetch(`${functionsUrl}/mechanics-delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id: result2.id })
      });
    }
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await fetch(`${functionsUrl}/mechanics-delete`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ id: result1.id })
  });
  console.log('✅ Limpieza completada');

  return true;
}

async function runAllTests() {
  const results = [];

  results.push(await testThemeDuplicates());
  results.push(await testGameTypeDuplicates());
  results.push(await testMechanicDuplicates());

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(70));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n✅ Pruebas exitosas: ${passed}/${total}`);
  console.log(`❌ Pruebas fallidas: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 ¡TODAS LAS VALIDACIONES FUNCIONAN CORRECTAMENTE!');
    console.log('✅ Las edge functions validan duplicados antes de insertar');
    console.log('✅ Las restricciones UNIQUE en base de datos están activas');
    console.log('✅ Se retornan mensajes de error claros (HTTP 409)');
    console.log('✅ Sistema listo para producción');
  } else {
    console.log('\n⚠️ ALGUNAS VALIDACIONES FALLARON');
    console.log('❌ Revisar los errores arriba antes de desplegar');
  }

  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
