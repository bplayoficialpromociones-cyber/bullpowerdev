import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { name, client_type_id, address_id, anniversary_date, website_url, ...socialMedia } = body;

    if (!name || !client_type_id) {
      return new Response(
        JSON.stringify({ error: 'Nombre y tipo de cliente son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingClient } = await supabase
      .from('crm_clients')
      .select('id, name, is_active, deleted_at')
      .ilike('name', name)
      .maybeSingle();

    if (existingClient && existingClient.is_active && !existingClient.deleted_at) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un cliente activo con este nombre' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: client, error } = await supabase
      .from('crm_clients')
      .insert({
        name,
        client_type_id,
        address_id: address_id || null,
        anniversary_date: anniversary_date || null,
        website_url: website_url || null,
        linkedin_url: socialMedia.linkedin_url || null,
        instagram_url: socialMedia.instagram_url || null,
        facebook_url: socialMedia.facebook_url || null,
        youtube_url: socialMedia.youtube_url || null,
        twitch_url: socialMedia.twitch_url || null,
        kick_url: socialMedia.kick_url || null,
        twitter_url: socialMedia.twitter_url || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ client, message: 'Cliente creado exitosamente' }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
