import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    const url = new URL(req.url);
    const countryId = url.searchParams.get('country_id');

    const { data: countries, error: countriesError } = await supabase
      .from('crm_countries')
      .select('*')
      .order('name', { ascending: true });

    if (countriesError) {
      return new Response(
        JSON.stringify({ error: countriesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let states = [];
    if (countryId) {
      const { data: statesData, error: statesError } = await supabase
        .from('crm_states')
        .select('*')
        .eq('country_id', countryId)
        .order('name', { ascending: true });

      if (statesError) {
        return new Response(
          JSON.stringify({ error: statesError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      states = statesData;
    }

    const { data: clientTypes, error: typesError } = await supabase
      .from('crm_client_types')
      .select('*')
      .order('name', { ascending: true });

    if (typesError) {
      return new Response(
        JSON.stringify({ error: typesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ countries, states, clientTypes }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
