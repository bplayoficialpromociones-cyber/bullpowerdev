/**
 * Script para regenerar 2FA de maxinew2025@gmail.com
 */

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

const USER_ID = 'f263935b-4a55-4a4c-b0b3-7e4263f5fb0c';

async function regenerate2FA() {
  console.log('='.repeat(70));
  console.log('REGENERAR 2FA - maxinew2025@gmail.com');
  console.log('='.repeat(70));
  console.log();

  try {
    // Paso 1: Desactivar 2FA
    console.log('Paso 1: Desactivando 2FA actual...');
    const disableResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userId: USER_ID,
        action: 'disable'
      })
    });

    const disableData = await disableResponse.json();

    if (!disableResponse.ok || !disableData.success) {
      throw new Error(`Error desactivando 2FA: ${disableData.error}`);
    }

    console.log('✓ 2FA desactivado correctamente');
    console.log();

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Paso 2: Activar 2FA con nuevo secret
    console.log('Paso 2: Generando nuevo secret y activando 2FA...');
    const enableResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userId: USER_ID,
        action: 'enable'
      })
    });

    const enableData = await enableResponse.json();

    if (!enableResponse.ok || !enableData.success) {
      throw new Error(`Error activando 2FA: ${enableData.error}`);
    }

    console.log('✓ 2FA activado con nuevo secret');
    console.log();

    console.log('='.repeat(70));
    console.log('NUEVO SECRET Y QR CODE');
    console.log('='.repeat(70));
    console.log();
    console.log('Secret:', enableData.secret);
    console.log();
    console.log('QR Code URL:');
    console.log(enableData.qrCodeUrl);
    console.log();
    console.log('OTP Auth URL:');
    console.log(enableData.otpauthUrl);
    console.log();

    console.log('='.repeat(70));
    console.log('INSTRUCCIONES');
    console.log('='.repeat(70));
    console.log();
    console.log('1. Abre Google Authenticator en tu teléfono');
    console.log('2. Elimina la cuenta antigua de "Bull Power Admin - maxinew2025@gmail.com"');
    console.log('3. Agregar nueva cuenta → Escanear código QR');
    console.log('4. Abre esta URL en tu navegador para ver el QR:');
    console.log();
    console.log('   ' + enableData.qrCodeUrl);
    console.log();
    console.log('5. Escanea el QR con Google Authenticator');
    console.log('6. Prueba iniciar sesión con el nuevo código');
    console.log();

    return enableData;

  } catch (error) {
    console.error('ERROR:', error.message);
    throw error;
  }
}

regenerate2FA();
