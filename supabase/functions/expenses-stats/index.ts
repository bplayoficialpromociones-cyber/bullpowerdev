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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Se requieren las fechas de inicio y fin' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching expenses from', startDate, 'to', endDate);

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        id,
        name,
        date,
        amount,
        currency_id,
        expense_type_id,
        employee_id,
        client_id,
        expenses_currencies!expenses_currency_id_fkey(code, symbol),
        expenses_types!expenses_expense_type_id_fkey(name),
        crm_employees!expenses_employee_id_fkey(id, first_name, last_name),
        crm_clients!expenses_client_id_fkey(id, name)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found', expenses?.length || 0, 'expenses');

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      byEmployee: {} as Record<string, { name: string; income: number; expense: number }>,
      byClient: {} as Record<string, { name: string; income: number; expense: number }>,
      byType: {} as Record<string, number>,
      byCurrency: {} as Record<string, { income: number; expense: number; symbol: string }>,
      totalRecords: expenses?.length || 0,
    };

    expenses?.forEach((expense: any) => {
      const amount = parseFloat(expense.amount) || 0;
      const expenseType = expense.expenses_types || {};
      const currency = expense.expenses_currencies || {};
      const employee = expense.crm_employees || {};
      const client = expense.crm_clients || {};

      const isIncome = expenseType.name === 'Entrada';
      const currencyCode = currency.code || 'USD';
      const currencySymbol = currency.symbol || '$';

      if (isIncome) {
        stats.totalIncome += amount;
      } else {
        stats.totalExpense += amount;
      }

      if (!stats.byCurrency[currencyCode]) {
        stats.byCurrency[currencyCode] = { income: 0, expense: 0, symbol: currencySymbol };
      }
      if (isIncome) {
        stats.byCurrency[currencyCode].income += amount;
      } else {
        stats.byCurrency[currencyCode].expense += amount;
      }

      if (employee.id) {
        const empKey = employee.id;
        const empName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
        if (!stats.byEmployee[empKey]) {
          stats.byEmployee[empKey] = { name: empName, income: 0, expense: 0 };
        }
        if (isIncome) {
          stats.byEmployee[empKey].income += amount;
        } else {
          stats.byEmployee[empKey].expense += amount;
        }
      }

      if (client.id) {
        const clientKey = client.id;
        const clientName = client.name || 'Sin nombre';
        if (!stats.byClient[clientKey]) {
          stats.byClient[clientKey] = { name: clientName, income: 0, expense: 0 };
        }
        if (isIncome) {
          stats.byClient[clientKey].income += amount;
        } else {
          stats.byClient[clientKey].expense += amount;
        }
      }

      const typeName = expenseType.name || 'Sin tipo';
      if (!stats.byType[typeName]) {
        stats.byType[typeName] = 0;
      }
      stats.byType[typeName] += amount;
    });

    return new Response(
      JSON.stringify({ stats }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
