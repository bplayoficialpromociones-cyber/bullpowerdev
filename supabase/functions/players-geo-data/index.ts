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
    const countryId = url.searchParams.get("country_id");

    const { data: countries, error: countriesError } = await supabase
      .from("player_countries")
      .select("*")
      .order("name");

    if (countriesError) throw countriesError;

    let states = [];
    if (countryId) {
      const { data: statesData, error: statesError } = await supabase
        .from("player_states")
        .select("*")
        .eq("country_id", countryId)
        .order("name");

      if (statesError) throw statesError;
      states = statesData;
    }

    const { data: statuses, error: statusesError } = await supabase
      .from("player_statuses")
      .select("*");

    if (statusesError) throw statusesError;

    const { data: phoneTypes, error: phoneTypesError } = await supabase
      .from("player_phone_types")
      .select("*");

    if (phoneTypesError) throw phoneTypesError;

    return new Response(
      JSON.stringify({
        countries,
        states,
        statuses,
        phoneTypes,
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
