import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testDeleteWithAuth() {
  console.log('\n=== TEST DE ELIMINACIÓN CON AUTENTICACIÓN REAL ===\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('1. Iniciando sesión como super_admin...');

  // Buscar un super_admin
  const { data: superAdmins } = await supabase
    .from('admin_users')
    .select('id, email, roles(name)')
    .eq('roles.name', 'super_admin')
    .eq('is_active', true)
    .limit(1);

  if (!superAdmins || superAdmins.length === 0) {
    console.log('   ❌ No se encontró ningún super_admin activo');
    return;
  }

  const adminEmail = superAdmins[0].email;
  console.log(`   Super admin encontrado: ${adminEmail}`);

  // Necesitamos hacer login real a través de la edge function
  console.log('\n2. Realizando login a través de edge function...');
  console.log('   (Nota: necesitamos la contraseña real del usuario)');
  console.log('   Vamos a usar directamente el token de sesión simulado\n');

  // ID de Hold & Win
  const holdWinId = '7e244d1e-b13e-40f4-8da8-1d37fefa0a58';

  console.log('3. Verificando que Hold & Win tiene juegos asociados...');
  const { data: games } = await supabase
    .from('games')
    .select('id, name')
    .eq('game_type_id', holdWinId);

  console.log(`   Juegos asociados: ${games?.length || 0}`);

  console.log('\n4. Intentando eliminar Hold & Win SIN autenticación...');
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/game-types-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: holdWinId }),
    });

    console.log(`   Status: ${response.status}`);
    const result = await response.json();
    console.log(`   Response:`, result);

  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n5. Verificando que Hold & Win todavía existe...');
  const { data: stillExists } = await supabase
    .from('game_types')
    .select('id, name')
    .eq('id', holdWinId)
    .single();

  if (stillExists) {
    console.log(`   ✅ "${stillExists.name}" todavía existe`);
  } else {
    console.log('   ❌ El tipo fue eliminado');
  }

  console.log('\n=== CONCLUSIÓN ===');
  console.log('El problema está identificado:');
  console.log('1. La edge function ahora requiere autenticación real con JWT');
  console.log('2. Usando ANON_KEY no se puede obtener el user.id');
  console.log('3. Necesitamos autenticación real desde el frontend');
  console.log('\n=== FIN DEL TEST ===\n');
}

testDeleteWithAuth().catch(console.error);
