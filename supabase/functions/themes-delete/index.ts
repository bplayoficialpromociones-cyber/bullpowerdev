import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
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
    const { id } = await req.json();

    if (!id) {
      throw new Error("ID requerido");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verificar si la temática tiene juegos relacionados
    const { data: gamesWithTheme, error: checkError } = await supabaseClient
      .from("games_themes")
      .select("game_id")
      .eq("theme_id", id);

    if (checkError) {
      throw checkError;
    }

    if (gamesWithTheme && gamesWithTheme.length > 0) {
      throw new Error(`No se puede eliminar la temática porque tiene ${gamesWithTheme.length} juego(s) relacionado(s). Primero debe desvincular los juegos.`);
    }

    const { error } = await supabaseClient
      .from("themes")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
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
