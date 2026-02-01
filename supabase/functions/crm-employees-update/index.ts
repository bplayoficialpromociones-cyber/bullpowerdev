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
    const { id, positions, ...updates } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: employee, error: employeeError } = await supabase
      .from('crm_employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (employeeError) {
      return new Response(
        JSON.stringify({ error: employeeError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (positions && Array.isArray(positions)) {
      const { data: currentPositions } = await supabase
        .from('crm_employee_positions')
        .select('position_id')
        .eq('employee_id', id)
        .eq('is_current', true);

      const currentPositionIds = (currentPositions || []).map((p: any) => p.position_id);
      const newPositionIds = positions;

      const positionsToRemove = currentPositionIds.filter((pid: string) => !newPositionIds.includes(pid));
      const positionsToAdd = newPositionIds.filter((pid: string) => !currentPositionIds.includes(pid));

      if (positionsToRemove.length > 0) {
        await supabase
          .from('crm_employee_positions')
          .update({ is_current: false, end_date: new Date().toISOString().split('T')[0] })
          .eq('employee_id', id)
          .in('position_id', positionsToRemove)
          .eq('is_current', true);
      }

      if (positionsToAdd.length > 0) {
        for (const positionId of positionsToAdd) {
          const { data: existingPosition } = await supabase
            .from('crm_employee_positions')
            .select('id, is_current')
            .eq('employee_id', id)
            .eq('position_id', positionId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingPosition && !existingPosition.is_current) {
            await supabase
              .from('crm_employee_positions')
              .update({
                is_current: true,
                end_date: null,
                start_date: new Date().toISOString().split('T')[0]
              })
              .eq('id', existingPosition.id);
          } else if (!existingPosition) {
            await supabase
              .from('crm_employee_positions')
              .insert({
                employee_id: id,
                position_id: positionId,
                is_current: true,
                start_date: new Date().toISOString().split('T')[0],
              });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ employee, message: 'Empleado actualizado exitosamente' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
