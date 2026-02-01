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
    const { name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id, multimedia_pack_url, themes, mechanics, denominations, trailers } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existingGame } = await supabaseClient
      .from("games")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();

    if (existingGame) {
      return new Response(
        JSON.stringify({
          error: `Ya existe un juego con el nombre "${name}". Por favor, elija un nombre diferente.`
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

    const { data: newGame, error: gameError } = await supabaseClient
      .from("games")
      .insert({
        name,
        game_type_id,
        trailer_release_date,
        integration_date,
        rtp,
        volatility_id,
        status_id,
        multimedia_pack_url,
      })
      .select()
      .single();

    if (gameError) {
      if (gameError.code === '23505') {
        return new Response(
          JSON.stringify({
            error: `Ya existe un juego con el nombre "${name}". Por favor, elija un nombre diferente.`
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
      throw gameError;
    }

    if (themes && themes.length > 0) {
      const themeRelations = themes.map((themeId: string) => ({
        game_id: newGame.id,
        theme_id: themeId,
      }));
      await supabaseClient.from("games_themes").insert(themeRelations);
    }

    if (mechanics && mechanics.length > 0) {
      const mechanicRelations = mechanics.map((mechanicId: string) => ({
        game_id: newGame.id,
        mechanic_id: mechanicId,
      }));
      await supabaseClient.from("games_mechanics").insert(mechanicRelations);
    }

    if (denominations && denominations.length > 0) {
      const denominationRelations = denominations.map((denominationId: string) => ({
        game_id: newGame.id,
        denomination_id: denominationId,
      }));
      await supabaseClient.from("game_denominations").insert(denominationRelations);
    }

    if (trailers && trailers.length > 0) {
      const trailerRecords = trailers.map((trailer: any) => ({
        ...trailer,
        game_id: newGame.id,
      }));
      await supabaseClient.from("trailers").insert(trailerRecords);
    }

    return new Response(JSON.stringify(newGame), {
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
