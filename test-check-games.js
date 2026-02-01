import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkGames() {
  console.log('\n=== VERIFICANDO JUEGOS EN LA BASE DE DATOS ===\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('1. Contando juegos totales...');
  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total de juegos: ${totalGames || 0}\n`);

  if (totalGames && totalGames > 0) {
    console.log('2. Listando algunos juegos...');
    const { data: games } = await supabase
      .from('games')
      .select('id, name, type_id')
      .limit(10);

    games?.forEach(game => {
      console.log(`   - ${game.name} (type_id: ${game.type_id})`);
    });

    console.log('\n3. Verificando tipos de juego en los juegos existentes...');
    const { data: gameTypes } = await supabase
      .from('game_types')
      .select('id, name');

    if (gameTypes) {
      for (const type of gameTypes) {
        const { count } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .eq('type_id', type.id);
        if (count && count > 0) {
          console.log(`   - ${type.name} (${type.id}): ${count} juegos`);
        }
      }
    }
  } else {
    console.log('No hay juegos en la base de datos');
  }

  console.log('\n=== FIN ===\n');
}

checkGames().catch(console.error);
