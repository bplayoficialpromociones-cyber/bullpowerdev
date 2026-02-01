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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID del jugador requerido" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data, error } = await supabase
      .from("players")
      .select(`
        *,
        status:player_statuses(id, name),
        address:player_address_assignments(
          address:player_addresses(
            *,
            state:player_states(id, name),
            country:player_countries(id, name, code, phone_code)
          )
        ),
        phones:player_phones(
          *,
          type:player_phone_types(id, name)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    const { data: connections } = await supabase
      .from("player_connections")
      .select("id, ip_address, country, city, connected_at")
      .eq("player_id", id)
      .order("connected_at", { ascending: false })
      .limit(50);

    const result = {
      ...data,
      connections: connections || []
    };

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
