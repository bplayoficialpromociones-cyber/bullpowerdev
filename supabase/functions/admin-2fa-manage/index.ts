import { createClient } from 'jsr:@supabase/supabase-js@2';
import speakeasy from 'npm:speakeasy@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Enable2FARequest {
  userId: string;
  action: 'enable' | 'disable';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, action }: Enable2FARequest = await req.json();

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ success: false, error: 'userId y action son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: user, error: userError } = await supabaseClient
      .from('admin_users')
      .select('id, email, full_name, two_factor_enabled')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'enable') {
      // Generar secret usando speakeasy (garantiza compatibilidad)
      const secretObj = speakeasy.generateSecret({
        name: 'Bull Power Admin',
        issuer: 'Bull Power Admin',
        length: 32
      });

      const secret = secretObj.base32;
      console.log('Generated secret:', secret);
      console.log('Secret length:', secret.length);

      const issuer = 'Bull Power Admin';
      const accountName = user.email;

      // Generar la URL otpauth usando speakeasy
      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret,
        label: accountName,
        issuer: issuer,
        encoding: 'base32'
      });
      console.log('Generated otpauth URL:', otpauthUrl);

      const { error: updateError } = await supabaseClient
        .from('admin_users')
        .update({
          two_factor_secret: secret,
          two_factor_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Error al activar 2FA' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseClient
        .from('admin_audit_log')
        .insert({
          user_id: userId,
          action: 'enable_2fa',
          module: 'admin_users',
          entity_type: 'admin_user',
          entity_id: userId,
          new_values: { two_factor_enabled: true }
        });

      return new Response(
        JSON.stringify({
          success: true,
          secret,
          otpauthUrl,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(otpauthUrl)}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'disable') {
      const { error: updateError } = await supabaseClient
        .from('admin_users')
        .update({
          two_factor_secret: null,
          two_factor_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Error al desactivar 2FA' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseClient
        .from('admin_audit_log')
        .insert({
          user_id: userId,
          action: 'disable_2fa',
          module: 'admin_users',
          entity_type: 'admin_user',
          entity_id: userId,
          new_values: { two_factor_enabled: false }
        });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('2FA management error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error en el servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
