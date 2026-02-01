import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
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

    const { id, invoice, items } = await req.json();

    if (!id) {
      throw new Error("ID de factura requerido");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let totalAmount = invoice.amount;

    if (items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
    }

    const { error: invoiceError } = await supabaseClient
      .from("billing_invoices")
      .update({
        ...invoice,
        amount: totalAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (invoiceError) {
      throw invoiceError;
    }

    if (items && items.length > 0) {
      await supabaseClient
        .from("billing_invoice_items")
        .delete()
        .eq("invoice_id", id);

      const invoiceItems = items.map((item: any) => ({
        ...item,
        invoice_id: id,
        subtotal: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabaseClient
        .from("billing_invoice_items")
        .insert(invoiceItems);

      if (itemsError) {
        throw itemsError;
      }
    }

    const { data: updatedInvoice, error: fetchError } = await supabaseClient
      .from("billing_invoices")
      .select(`
        *,
        client:crm_clients(id, name),
        status:billing_invoice_statuses(id, name),
        currency:expenses_currencies(id, name, code, symbol),
        items:billing_invoice_items(*)
      `)
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return new Response(JSON.stringify(updatedInvoice), {
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
