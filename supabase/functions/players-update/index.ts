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

    const { id, ...updates } = await req.json();

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

    const updateData: any = {};

    if (updates.alias) updateData.alias = updates.alias;
    if (updates.first_name) updateData.first_name = updates.first_name;
    if (updates.last_name) updateData.last_name = updates.last_name;
    if (updates.birth_date) updateData.birth_date = updates.birth_date;
    if (updates.email) updateData.email = updates.email;

    if (updates.status) {
      const { data: statusData } = await supabase
        .from("player_statuses")
        .select("id")
        .eq("name", updates.status)
        .single();

      if (statusData) {
        updateData.status_id = statusData.id;
      }
    }

    if (updates.password) {
      const { data: hashedPassword } = await supabase.rpc("hash_password", {
        password: updates.password,
      });
      updateData.password_hash = hashedPassword;
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (playerError) throw playerError;

    if (updates.address) {
      const { data: currentAssignment } = await supabase
        .from("player_address_assignments")
        .select("address_id")
        .eq("player_id", id)
        .single();

      if (currentAssignment) {
        await supabase
          .from("player_addresses")
          .update({
            street: updates.address.street,
            number: updates.address.number,
            floor: updates.address.floor,
            apartment: updates.address.apartment,
            state_id: updates.address.state_id,
            country_id: updates.address.country_id,
            postal_code: updates.address.postal_code,
          })
          .eq("id", currentAssignment.address_id);
      }
    }

    const { data: fullPlayer } = await supabase
      .from("players")
      .select(`
        *,
        status:player_statuses(id, name),
        address:player_address_assignments(
          address:player_addresses(
            *,
            state:player_states(id, name),
            country:player_countries(id, name, code)
          )
        ),
        phones:player_phones(
          *,
          type:player_phone_types(id, name)
        )
      `)
      .eq("id", id)
      .single();

    return new Response(
      JSON.stringify(fullPlayer),
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
