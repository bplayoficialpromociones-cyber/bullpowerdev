import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deletedAt = new Date().toISOString();

    const { data: employees } = await supabase
      .from('crm_employees')
      .select('id')
      .eq('client_id', id)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (employees && employees.length > 0) {
      const { error: employeesError } = await supabase
        .from('crm_employees')
        .update({
          is_active: false,
          deleted_at: deletedAt,
        })
        .eq('client_id', id)
        .eq('is_active', true);

      if (employeesError) {
        console.error('Error deleting employees:', employeesError);
      }
    }

    const { data: client, error } = await supabase
      .from('crm_clients')
      .update({
        is_active: false,
        deleted_at: deletedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const employeesCount = employees?.length || 0;
    const message = employeesCount > 0
      ? `Cliente eliminado exitosamente junto con ${employeesCount} empleado${employeesCount > 1 ? 's' : ''}`
      : 'Cliente eliminado exitosamente';

    return new Response(
      JSON.stringify({ client, message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
