// Simula exactamente lo que hace el frontend
import { readFileSync } from 'fs';

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

async function simulateFrontendLogin() {
  console.log('🌐 Simulando exactamente el flujo del frontend...\n');

  try {
    // 1. Generar CAPTCHA (igual que loadCaptcha())
    console.log('1️⃣ Llamando a captcha-generate...');
    const captchaResponse = await fetch(`${SUPABASE_URL}/functions/v1/captcha-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    });

    const captchaData = await captchaResponse.json();
    console.log('CAPTCHA Response:', captchaData);

    if (!captchaData.success) {
      console.error('❌ CAPTCHA no se generó correctamente');
      return false;
    }

    const captchaChallenge = captchaData.challenge;
    const captchaToken = captchaData.session_token;

    // 2. Calcular respuesta (simulando que el usuario la ingresó correctamente)
    const correctAnswer = eval(captchaChallenge.replace('= ?', '').trim());

    // Simular que el usuario lo ingresa en el input type="number"
    // El input devuelve el valor como string
    const captchaInput = String(correctAnswer);

    console.log('\n2️⃣ Preparando login...');
    console.log('Email:', 'admin@bullpower.com');
    console.log('CAPTCHA Challenge:', captchaChallenge);
    console.log('CAPTCHA Answer (input):', captchaInput);
    console.log('CAPTCHA Token:', captchaToken);

    // 3. Hacer login (exactamente como handleSubmit())
    console.log('\n3️⃣ Enviando request de login...');
    const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        email: 'admin@bullpower.com',
        password: 'BullPower2026!',
        captcha_token: captchaToken,
        captcha_answer: String(captchaInput) // Exactamente como en el frontend
      }),
    });

    console.log('Response Status:', loginResponse.status);
    console.log('Response OK:', loginResponse.ok);

    // 4. Manejar respuesta (como en el frontend)
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('\n❌ Error (response.ok = false)');
      console.error('Error data:', errorData);
      return false;
    }

    const loginData = await loginResponse.json();

    if (loginData.requires_2fa) {
      console.log('\n✅ Login exitoso - Requiere 2FA');
      return true;
    } else if (loginData.success) {
      console.log('\n✅ Login exitoso - Acceso completo');
      console.log('Usuario:', loginData.user.email);
      console.log('Rol:', loginData.user.role.name);
      return true;
    } else {
      console.error('\n❌ Login falló');
      console.error('Error:', loginData.error);
      return false;
    }

  } catch (error) {
    console.error('\n❌ Exception durante el test:');
    console.error(error);
    return false;
  }
}

simulateFrontendLogin().then(success => {
  console.log('\n' + '='.repeat(50));
  console.log(success ? '✅ TEST PASÓ' : '❌ TEST FALLÓ');
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
});
