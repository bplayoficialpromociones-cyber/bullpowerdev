/**
 * Setup completo para maxi2025new@gmail.com
 */

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

const USER_ID = 'f263935b-4a55-4a4c-b0b3-7e4263f5fb0c';
const NEW_EMAIL = 'maxi2025new@gmail.com';

async function setup() {
  console.log('='.repeat(70));
  console.log('SETUP COMPLETO - maxi2025new@gmail.com');
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
      console.log('⚠️  Error desactivando 2FA (puede que ya esté desactivado):', disableData.error);
    } else {
      console.log('✓ 2FA desactivado');
    }
    console.log();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Paso 2: Activar 2FA con nuevo email
    console.log('Paso 2: Activando 2FA con nuevo secret...');
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

    console.log('✓ 2FA activado');
    console.log();

    console.log('='.repeat(70));
    console.log('CONFIGURACIÓN 2FA');
    console.log('='.repeat(70));
    console.log();
    console.log('Email:', NEW_EMAIL);
    console.log('Secret:', enableData.secret);
    console.log();
    console.log('QR CODE URL (Ábrelo en tu navegador):');
    console.log(enableData.qrCodeUrl);
    console.log();

    console.log('='.repeat(70));
    console.log('INSTRUCCIONES');
    console.log('='.repeat(70));
    console.log();
    console.log('1. Abre Google Authenticator');
    console.log('2. Si existe una cuenta vieja de "Bull Power Admin", ELIMÍNALA');
    console.log('3. Agregar cuenta → Escanear código QR');
    console.log('4. Abre esta URL en tu navegador:');
    console.log();
    console.log('   ' + enableData.qrCodeUrl);
    console.log();
    console.log('5. Escanea el QR con Google Authenticator');
    console.log('6. Ve a: https://bullpowerdev.ar/login');
    console.log('7. Ingresa:');
    console.log('   Email: maxi2025new@gmail.com');
    console.log('   Password: Spins2025@');
    console.log('8. Resuelve el CAPTCHA');
    console.log('9. Ingresa el código de Google Authenticator');
    console.log();
    console.log('✓ Debe funcionar ahora!');
    console.log();

  } catch (error) {
    console.error('ERROR:', error.message);
    throw error;
  }
}

setup();
