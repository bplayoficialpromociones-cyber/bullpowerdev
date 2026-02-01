import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface HeartbeatRequest {
  userId: string;
  disconnect?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, disconnect }: HeartbeatRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'userId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (disconnect) {
      await supabaseClient
        .from('admin_users')
        .update({
          is_online: false,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', userId)
        .is('deleted_at', null);

      console.log(`[HEARTBEAT] User ${userId} disconnected`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const { data: user } = await supabaseClient
        .from('admin_users')
        .select('is_blocked')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (user?.is_blocked) {
        await supabaseClient
          .from('admin_users')
          .update({
            is_online: false,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', userId);

        console.log(`[HEARTBEAT] User ${userId} is blocked, forcing disconnect`);

        return new Response(
          JSON.stringify({ success: false, blocked: true }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseClient
        .from('admin_users')
        .update({
          is_online: true,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', userId)
        .is('deleted_at', null);

      console.log(`[HEARTBEAT] User ${userId} heartbeat received`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Heartbeat error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
