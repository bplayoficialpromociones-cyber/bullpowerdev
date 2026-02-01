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

    const { data: activeEmployees, error: checkError } = await supabase
      .from('crm_employee_positions')
      .select('employee_id, crm_employees!inner(is_active, deleted_at)')
      .eq('position_id', id)
      .eq('crm_employees.is_active', true)
      .is('crm_employees.deleted_at', null);

    if (checkError) {
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (activeEmployees && activeEmployees.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'No se puede eliminar este cargo',
          message: `Hay ${activeEmployees.length} empleado${activeEmployees.length > 1 ? 's' : ''} activo${activeEmployees.length > 1 ? 's' : ''} usando este cargo. Solo puedes modificar el cargo, no eliminarlo.`,
          canDelete: false,
          employeeCount: activeEmployees.length
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: position, error } = await supabase
      .from('crm_positions')
      .delete()
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
      JSON.stringify({ position, message: 'Cargo eliminado exitosamente' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
