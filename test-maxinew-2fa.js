/**
 * Test específico para maxinew2025@gmail.com
 */

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

const TEST_EMAIL = 'maxinew2025@gmail.com';
const TEST_SECRET = 'Y62OQIXKFCN7JZ56M7XYMAUUGJ43K53C';

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

  const concat = (a, b) => {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
  };

  const innerHash = sha1(concat(ipad, message));
  return sha1(concat(opad, innerHash));
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

console.log('='.repeat(70));
console.log('DIAGNÓSTICO 2FA - maxinew2025@gmail.com');
console.log('='.repeat(70));
console.log();

console.log('Usuario:', TEST_EMAIL);
console.log('Secret en DB:', TEST_SECRET);
console.log('Longitud secret:', TEST_SECRET.length);
console.log();

// Verificar que el secret es válido base32
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
let invalidChars = [];
for (let char of TEST_SECRET) {
  if (!alphabet.includes(char)) {
    invalidChars.push(char);
  }
}

if (invalidChars.length > 0) {
  console.log('❌ ERROR: Secret contiene caracteres inválidos:', invalidChars);
  console.log('   Solo se permiten: A-Z, 2-7');
} else {
  console.log('✓ Secret es válido base32');
}
console.log();

console.log('Decodificación base32:');
try {
  const decoded = base32Decode(TEST_SECRET);
  console.log('✓ Secret decodificado correctamente');
  console.log('  Bytes:', decoded.length);
  console.log('  Primeros 8 bytes:', Array.from(decoded.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
} catch (e) {
  console.log('❌ Error decodificando secret:', e.message);
}
console.log();

console.log('Generación de códigos TOTP:');
const currentTime = Math.floor(Date.now() / 1000 / 30);
const now = new Date();
console.log('Hora actual:', now.toISOString());
console.log('Unix timestamp:', Math.floor(Date.now() / 1000));
console.log('Time period (30s):', currentTime);
console.log();

console.log('Códigos válidos (ventana de tiempo):');
console.log('-'.repeat(70));
for (let i = -2; i <= 2; i++) {
  const code = generateTOTP(TEST_SECRET, currentTime + i);
  const timeOffset = i * 30;
  const marker = i === 0 ? ' ← ACTUAL' : '';
  console.log(`  Offset ${i} (${timeOffset > 0 ? '+' : ''}${timeOffset}s): ${code}${marker}`);
}
console.log('-'.repeat(70));
console.log();

const currentCode = generateCurrentTOTP(TEST_SECRET);
console.log('CÓDIGO CORRECTO PARA ESTE MOMENTO:', currentCode);
console.log();

console.log('El código que ingresaste: 315304');
console.log('Código esperado:', currentCode);
console.log('¿Coinciden?', currentCode === '315304' ? '✓ SÍ' : '✗ NO');
console.log();

console.log('='.repeat(70));
console.log('SOLUCIÓN:');
console.log('='.repeat(70));
console.log();
console.log('El problema es que el secret en la base de datos NO COINCIDE');
console.log('con el secret que tienes en Google Authenticator.');
console.log();
console.log('Debes hacer lo siguiente:');
console.log('1. Ir al panel de Admin Users');
console.log('2. Desactivar 2FA para este usuario');
console.log('3. Volver a activar 2FA y escanear el NUEVO QR code');
console.log('4. Probar con el código del NUEVO authenticator');
console.log();
console.log('O alternativamente, elimina la cuenta de Google Authenticator');
console.log('y vuelve a escanear el QR con el secret actual de la DB.');
console.log();
