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

    const {
      alias,
      password,
      status,
      first_name,
      last_name,
      birth_date,
      email,
      address,
      phones,
    } = await req.json();

    if (!alias || !password || !first_name || !last_name || !birth_date || !email) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: statusData } = await supabase
      .from("player_statuses")
      .select("id")
      .eq("name", status || "activo")
      .single();

    if (!statusData) {
      return new Response(
        JSON.stringify({ error: "Estado inválido" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: hashedPassword } = await supabase.rpc("hash_password", {
      password: password,
    });

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        alias,
        password_hash: hashedPassword,
        status_id: statusData.id,
        first_name,
        last_name,
        birth_date,
        email,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    if (address) {
      const { data: addressData, error: addressError } = await supabase
        .from("player_addresses")
        .insert({
          street: address.street,
          number: address.number,
          floor: address.floor,
          apartment: address.apartment,
          state_id: address.state_id,
          country_id: address.country_id,
          postal_code: address.postal_code,
        })
        .select()
        .single();

      if (addressError) throw addressError;

      const { error: assignmentError } = await supabase
        .from("player_address_assignments")
        .insert({
          player_id: player.id,
          address_id: addressData.id,
        });

      if (assignmentError) throw assignmentError;
    }

    if (phones && phones.length > 0) {
      const phonesData = phones.map((phone: any) => ({
        player_id: player.id,
        phone_type_id: phone.phone_type_id,
        country_code: phone.country_code,
        phone_number: phone.phone_number,
        is_primary: phone.is_primary || false,
      }));

      const { error: phonesError } = await supabase
        .from("player_phones")
        .insert(phonesData);

      if (phonesError) throw phonesError;
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
      .eq("id", player.id)
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
