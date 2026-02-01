import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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
    const { id, street, number, country_id, state_id, postal_code, floor, apartment, neighborhood, google_maps_url } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updateData: any = {};
    if (street !== undefined) updateData.street = street;
    if (number !== undefined) updateData.number = number;
    if (country_id !== undefined) updateData.country_id = country_id;
    if (state_id !== undefined) updateData.state_id = state_id;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (floor !== undefined) updateData.floor = floor;
    if (apartment !== undefined) updateData.apartment = apartment;
    if (neighborhood !== undefined) updateData.neighborhood = neighborhood;
    if (google_maps_url !== undefined) updateData.google_maps_url = google_maps_url;

    const { data: address, error } = await supabase
      .from('crm_addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ address, message: 'Dirección actualizada exitosamente' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
