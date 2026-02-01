import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const GAME_ID = '47ded061-01dc-4526-a946-3bf28fd95301';

async function cleanup() {
  console.log('Eliminando juego de prueba...');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/games-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ id: GAME_ID })
  });

  if (response.ok) {
    console.log('✅ Juego de prueba eliminado correctamente');
  } else {
    const error = await response.text();
    console.log('⚠️ No se pudo eliminar:', error);
  }
}

cleanup();
