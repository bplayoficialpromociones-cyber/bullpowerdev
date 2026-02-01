#!/usr/bin/env node

/**
 * TEST 2FA EN TIEMPO REAL
 *
 * Este test genera códigos en tiempo real y te permite compararlos
 * con los que ves en Google Authenticator
 */

import * as crypto from 'crypto';

const USER_SECRET = 'CRUA5D25J4L32X7A55QKEARRSXGHNP6S';

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const output = [];
  let bits = 0;
  let value = 0;

  input = input.replace(/\s/g, '').toUpperCase();
  input = input.replace(/=+$/, '');

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function generateTOTP(secret, time = null) {
  if (time === null) {
    time = Math.floor(Date.now() / 1000);
  }

  const counter = Math.floor(time / 30);
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║  TEST 2FA EN TIEMPO REAL - GENERADOR DE CÓDIGOS  ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

console.log('📱 Secret configurado: ' + USER_SECRET);
console.log('');
console.log('🕐 Generando códigos cada 5 segundos...');
console.log('   Compara estos códigos con los de Google Authenticator\n');
console.log('┌─────────────────────┬─────────┬──────────────┐');
console.log('│   Hora del Sistema  │  Código │ Segundos Res │');
console.log('├─────────────────────┼─────────┼──────────────┤');

let lastCode = '';

function displayCode() {
  const now = Math.floor(Date.now() / 1000);
  const timeInPeriod = now % 30;
  const remaining = 30 - timeInPeriod;
  const code = generateTOTP(USER_SECRET);
  const time = new Date();
  const timeStr = time.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Mostrar asterisco si el código cambió
  const changed = code !== lastCode && lastCode !== '' ? ' ✨ NUEVO' : '';
  lastCode = code;

  console.log(`│ ${timeStr}         │ ${code}  │      ${remaining.toString().padStart(2)}      │${changed}`);
}

// Mostrar código inicial
displayCode();

// Actualizar cada 5 segundos
setInterval(displayCode, 5000);

// Mantener el proceso corriendo
console.log('');
console.log('⚠️  INSTRUCCIONES:');
console.log('   1. Abre Google Authenticator en tu dispositivo');
console.log('   2. Busca la entrada "Bull Power Admin"');
console.log('   3. Compara el código que ves con el que se muestra aquí');
console.log('   4. Si los códigos NO coinciden, hay un problema de sincronización');
console.log('   5. Presiona Ctrl+C para detener el test\n');
