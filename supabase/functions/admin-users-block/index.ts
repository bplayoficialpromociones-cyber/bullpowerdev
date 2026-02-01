import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface BlockUserRequest {
  userId: string;
  currentUserId: string;
  block: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, currentUserId, block }: BlockUserRequest = await req.json();

    if (!userId || !currentUserId) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID de usuario requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: currentUser, error: currentUserError } = await supabaseClient
      .from('admin_users')
      .select('*, role:roles(*)')
      .eq('id', currentUserId)
      .single();

    if (currentUserError || !currentUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no autorizado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (currentUser.role.name !== 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Solo Super Admin puede bloquear usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: targetUser, error: targetUserError } = await supabaseClient
      .from('admin_users')
      .select('*, role:roles(*)')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (targetUser.role.name === 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'No se puede bloquear a un Super Admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updateData: any = {
      is_blocked: block,
      updated_by: currentUserId,
      updated_at: new Date().toISOString()
    };

    if (block) {
      updateData.is_online = false;
      updateData.last_activity_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseClient
      .from('admin_users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al actualizar usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabaseClient
      .from('admin_audit_log')
      .insert({
        user_id: currentUserId,
        action: block ? 'block_user' : 'unblock_user',
        module: 'users',
        entity_type: 'admin_users',
        entity_id: userId,
        old_values: { is_blocked: targetUser.is_blocked },
        new_values: { is_blocked: block },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: block
          ? 'Usuario bloqueado exitosamente. La sesión ha sido cerrada.'
          : 'Usuario desbloqueado exitosamente'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Block/Unblock user error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
