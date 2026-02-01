// Script de prueba automatizado para el login
import { readFileSync } from 'fs';

// Leer variables de entorno del archivo .env
const envFile = readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

async function testLogin() {
  console.log('🧪 Iniciando prueba de login...\n');

  try {
    // Paso 1: Generar CAPTCHA
    console.log('1️⃣ Generando CAPTCHA...');
    const captchaResponse = await fetch(`${SUPABASE_URL}/functions/v1/captcha-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    });

    if (!captchaResponse.ok) {
      throw new Error(`Error en captcha-generate: ${captchaResponse.status}`);
    }

    const captchaData = await captchaResponse.json();
    console.log('✅ CAPTCHA generado:', {
      challenge: captchaData.challenge,
      session_token: captchaData.session_token,
      success: captchaData.success
    });

    if (!captchaData.success) {
      throw new Error('CAPTCHA no se generó correctamente');
    }

    // Calcular la respuesta del CAPTCHA
    const answer = eval(captchaData.challenge.replace('= ?', '').trim());
    console.log(`📝 Respuesta calculada del CAPTCHA: ${answer}\n`);

    // Paso 2: Intentar login
    console.log('2️⃣ Intentando login...');
    const loginPayload = {
      email: 'admin@bullpower.com',
      password: 'BullPower2026!',
      captcha_token: captchaData.session_token,
      captcha_answer: String(answer) // Enviamos como string porque así lo hace el input type="number"
    };

    console.log('📤 Payload enviado:', {
      ...loginPayload,
      password: '***OCULTO***',
      captcha_answer: loginPayload.captcha_answer,
      captcha_answer_type: typeof loginPayload.captcha_answer
    });

    const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(loginPayload),
    });

    console.log(`📥 Status de respuesta: ${loginResponse.status}`);

    const loginData = await loginResponse.json();
    console.log('📥 Respuesta del servidor:', JSON.stringify(loginData, null, 2));

    if (loginResponse.ok && loginData.success) {
      console.log('\n✅ ¡PRUEBA EXITOSA! Login funcionando correctamente');
      console.log('Usuario:', loginData.user?.email);
      console.log('Rol:', loginData.user?.role?.name);
      return true;
    } else {
      console.log('\n❌ PRUEBA FALLIDA');
      console.log('Error:', loginData.error);
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

// Ejecutar prueba
testLogin().then(success => {
  process.exit(success ? 0 : 1);
});
