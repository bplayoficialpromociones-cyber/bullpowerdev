import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      throw new Error("ID de juego requerido");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: game, error } = await supabaseClient
      .from("games")
      .select(`
        *,
        game_type:game_types(id, name, description),
        volatility:game_volatilities(id, name),
        status:game_statuses(id, name),
        themes:games_themes(theme:themes(id, name)),
        mechanics:games_mechanics(mechanic:mechanics(id, name)),
        denominations:game_denominations(denomination:denominations(id, name, currency:expenses_currencies(*))),
        trailers(*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!game) {
      throw new Error("Juego no encontrado");
    }

    const formattedGame = {
      ...game,
      themes: game.themes?.map((t: any) => t.theme),
      mechanics: game.mechanics?.map((m: any) => m.mechanic),
      denominations: game.denominations?.map((d: any) => d.denomination),
    };

    return new Response(JSON.stringify(formattedGame), {
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
