import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, player_id, phone_id, phone_data } = await req.json();

    if (!action || !player_id) {
      return new Response(
        JSON.stringify({ error: "Acción y ID de jugador requeridos" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let result;

    switch (action) {
      case "add":
        if (!phone_data) {
          return new Response(
            JSON.stringify({ error: "Datos del teléfono requeridos" }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        const { data: newPhone, error: addError } = await supabase
          .from("player_phones")
          .insert({
            player_id,
            phone_type_id: phone_data.phone_type_id,
            country_code: phone_data.country_code,
            phone_number: phone_data.phone_number,
            is_primary: phone_data.is_primary || false,
          })
          .select(`
            *,
            type:player_phone_types(id, name)
          `)
          .single();

        if (addError) throw addError;
        result = newPhone;
        break;

      case "update":
        if (!phone_id || !phone_data) {
          return new Response(
            JSON.stringify({ error: "ID de teléfono y datos requeridos" }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        const { data: updatedPhone, error: updateError } = await supabase
          .from("player_phones")
          .update({
            phone_type_id: phone_data.phone_type_id,
            country_code: phone_data.country_code,
            phone_number: phone_data.phone_number,
            is_primary: phone_data.is_primary,
          })
          .eq("id", phone_id)
          .eq("player_id", player_id)
          .select(`
            *,
            type:player_phone_types(id, name)
          `)
          .single();

        if (updateError) throw updateError;
        result = updatedPhone;
        break;

      case "delete":
        if (!phone_id) {
          return new Response(
            JSON.stringify({ error: "ID de teléfono requerido" }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        const { error: deleteError } = await supabase
          .from("player_phones")
          .delete()
          .eq("id", phone_id)
          .eq("player_id", player_id);

        if (deleteError) throw deleteError;
        result = { success: true, message: "Teléfono eliminado" };
        break;

      case "list":
        const { data: phones, error: listError } = await supabase
          .from("player_phones")
          .select(`
            *,
            type:player_phone_types(id, name)
          `)
          .eq("player_id", player_id)
          .order("is_primary", { ascending: false });

        if (listError) throw listError;
        result = phones;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Acción no válida" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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
