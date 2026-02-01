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
    const { id, name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id, multimedia_pack_url, themes, mechanics, denominations, trailers } = await req.json();

    if (!id) {
      throw new Error("ID de juego requerido");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: gameError } = await supabaseClient
      .from("games")
      .update({
        name,
        game_type_id,
        trailer_release_date,
        integration_date,
        rtp,
        volatility_id,
        status_id,
        multimedia_pack_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (gameError) {
      throw gameError;
    }

    await supabaseClient.from("games_themes").delete().eq("game_id", id);
    await supabaseClient.from("games_mechanics").delete().eq("game_id", id);
    await supabaseClient.from("game_denominations").delete().eq("game_id", id);
    await supabaseClient.from("trailers").delete().eq("game_id", id);

    if (themes && themes.length > 0) {
      const themeRelations = themes.map((themeId: string) => ({
        game_id: id,
        theme_id: themeId,
      }));
      await supabaseClient.from("games_themes").insert(themeRelations);
    }

    if (mechanics && mechanics.length > 0) {
      const mechanicRelations = mechanics.map((mechanicId: string) => ({
        game_id: id,
        mechanic_id: mechanicId,
      }));
      await supabaseClient.from("games_mechanics").insert(mechanicRelations);
    }

    if (denominations && denominations.length > 0) {
      const denominationRelations = denominations.map((denominationId: string) => ({
        game_id: id,
        denomination_id: denominationId,
      }));
      await supabaseClient.from("game_denominations").insert(denominationRelations);
    }

    if (trailers && trailers.length > 0) {
      const trailerRecords = trailers.map((trailer: any) => ({
        ...trailer,
        game_id: id,
      }));
      await supabaseClient.from("trailers").insert(trailerRecords);
    }

    const { data: updatedGame, error: fetchError } = await supabaseClient
      .from("games")
      .select()
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return new Response(JSON.stringify(updatedGame), {
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
