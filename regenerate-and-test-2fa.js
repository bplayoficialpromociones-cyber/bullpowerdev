#!/usr/bin/env node

/**
 * REGENERAR Y PROBAR 2FA CON NUEVA IMPLEMENTACIÓN
 */

import speakeasy from 'speakeasy';

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';
const TEST_USER = {
  email: 'maxi2025new@gmail.com',
  password: 'Maximiliano2025'
};

async function regenerateAndTest() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  REGENERAR Y PROBAR 2FA - NUEVA IMPLEMENTACIÓN SPEAKEASY ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // PASO 1: Obtener ID del usuario
    console.log('📊 PASO 1: Obtener usuario de la BD\n');

    const getUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?email=eq.${encodeURIComponent(TEST_USER.email)}&deleted_at=is.null&select=id,email,two_factor_enabled`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const users = await getUserResponse.json();
    if (!users || users.length === 0) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    const user = users[0];
    console.log(`✅ Usuario: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   2FA actual: ${user.two_factor_enabled}\n`);

    // PASO 2: Desactivar 2FA si está activo
    if (user.two_factor_enabled) {
      console.log('📊 PASO 2: Desactivando 2FA actual...\n');

      const disableResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'disable'
        })
      });

      if (!disableResponse.ok) {
        console.error('❌ Error al desactivar:', await disableResponse.text());
        return;
      }

      console.log('✅ 2FA desactivado\n');
    }

    // PASO 3: Activar 2FA con nueva implementación
    console.log('📊 PASO 3: Activando 2FA con speakeasy...\n');

    const enableResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id,
        action: 'enable'
      })
    });

    if (!enableResponse.ok) {
      console.error('❌ Error al activar:', await enableResponse.text());
      return;
    }

    const result = await enableResponse.json();
    console.log('✅ 2FA activado exitosamente!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📱 INFORMACIÓN DEL QR\n');
    console.log(`Secret: ${result.secret}`);
    console.log(`QR URL: ${result.qrCodeUrl}\n`);

    // PASO 4: Probar login completo
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 PASO 4: Probar login completo\n');

    // 4.1: Login con email/password
    console.log('   4.1: Login con email/password...');
    const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (!loginResponse.ok) {
      console.error('   ❌ Error en login:', await loginResponse.text());
      return;
    }

    const loginResult = await loginResponse.json();
    console.log(`   ✅ Login exitoso - Requires 2FA: ${loginResult.requires_2fa}\n`);

    if (!loginResult.requires_2fa) {
      console.error('   ❌ ERROR: Debería requerir 2FA');
      return;
    }

    // 4.2: Generar código con speakeasy
    console.log('   4.2: Generando código 2FA con speakeasy...');
    const code = speakeasy.totp({
      secret: result.secret,
      encoding: 'base32'
    });
    console.log(`   ✅ Código generado: ${code}\n`);

    // Verificar localmente
    const isValidLocal = speakeasy.totp.verify({
      secret: result.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });
    console.log(`   Verificación local: ${isValidLocal ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`);

    if (!isValidLocal) {
      console.error('   ❌ ERROR: Código no válido localmente');
      return;
    }

    // 4.3: Verificar código en el servidor
    console.log('   4.3: Verificando código en el servidor...');
    const verify2FAResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify-2fa`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        code: code
      })
    });

    console.log(`   Status: ${verify2FAResponse.status}`);

    if (!verify2FAResponse.ok) {
      const errorText = await verify2FAResponse.text();
      console.error('   ❌ Error en verificación:', errorText);
      console.log('\n🔍 REVISA LOS LOGS DEL EDGE FUNCTION EN SUPABASE');
      return;
    }

    const verify2FAResult = await verify2FAResponse.json();
    console.log(`   ✅ Verificación exitosa!\n`);

    if (verify2FAResult.user) {
      console.log(`   Usuario: ${verify2FAResult.user.email}`);
      console.log(`   Nombre: ${verify2FAResult.user.full_name}`);
      console.log(`   Rol: ${verify2FAResult.user.role?.name || 'N/A'}\n`);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 TEST COMPLETADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ El sistema 2FA funciona correctamente con speakeasy\n');
    console.log('📝 PRÓXIMOS PASOS:\n');
    console.log('1. Abre Google Authenticator en tu teléfono');
    console.log('2. Elimina la cuenta anterior de "Bull Power Admin"');
    console.log('3. Escanea el nuevo QR desde esta URL:');
    console.log(`   ${result.qrCodeUrl}`);
    console.log('4. Intenta iniciar sesión en https://bullpowerdev.ar/\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

regenerateAndTest();
