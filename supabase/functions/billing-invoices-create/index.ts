import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { invoice, items } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    const { data: newInvoice, error: invoiceError } = await supabaseClient
      .from("billing_invoices")
      .insert({
        ...invoice,
        amount: totalAmount,
      })
      .select()
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    const invoiceItems = items.map((item: any) => ({
      ...item,
      invoice_id: newInvoice.id,
      subtotal: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabaseClient
      .from("billing_invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      await supabaseClient
        .from("billing_invoices")
        .delete()
        .eq("id", newInvoice.id);
      throw itemsError;
    }

    const { data: fullInvoice, error: fetchError } = await supabaseClient
      .from("billing_invoices")
      .select(`
        *,
        client:crm_clients(id, name),
        status:billing_invoice_statuses(id, name),
        currency:expenses_currencies(id, name, code, symbol),
        items:billing_invoice_items(*)
      `)
      .eq("id", newInvoice.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return new Response(JSON.stringify(fullInvoice), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
