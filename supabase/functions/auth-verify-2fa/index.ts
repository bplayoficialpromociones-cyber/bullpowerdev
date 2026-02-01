import { createClient } from 'jsr:@supabase/supabase-js@2';
import speakeasy from 'npm:speakeasy@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface VerifyRequest {
  email: string;
  code: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('=== 2FA VERIFICATION START (speakeasy implementation) ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Content-Type:', req.headers.get('content-type'));

    // Verificar que la petición tenga un body
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('ERROR: Invalid Content-Type');
      return new Response(
        JSON.stringify({ success: false, error: 'Content-Type debe ser application/json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Leer el body de forma segura
    let requestBody;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);

      if (!text || text.trim() === '') {
        console.log('ERROR: Empty request body');
        return new Response(
          JSON.stringify({ success: false, error: 'El cuerpo de la petición está vacío' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      requestBody = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Formato JSON inválido', details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, code }: VerifyRequest = requestBody;
    console.log('Email received:', email);
    console.log('Code received:', code);
    console.log('Code length:', code?.length);
    console.log('Code type:', typeof code);

    if (!email || !code) {
      console.log('ERROR: Missing email or code');
      return new Response(
        JSON.stringify({ success: false, error: 'Email y código son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalizar el código: remover espacios y asegurarse de que sea string
    const normalizedCode = String(code).replace(/\s/g, '');
    console.log('Normalized code:', normalizedCode);

    if (!/^\d{6}$/.test(normalizedCode)) {
      console.log('ERROR: Invalid code format (must be 6 digits)');
      return new Response(
        JSON.stringify({ success: false, error: 'Código debe tener 6 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Querying user from database...');
    const { data: user, error: userError } = await supabaseClient
      .from('admin_users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle();

    console.log('User query result:', { userFound: !!user, error: userError?.message });

    if (userError) {
      console.error('Database error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al consultar usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.log('ERROR: User not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User 2FA status:', {
      email: user.email,
      twoFactorEnabled: user.two_factor_enabled,
      hasSecret: !!user.two_factor_secret,
      secretLength: user.two_factor_secret?.length
    });

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      console.log('ERROR: 2FA not properly configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuración 2FA inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying TOTP code using speakeasy...');
    console.log('Secret (first 8 chars):', user.two_factor_secret.substring(0, 8) + '...');
    console.log('Code to verify:', normalizedCode);

    const currentTime = Math.floor(Date.now() / 1000);
    const currentPeriod = Math.floor(currentTime / 30);
    console.log('Current Unix time:', currentTime);
    console.log('Current time period:', currentPeriod);

    // Verificar el código usando speakeasy con ventana de 2 períodos (±60 segundos)
    let isValid = false;
    try {
      isValid = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: normalizedCode,
        window: 2  // ±60 segundos
      });
      console.log('speakeasy verification result:', isValid);
    } catch (verifyError) {
      console.error('Error during speakeasy verification:', verifyError);
      console.error('Error message:', verifyError.message);
    }

    // Si falla con ventana 2, intentar con ventana más amplia para debugging
    if (!isValid) {
      console.log('Trying with extended window (window=6) for debugging...');

      try {
        const isValidExtended = speakeasy.totp.verify({
          secret: user.two_factor_secret,
          encoding: 'base32',
          token: normalizedCode,
          window: 6  // ±3 minutos
        });
        console.log('Extended window result:', isValidExtended);

        if (isValidExtended) {
          console.log('⚠️  Code is valid with extended window - possible time sync issue');
          // Aceptar el código si es válido con ventana extendida
          isValid = true;
        }
      } catch (extendedError) {
        console.error('Extended verification error:', extendedError);
      }
    }

    if (!isValid) {
      console.log('ERROR: Code verification failed');

      // Generar código actual para debugging
      try {
        const currentCode = speakeasy.totp({
          secret: user.two_factor_secret,
          encoding: 'base32'
        });
        console.log('Current valid code would be:', currentCode);

        // Generar códigos para ventanas cercanas
        for (let i = -2; i <= 2; i++) {
          const testTime = currentTime + (i * 30);
          const testCode = speakeasy.totp({
            secret: user.two_factor_secret,
            encoding: 'base32',
            time: testTime
          });
          console.log(`Code at offset ${i} (time ${testTime}):`, testCode);
        }
      } catch (genError) {
        console.error('Could not generate current code:', genError);
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Código 2FA incorrecto' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SUCCESS: Code is valid, updating user...');

    // Obtener IP del cliente
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      req.headers.get('x-real-ip') ||
                      'unknown';
    console.log('Client IP:', clientIp);

    // Obtener información de geolocalización
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
        last_login_ip: clientIp,
        last_login_city: geoData.city,
        last_login_state: geoData.state,
        last_login_country: geoData.country,
        is_online: true,
        last_activity_at: new Date().toISOString(),
        login_attempts: 0,
        locked_until: null
      })
      .eq('id', user.id);

    console.log('Fetching user permissions...');
    const { data: permissions } = await supabaseClient
      .from('role_permissions')
      .select('permission:permissions(*)')
      .eq('role_id', user.role_id);

    console.log('Permissions found:', permissions?.length || 0);

    console.log('Creating audit log...');
    await supabaseClient
      .from('admin_audit_log')
      .insert({
        user_id: user.id,
        action: 'login_2fa',
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

    console.log('=== 2FA VERIFICATION SUCCESS ===');
    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== 2FA VERIFICATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
