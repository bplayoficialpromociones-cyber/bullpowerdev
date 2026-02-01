#!/usr/bin/env node

/**
 * TEST SOLO DE VERIFICACIÓN 2FA
 */

import speakeasy from 'speakeasy';

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

const TEST_USER = {
  email: 'maxi2025new@gmail.com',
  secret: 'PN4ESYSUG45HONSOG5NVOYKWJNSHE5JKHBGWYYSOORHSI5SGI52Q'
};

async function test2FAOnly() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       TEST DE VERIFICACIÓN 2FA CON SPEAKEASY         ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    console.log(`Usuario: ${TEST_USER.email}`);
    console.log(`Secret: ${TEST_USER.secret}\n`);

    // Generar código con speakeasy
    console.log('📊 Generando código 2FA...\n');
    const code = speakeasy.totp({
      secret: TEST_USER.secret,
      encoding: 'base32'
    });

    console.log(`✅ Código generado: ${code}\n`);

    // Verificar localmente
    const isValidLocal = speakeasy.totp.verify({
      secret: TEST_USER.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    console.log(`Verificación local: ${isValidLocal ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`);

    if (!isValidLocal) {
      console.error('❌ ERROR: El código no es válido localmente');
      return;
    }

    // Verificar en el servidor
    console.log('📊 Verificando en el servidor...\n');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify-2fa`, {
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

    console.log(`Status: ${response.status} ${response.statusText}\n`);

    const result = await response.json();
    console.log('Respuesta del servidor:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (response.ok && result.success) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🎉 TEST EXITOSO!');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('✅ La verificación 2FA funciona correctamente\n');
      console.log('📝 Ahora puedes usar Google Authenticator:\n');
      console.log('1. Abre Google Authenticator');
      console.log('2. Elimina la cuenta anterior');
      console.log('3. Escanea el QR desde:');
      console.log('   https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
                 encodeURIComponent(`otpauth://totp/maxi2025new%40gmail.com?secret=${TEST_USER.secret}&issuer=Bull%20Power%20Admin`));
      console.log('4. El código que veas debe funcionar en el login\n');
    } else {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ TEST FALLÓ');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('🔍 Revisa los logs del Edge Function en Supabase Dashboard\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

test2FAOnly();
