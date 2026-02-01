import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 INICIANDO PRUEBAS DE VALIDACIÓN DE DUPLICADOS\n');
console.log('='.repeat(60));

async function testThemeDuplicates() {
  console.log('\n📋 TEST 1: VALIDACIÓN DE TEMÁTICAS DUPLICADAS');
  console.log('-'.repeat(60));

  const testThemeName = `Test-Duplicate-${Date.now()}`;

  console.log('1️⃣ Creando temática original...');
  const { data: theme1, error: error1 } = await supabase
    .from('themes')
    .insert({ name: testThemeName, description: 'Primera versión' })
    .select()
    .single();

  if (error1) {
    console.error('❌ Error al crear temática original:', error1.message);
    return false;
  }
  console.log(`✅ Temática creada: ${theme1.name} (ID: ${theme1.id})`);

  console.log('\n2️⃣ Intentando crear temática duplicada...');
  const { data: theme2, error: error2 } = await supabase
    .from('themes')
    .insert({ name: testThemeName, description: 'Duplicado' })
    .select()
    .single();

  if (error2 && error2.code === '23505') {
    console.log('✅ CONSTRAINT funcionó: Se rechazó el duplicado');
    console.log(`   Mensaje: ${error2.message}`);
  } else if (error2) {
    console.error('❌ Error inesperado:', error2.message);
    await supabase.from('themes').delete().eq('id', theme1.id);
    return false;
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await supabase.from('themes').delete().eq('id', theme1.id);
    if (theme2) await supabase.from('themes').delete().eq('id', theme2.id);
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await supabase.from('themes').delete().eq('id', theme1.id);
  console.log('✅ Limpieza completada');

  return true;
}

async function testGameTypeDuplicates() {
  console.log('\n📋 TEST 2: VALIDACIÓN DE TIPOS DE JUEGO DUPLICADOS');
  console.log('-'.repeat(60));

  const testTypeName = `Test-Type-${Date.now()}`;

  console.log('1️⃣ Creando tipo de juego original...');
  const { data: type1, error: error1 } = await supabase
    .from('game_types')
    .insert({ name: testTypeName, description: 'Primera versión' })
    .select()
    .single();

  if (error1) {
    console.error('❌ Error al crear tipo original:', error1.message);
    return false;
  }
  console.log(`✅ Tipo creado: ${type1.name} (ID: ${type1.id})`);

  console.log('\n2️⃣ Intentando crear tipo duplicado...');
  const { data: type2, error: error2 } = await supabase
    .from('game_types')
    .insert({ name: testTypeName, description: 'Duplicado' })
    .select()
    .single();

  if (error2 && error2.code === '23505') {
    console.log('✅ CONSTRAINT funcionó: Se rechazó el duplicado');
    console.log(`   Mensaje: ${error2.message}`);
  } else if (error2) {
    console.error('❌ Error inesperado:', error2.message);
    await supabase.from('game_types').delete().eq('id', type1.id);
    return false;
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await supabase.from('game_types').delete().eq('id', type1.id);
    if (type2) await supabase.from('game_types').delete().eq('id', type2.id);
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await supabase.from('game_types').delete().eq('id', type1.id);
  console.log('✅ Limpieza completada');

  return true;
}

async function testMechanicDuplicates() {
  console.log('\n📋 TEST 3: VALIDACIÓN DE MECÁNICAS DUPLICADAS');
  console.log('-'.repeat(60));

  const testMechanicName = `Test-Mechanic-${Date.now()}`;

  console.log('1️⃣ Creando mecánica original...');
  const { data: mechanic1, error: error1 } = await supabase
    .from('mechanics')
    .insert({ name: testMechanicName, description: 'Primera versión' })
    .select()
    .single();

  if (error1) {
    console.error('❌ Error al crear mecánica original:', error1.message);
    return false;
  }
  console.log(`✅ Mecánica creada: ${mechanic1.name} (ID: ${mechanic1.id})`);

  console.log('\n2️⃣ Intentando crear mecánica duplicada...');
  const { data: mechanic2, error: error2 } = await supabase
    .from('mechanics')
    .insert({ name: testMechanicName, description: 'Duplicado' })
    .select()
    .single();

  if (error2 && error2.code === '23505') {
    console.log('✅ CONSTRAINT funcionó: Se rechazó el duplicado');
    console.log(`   Mensaje: ${error2.message}`);
  } else if (error2) {
    console.error('❌ Error inesperado:', error2.message);
    await supabase.from('mechanics').delete().eq('id', mechanic1.id);
    return false;
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await supabase.from('mechanics').delete().eq('id', mechanic1.id);
    if (mechanic2) await supabase.from('mechanics').delete().eq('id', mechanic2.id);
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await supabase.from('mechanics').delete().eq('id', mechanic1.id);
  console.log('✅ Limpieza completada');

  return true;
}

async function testGameDuplicates() {
  console.log('\n📋 TEST 4: VALIDACIÓN DE JUEGOS DUPLICADOS');
  console.log('-'.repeat(60));

  const testGameName = `Test-Game-${Date.now()}`;

  const { data: statuses } = await supabase.from('game_statuses').select('id').limit(1).single();
  const { data: volatilities } = await supabase.from('game_volatilities').select('id').limit(1).single();

  if (!statuses || !volatilities) {
    console.error('❌ No se encontraron estados o volatilidades en catálogos');
    return false;
  }

  console.log('1️⃣ Creando juego original...');
  const { data: game1, error: error1 } = await supabase
    .from('games')
    .insert({
      name: testGameName,
      status_id: statuses.id,
      volatility_id: volatilities.id,
      rtp: 96.5
    })
    .select()
    .single();

  if (error1) {
    console.error('❌ Error al crear juego original:', error1.message);
    return false;
  }
  console.log(`✅ Juego creado: ${game1.name} (ID: ${game1.id})`);

  console.log('\n2️⃣ Intentando crear juego duplicado...');
  const { data: game2, error: error2 } = await supabase
    .from('games')
    .insert({
      name: testGameName,
      status_id: statuses.id,
      volatility_id: volatilities.id,
      rtp: 95.0
    })
    .select()
    .single();

  if (error2 && error2.code === '23505') {
    console.log('✅ CONSTRAINT funcionó: Se rechazó el duplicado');
    console.log(`   Mensaje: ${error2.message}`);
  } else if (error2) {
    console.error('❌ Error inesperado:', error2.message);
    await supabase.from('games').delete().eq('id', game1.id);
    return false;
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await supabase.from('games').delete().eq('id', game1.id);
    if (game2) await supabase.from('games').delete().eq('id', game2.id);
    return false;
  }

  console.log('\n3️⃣ Limpiando...');
  await supabase.from('games').delete().eq('id', game1.id);
  console.log('✅ Limpieza completada');

  return true;
}

async function testDenominationDuplicates() {
  console.log('\n📋 TEST 5: VALIDACIÓN DE DENOMINACIONES DUPLICADAS');
  console.log('-'.repeat(60));

  const { data: currency } = await supabase
    .from('expenses_currencies')
    .select('id')
    .limit(1)
    .single();

  if (!currency) {
    console.error('❌ No se encontró ninguna moneda en el catálogo');
    return false;
  }

  const testDenomName = `Test-Denom-${Date.now()}`;

  console.log('1️⃣ Creando denominación original...');
  const { data: denom1, error: error1 } = await supabase
    .from('denominations')
    .insert({
      name: testDenomName,
      currency_id: currency.id,
      min_bet: 1.0,
      max_bet: 100.0,
      available_bets: [1, 5, 10, 25, 50, 100]
    })
    .select()
    .single();

  if (error1) {
    console.error('❌ Error al crear denominación original:', error1.message);
    return false;
  }
  console.log(`✅ Denominación creada: ${denom1.name} (ID: ${denom1.id})`);

  console.log('\n2️⃣ Intentando crear denominación duplicada (mismo todo)...');
  const { data: denom2, error: error2 } = await supabase
    .from('denominations')
    .insert({
      name: testDenomName,
      currency_id: currency.id,
      min_bet: 1.0,
      max_bet: 100.0,
      available_bets: [1, 2, 5, 10]
    })
    .select()
    .single();

  if (error2 && error2.code === '23505') {
    console.log('✅ CONSTRAINT funcionó: Se rechazó el duplicado');
    console.log(`   Mensaje: ${error2.message}`);
  } else if (error2) {
    console.error('❌ Error inesperado:', error2.message);
    await supabase.from('denominations').delete().eq('id', denom1.id);
    return false;
  } else {
    console.error('❌ FALLO: Se permitió crear duplicado!');
    await supabase.from('denominations').delete().eq('id', denom1.id);
    if (denom2) await supabase.from('denominations').delete().eq('id', denom2.id);
    return false;
  }

  console.log('\n3️⃣ Verificando que SÍ permite mismo nombre con diferentes valores...');
  const { data: denom3, error: error3 } = await supabase
    .from('denominations')
    .insert({
      name: testDenomName,
      currency_id: currency.id,
      min_bet: 5.0,
      max_bet: 500.0,
      available_bets: [5, 10, 50]
    })
    .select()
    .single();

  if (error3) {
    console.error('❌ No debería rechazar denominación con valores diferentes:', error3.message);
    await supabase.from('denominations').delete().eq('id', denom1.id);
    return false;
  }
  console.log(`✅ Correcto: Se permitió crear con mismo nombre pero diferentes valores`);

  console.log('\n4️⃣ Limpiando...');
  await supabase.from('denominations').delete().eq('id', denom1.id);
  await supabase.from('denominations').delete().eq('id', denom3.id);
  console.log('✅ Limpieza completada');

  return true;
}

async function runAllTests() {
  const results = [];

  results.push(await testThemeDuplicates());
  results.push(await testGameTypeDuplicates());
  results.push(await testMechanicDuplicates());
  results.push(await testGameDuplicates());
  results.push(await testDenominationDuplicates());

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n✅ Pruebas exitosas: ${passed}/${total}`);
  console.log(`❌ Pruebas fallidas: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 ¡TODAS LAS VALIDACIONES FUNCIONAN CORRECTAMENTE!');
    console.log('✅ Las restricciones UNIQUE están activas');
    console.log('✅ No se pueden crear registros duplicados');
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
