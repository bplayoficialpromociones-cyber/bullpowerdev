import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: users, error } = await supabaseClient
      .from('admin_users')
      .select(`
        *,
        role:roles(*)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Error al cargar usuarios' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calcular estado online dinámicamente basado en last_activity_at
    // Un usuario se considera online si tuvo actividad en los últimos 60 segundos
    // El heartbeat se envía cada 30 segundos, así que 60 segundos = 2 heartbeats perdidos
    const ONLINE_THRESHOLD_MS = 60 * 1000; // 60 segundos
    const now = new Date();

    const usersWithOnlineStatus = users?.map(user => {
      const lastActivity = user.last_activity_at ? new Date(user.last_activity_at) : null;
      const isOnline = lastActivity && (now.getTime() - lastActivity.getTime()) < ONLINE_THRESHOLD_MS;

      return {
        ...user,
        is_online: isOnline
      };
    }) || [];

    // Actualizar el estado is_online en la base de datos para usuarios que deberían estar offline
    const usersToUpdate = usersWithOnlineStatus.filter(user => {
      const shouldBeOffline = !user.is_online;
      const isCurrentlyOnline = users?.find(u => u.id === user.id)?.is_online;
      return shouldBeOffline && isCurrentlyOnline;
    });

    if (usersToUpdate.length > 0) {
      // Actualizar usuarios que deben estar offline
      for (const user of usersToUpdate) {
        await supabaseClient
          .from('admin_users')
          .update({ is_online: false })
          .eq('id', user.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, users: usersWithOnlineStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error loading users:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
