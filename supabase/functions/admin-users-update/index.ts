import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UpdateUserRequest {
  id: string;
  password?: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { id, password, full_name, role_id, is_active }: UpdateUserRequest = await req.json();

    if (!id || !full_name || !role_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID, nombre y rol son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const updateData: any = {
      full_name: full_name,
      role_id: role_id,
      is_active: is_active ?? true,
      updated_at: new Date().toISOString()
    };

    if (password && password.trim() !== '') {
      const { data: hashedPassword, error: hashError } = await supabaseClient.rpc('hash_password', {
        password: password
      });

      if (hashError || !hashedPassword) {
        return new Response(
          JSON.stringify({ success: false, error: 'Error al procesar la contraseña' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      updateData.password_hash = hashedPassword;
    }

    const { data: updatedUser, error: updateError } = await supabaseClient
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Error al actualizar usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: updatedUser }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
