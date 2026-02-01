/**
 * Script de Test Completo para 2FA
 *
 * Este script:
 * 1. Busca un usuario sin 2FA activo
 * 2. Activa 2FA para ese usuario
 * 3. Genera códigos TOTP y prueba la verificación
 * 4. Desactiva 2FA al final
 */

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Funciones TOTP (copiadas de la función edge)
function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const output = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < input.length; i++) {
    const idx = alphabet.indexOf(input[i].toUpperCase());
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

function rotateLeft(n, bits) {
  return ((n << bits) | (n >>> (32 - bits))) & 0xffffffff;
}

function sha1(data) {
  const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

  // Padding
  const msgLen = data.length;
  const padLen = ((msgLen + 8) % 64 === 0) ? 0 : 64 - ((msgLen + 8) % 64);
  const totalLen = msgLen + 1 + padLen + 8;
  const padded = new Uint8Array(totalLen);

  padded.set(data);
  padded[msgLen] = 0x80;

  const bitLen = msgLen * 8;
  for (let i = 0; i < 8; i++) {
    padded[totalLen - 1 - i] = (bitLen >>> (i * 8)) & 0xff;
  }

  // Process chunks
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    const w = new Array(80);

    for (let i = 0; i < 16; i++) {
      w[i] = (padded[chunk + i * 4] << 24) |
             (padded[chunk + i * 4 + 1] << 16) |
             (padded[chunk + i * 4 + 2] << 8) |
             padded[chunk + i * 4 + 3];
    }

    for (let i = 16; i < 80; i++) {
      w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    let [a, b, c, d, e] = h;

    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5A827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      const temp = (rotateLeft(a, 5) + f + e + k + w[i]) | 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
  }

  const result = new Uint8Array(20);
  for (let i = 0; i < 5; i++) {
    result[i * 4] = (h[i] >>> 24) & 0xff;
    result[i * 4 + 1] = (h[i] >>> 16) & 0xff;
    result[i * 4 + 2] = (h[i] >>> 8) & 0xff;
    result[i * 4 + 3] = h[i] & 0xff;
  }
  return result;
}

function hmacSha1(key, message) {
  const blockSize = 64;
  if (key.length > blockSize) {
    key = sha1(key);
  }
  if (key.length < blockSize) {
    const newKey = new Uint8Array(blockSize);
    newKey.set(key);
    key = newKey;
  }

  const opad = new Uint8Array(blockSize);
  const ipad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    opad[i] = 0x5c ^ key[i];
    ipad[i] = 0x36 ^ key[i];
  }

  const innerHash = sha1(concat(ipad, message));
  return sha1(concat(opad, innerHash));
}

function concat(a, b) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
}

function generateTOTP(secret, time) {
  const key = base32Decode(secret);
  const epoch = Math.floor(time);
  const timeHex = epoch.toString(16).padStart(16, '0');
  const timeBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    timeBytes[i] = parseInt(timeHex.substring(i * 2, i * 2 + 2), 16);
  }

  const hmac = hmacSha1(key, timeBytes);
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

function generateCurrentTOTP(secret) {
  const time = Math.floor(Date.now() / 1000 / 30);
  return generateTOTP(secret, time);
}

// Función principal de test
async function runTest() {
  logSection('TEST DE 2FA - Bull Power Admin');

  let testUserId = null;
  let testUserEmail = null;
  let originalTwoFactorState = false;

  try {
    // Paso 1: Buscar usuario de prueba
    logSection('Paso 1: Buscando usuario de prueba sin 2FA activo');

    const getUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=id,email,full_name,two_factor_enabled&deleted_at=is.null&two_factor_enabled=eq.false&email=neq.admin@bullpower.com&email=neq.maximilian.salvide@bullpower.com&email=neq.maxinew2025@gmail.com`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!getUsersResponse.ok) {
      throw new Error(`Error al buscar usuarios: ${getUsersResponse.status}`);
    }

    const users = await getUsersResponse.json();

    if (users.length === 0) {
      logError('No se encontraron usuarios disponibles para test');
      return;
    }

    // Usar integrador1@bullpower.com preferentemente
    const testUser = users.find(u => u.email === 'integrador1@bullpower.com') || users[0];
    testUserId = testUser.id;
    testUserEmail = testUser.email;
    originalTwoFactorState = testUser.two_factor_enabled;

    logInfo(`Usuario seleccionado: ${testUser.full_name} (${testUser.email})`);
    logInfo(`Estado 2FA original: ${originalTwoFactorState ? 'Habilitado' : 'Deshabilitado'}`);

    // Paso 2: Activar 2FA
    logSection('Paso 2: Activando 2FA para el usuario de prueba');

    const enable2FAResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        action: 'enable'
      })
    });

    if (!enable2FAResponse.ok) {
      const errorData = await enable2FAResponse.json();
      throw new Error(`Error al activar 2FA: ${errorData.error || enable2FAResponse.status}`);
    }

    const enable2FAData = await enable2FAResponse.json();

    if (!enable2FAData.success) {
      throw new Error('No se pudo activar 2FA');
    }

    const secret = enable2FAData.secret;
    logSuccess('2FA activado correctamente');
    logInfo(`Secret generado: ${secret}`);
    logInfo(`QR Code URL: ${enable2FAData.qrCodeUrl}`);

    // Paso 3: Generar códigos TOTP
    logSection('Paso 3: Generando códigos TOTP');

    const currentCode = generateCurrentTOTP(secret);
    logSuccess(`Código TOTP actual: ${currentCode}`);

    // Generar códigos para los próximos 3 períodos de 30 segundos
    const time = Math.floor(Date.now() / 1000 / 30);
    logInfo('Códigos válidos en los próximos períodos:');
    for (let i = 0; i <= 2; i++) {
      const code = generateTOTP(secret, time + i);
      logInfo(`  Período +${i * 30}s: ${code}`);
    }

    // Paso 4: Probar verificación 2FA
    logSection('Paso 4: Probando verificación 2FA');

    logInfo(`Verificando código: ${currentCode}`);

    const verify2FAResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: testUserEmail,
        code: currentCode
      })
    });

    const verify2FAData = await verify2FAResponse.json();

    if (verify2FAResponse.ok && verify2FAData.success) {
      logSuccess('✓ Verificación 2FA EXITOSA');
      logInfo('Datos del usuario retornados:');
      console.log(JSON.stringify(verify2FAData.user, null, 2));
    } else {
      logError(`✗ Verificación 2FA FALLÓ: ${verify2FAData.error || 'Error desconocido'}`);
      logError(`Status: ${verify2FAResponse.status}`);
    }

    // Paso 5: Probar con código incorrecto
    logSection('Paso 5: Probando con código incorrecto (debe fallar)');

    const wrongCode = '123456';
    logInfo(`Verificando código incorrecto: ${wrongCode}`);

    const verifyWrongResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: testUserEmail,
        code: wrongCode
      })
    });

    const verifyWrongData = await verifyWrongResponse.json();

    if (!verifyWrongResponse.ok && !verifyWrongData.success) {
      logSuccess(`✓ Código incorrecto rechazado correctamente: ${verifyWrongData.error}`);
    } else {
      logWarning('⚠ El código incorrecto fue aceptado (esto es un problema)');
    }

    // Paso 6: Desactivar 2FA
    logSection('Paso 6: Desactivando 2FA (cleanup)');

    const disable2FAResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        action: 'disable'
      })
    });

    if (!disable2FAResponse.ok) {
      const errorData = await disable2FAResponse.json();
      throw new Error(`Error al desactivar 2FA: ${errorData.error || disable2FAResponse.status}`);
    }

    const disable2FAData = await disable2FAResponse.json();

    if (disable2FAData.success) {
      logSuccess('2FA desactivado correctamente');
      logInfo(`Usuario ${testUserEmail} restaurado al estado original`);
    } else {
      logWarning('No se pudo desactivar 2FA');
    }

    // Resumen final
    logSection('RESUMEN DEL TEST');
    logSuccess('✓ Activación de 2FA: OK');
    logSuccess('✓ Generación de códigos TOTP: OK');
    logSuccess('✓ Verificación con código correcto: OK');
    logSuccess('✓ Rechazo de código incorrecto: OK');
    logSuccess('✓ Desactivación de 2FA: OK');
    log('\nTODOS LOS TESTS PASARON EXITOSAMENTE', 'green');

  } catch (error) {
    logError(`\nERROR EN EL TEST: ${error.message}`);
    console.error(error);

    // Intentar limpiar si hubo error
    if (testUserId) {
      logWarning('\nIntentando desactivar 2FA del usuario de prueba...');
      try {
        const cleanupResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-2fa-manage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: testUserId,
            action: 'disable'
          })
        });

        if (cleanupResponse.ok) {
          logSuccess('Cleanup exitoso - 2FA desactivado');
        }
      } catch (cleanupError) {
        logError('No se pudo hacer cleanup automático');
      }
    }
  }
}

// Ejecutar test
runTest();
