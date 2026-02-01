import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { count: totalUsers } = await supabaseClient
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { data: invoices } = await supabaseClient
      .from('billing_invoices')
      .select('amount, currency:expenses_currencies(symbol)')
      .gte('invoice_date', firstDayOfMonth)
      .lte('invoice_date', lastDayOfMonth)
      .is('deleted_at', null);

    let monthlyRevenue = 0;
    let currencySymbol = '$';
    if (invoices && invoices.length > 0) {
      monthlyRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      currencySymbol = invoices[0]?.currency?.symbol || '$';
    }

    const { data: expenses } = await supabaseClient
      .from('expenses')
      .select(`
        amount,
        currency:expenses_currencies(symbol),
        client:crm_clients(name)
      `)
      .gte('date', firstDayOfMonth)
      .lte('date', lastDayOfMonth)
      .is('deleted_at', null);

    let monthlyExpenses = 0;
    let expensesCurrencySymbol = '$';
    if (expenses && expenses.length > 0) {
      const bullPowerExpenses = expenses.filter(exp =>
        exp.client?.name?.toLowerCase().includes('bull power')
      );
      monthlyExpenses = bullPowerExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      if (bullPowerExpenses.length > 0) {
        expensesCurrencySymbol = bullPowerExpenses[0]?.currency?.symbol || '$';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          monthlyRevenue,
          monthlyExpenses,
          currencySymbol,
          expensesCurrencySymbol,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
