import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password, full_name, role_id, is_active }: CreateUserRequest = await req.json();

    if (!email || !password || !full_name || !role_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingUser } = await supabaseClient
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'El email ya está en uso' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: hashedPassword, error: hashError } = await supabaseClient.rpc('hash_password', {
      password: password
    });

    if (hashError || !hashedPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Error al procesar la contraseña' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: newUser, error: insertError } = await supabaseClient
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        full_name: full_name,
        role_id: role_id,
        is_active: is_active ?? true,
        two_factor_enabled: false
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Error al crear usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: newUser }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
