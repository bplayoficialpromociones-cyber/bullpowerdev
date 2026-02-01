/**
 * Test completo del flujo de login con 2FA
 */

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

const TEST_EMAIL = 'maxi2025new@gmail.com';
const TEST_SECRET = 'DE5SDXKK2J2PAJN37KS7L22QGEASZBMN';

// TOTP functions
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
  if (key.length > blockSize) key = sha1(key);
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

async function testCompleteLogin() {
  console.log('='.repeat(70));
  console.log('TEST COMPLETO DE LOGIN CON 2FA');
  console.log('='.repeat(70));
  console.log();

  try {
    const currentCode = generateCurrentTOTP(TEST_SECRET);
    console.log('Email:', TEST_EMAIL);
    console.log('Código 2FA actual:', currentCode);
    console.log();

    console.log('Llamando a auth-verify-2fa...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        code: currentCode
      })
    });

    console.log('Status:', response.status, response.statusText);

    const data = await response.json();
    console.log();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log();

    if (data.success) {
      console.log('✓✓✓ TEST EXITOSO ✓✓✓');
      console.log();
      console.log('Usuario autenticado:');
      console.log('- Email:', data.user.email);
      console.log('- Nombre:', data.user.full_name);
      console.log('- Rol:', data.user.role.display_name);
      console.log('- Permisos:', data.user.permissions.length);
      console.log();
      console.log('El login con 2FA funciona correctamente!');
    } else {
      console.log('✗✗✗ TEST FALLÓ ✗✗✗');
      console.log('Error:', data.error);
      if (data.details) {
        console.log('Detalles:', data.details);
      }
    }

  } catch (error) {
    console.error('✗✗✗ ERROR EN EL TEST ✗✗✗');
    console.error(error.message);
  }

  console.log();
  console.log('='.repeat(70));
}

testCompleteLogin();
