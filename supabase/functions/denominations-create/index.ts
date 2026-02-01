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
    const data = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existingDenomination } = await supabaseClient
      .from("denominations")
      .select("id, name")
      .eq("name", data.name)
      .eq("currency_id", data.currency_id)
      .eq("min_bet", data.min_bet)
      .eq("max_bet", data.max_bet)
      .maybeSingle();

    if (existingDenomination) {
      return new Response(
        JSON.stringify({
          error: `Ya existe una denominación con el mismo nombre, moneda y rangos de apuesta. Por favor, modifique alguno de estos valores.`
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: newDenomination, error } = await supabaseClient
      .from("denominations")
      .insert(data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({
            error: `Ya existe una denominación con el mismo nombre, moneda y rangos de apuesta. Por favor, modifique alguno de estos valores.`
          }),
          {
            status: 409,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
      throw error;
    }

    return new Response(JSON.stringify(newDenomination), {
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
