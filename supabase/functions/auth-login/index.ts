import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LoginRequest {
  email: string;
  password: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email y contraseña son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: user, error: userError } = await supabaseClient
      .from('admin_users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Credenciales incorrectas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario inactivo' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (user.is_blocked) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Su usuario ha sido bloqueado. Por favor, contacte al administrador del sistema.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cuenta bloqueada temporalmente' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashData = encoder.encode(user.password_hash);

    const { data: verifyResult } = await supabaseClient.rpc('verify_password', {
      password: password,
      hash: user.password_hash
    });

    const isValid = verifyResult === true;

    if (!isValid) {
      await supabaseClient
        .from('admin_users')
        .update({
          login_attempts: user.login_attempts + 1,
          locked_until: user.login_attempts >= 4
            ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
            : null
        })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({ success: false, error: 'Credenciales incorrectas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (user.two_factor_enabled) {
      return new Response(
        JSON.stringify({ success: true, requires_2fa: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    let geoData = { city: null, state: null, country: null };
    if (clientIp && clientIp !== 'unknown' && clientIp !== '127.0.0.1' && clientIp !== 'localhost') {
      try {
        console.log('[GEO] Fetching geolocation for IP:', clientIp);
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
        console.log('[GEO] Response status:', geoResponse.status);

        if (geoResponse.ok) {
          const geoJson = await geoResponse.json();
          console.log('[GEO] Response data:', JSON.stringify(geoJson));

          geoData = {
            city: geoJson.city || null,
            state: geoJson.region || null,
            country: geoJson.country_name || null
          };
          console.log('[GEO] Extracted data:', geoData);
        } else {
          const errorText = await geoResponse.text();
          console.error('[GEO] API error response:', errorText);

          // Fallback a ip-api.com que no tiene límites de rate
          try {
            console.log('[GEO] Trying fallback API...');
            const fallbackResponse = await fetch(`http://ip-api.com/json/${clientIp}`);
            if (fallbackResponse.ok) {
              const fallbackJson = await fallbackResponse.json();
              console.log('[GEO] Fallback response:', JSON.stringify(fallbackJson));

              if (fallbackJson.status === 'success') {
                geoData = {
                  city: fallbackJson.city || null,
                  state: fallbackJson.regionName || null,
                  country: fallbackJson.country || null
                };
                console.log('[GEO] Fallback data used:', geoData);
              }
            }
          } catch (fallbackError) {
            console.error('[GEO] Fallback API error:', fallbackError);
          }
        }
      } catch (geoError) {
        console.error('[GEO] Fetch error:', geoError);
      }
    } else {
      console.log('[GEO] Skipping geolocation - IP is local or unknown:', clientIp);
    }

    await supabaseClient
      .from('admin_users')
      .update({
        last_login_at: new Date().toISOString(),
        login_attempts: 0,
        locked_until: null,
        is_online: true,
        last_activity_at: new Date().toISOString(),
        last_login_ip: clientIp,
        last_login_city: geoData.city,
        last_login_state: geoData.state,
        last_login_country: geoData.country
      })
      .eq('id', user.id);

    const { data: permissions } = await supabaseClient
      .from('role_permissions')
      .select('permission:permissions(*)')
      .eq('role_id', user.role_id);

    await supabaseClient
      .from('admin_audit_log')
      .insert({
        user_id: user.id,
        action: 'login',
        module: 'auth',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      permissions: permissions?.map(p => p.permission) || [],
      two_factor_enabled: user.two_factor_enabled
    };

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
