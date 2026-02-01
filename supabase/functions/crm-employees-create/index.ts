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
    const { client_id, first_name, last_name, positions, address_id, ...contactInfo } = body;

    if (!client_id || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: 'Cliente, nombre y apellido son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingEmployee } = await supabase
      .from('crm_employees')
      .select('id, first_name, last_name, client_id, is_active, deleted_at')
      .eq('client_id', client_id)
      .ilike('first_name', first_name)
      .ilike('last_name', last_name)
      .maybeSingle();

    if (existingEmployee && existingEmployee.is_active && !existingEmployee.deleted_at) {
      return new Response(
        JSON.stringify({ error: 'Ya existe un empleado activo con este nombre en el cliente seleccionado' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: employee, error: employeeError } = await supabase
      .from('crm_employees')
      .insert({
        client_id,
        first_name,
        last_name,
        email: contactInfo.email || null,
        birth_date: contactInfo.birth_date || null,
        address_id: address_id || null,
        telegram: contactInfo.telegram || null,
        skype: contactInfo.skype || null,
        discord: contactInfo.discord || null,
        linkedin_url: contactInfo.linkedin_url || null,
        twitter_url: contactInfo.twitter_url || null,
        instagram_url: contactInfo.instagram_url || null,
        facebook_url: contactInfo.facebook_url || null,
        is_active: true,
      })
      .select()
      .single();

    if (employeeError) {
      return new Response(
        JSON.stringify({ error: employeeError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (positions && Array.isArray(positions) && positions.length > 0) {
      const positionRecords = positions.map((positionId: string) => ({
        employee_id: employee.id,
        position_id: positionId,
        is_current: true,
        start_date: new Date().toISOString().split('T')[0],
      }));

      const { error: positionsError } = await supabase
        .from('crm_employee_positions')
        .insert(positionRecords);

      if (positionsError) {
        console.error('Error assigning positions:', positionsError);
      }
    }

    return new Response(
      JSON.stringify({ employee, message: 'Empleado creado exitosamente' }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
