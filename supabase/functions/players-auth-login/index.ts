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

    const { alias, password, ip_address, country, city } = await req.json();

    if (!alias || !password) {
      return new Response(
        JSON.stringify({ error: "Alias y contraseña requeridos" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .select(`
        *,
        status:player_statuses(name)
      `)
      .eq("alias", alias)
      .single();

    if (playerError || !player) {
      return new Response(
        JSON.stringify({ error: "Credenciales inválidas" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (player.status.name === "bloqueado") {
      return new Response(
        JSON.stringify({ error: "Cuenta bloqueada" }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (player.status.name === "inactivo") {
      return new Response(
        JSON.stringify({ error: "Cuenta inactiva" }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: isValid } = await supabase.rpc("verify_password", {
      stored_hash: player.password_hash,
      password: password,
    });

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Credenciales inválidas" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (ip_address) {
      await supabase.from("player_connections").insert({
        player_id: player.id,
        ip_address: ip_address,
        country: country || "Unknown",
        city: city,
      });
    }

    const { password_hash, ...playerData } = player;

    return new Response(
      JSON.stringify({
        success: true,
        player: playerData,
      }),
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
