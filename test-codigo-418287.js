#!/usr/bin/env node

/**
 * TEST CON CÓDIGO REAL DEL USUARIO - 418287
 */

import * as crypto from 'crypto';

const USER_SECRET = 'VPLJFXKJBDH3EXHIWLQ334LNW5QFH7LX'; // Secret ACTUAL de la BD
const USER_CODE = '418287'; // Código que el usuario intentó

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

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║      VERIFICACIÓN CÓDIGO 418287 - SECRET ACTUAL      ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

const now = Math.floor(Date.now() / 1000);
const currentPeriod = Math.floor(now / 30);

console.log('📊 DATOS:');
console.log(`   Usuario: maxi2025new@gmail.com`);
console.log(`   Secret (BD): ${USER_SECRET}`);
console.log(`   Código: ${USER_CODE}`);
console.log(`   Tiempo: ${now}`);
console.log(`   Período: ${currentPeriod}\n`);

console.log('🔍 BÚSQUEDA EN VENTANA EXTENDIDA (±30 minutos):\n');

let found = false;
let foundAt = null;

for (let minutesOffset = -30; minutesOffset <= 30; minutesOffset++) {
  const testTime = now + (minutesOffset * 60);
  const testCode = generateTOTP(USER_SECRET, testTime);

  if (testCode === USER_CODE) {
    found = true;
    foundAt = minutesOffset;
    console.log(`✅ ¡CÓDIGO ENCONTRADO!`);
    console.log(`   Offset: ${minutesOffset} minutos ${minutesOffset < 0 ? 'PASADO' : minutesOffset > 0 ? 'FUTURO' : 'ACTUAL'}`);
    console.log(`   Tiempo: ${testTime}`);
    console.log(`   Código: ${testCode}\n`);
    break;
  }
}

if (!found) {
  console.log('❌ CÓDIGO NO ENCONTRADO en ±30 minutos\n');
  console.log('🚨 PROBLEMA CRÍTICO:');
  console.log('   El secret en Google Authenticator NO coincide con la BD\n');
} else {
  const absOffset = Math.abs(foundAt);

  if (absOffset <= 2) {
    console.log('✅ Código válido - dentro de ventana aceptable');
  } else {
    console.log(`⚠️  Desfase de ${absOffset} minutos - fuera de ventana estándar`);
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log('📋 CÓDIGOS EN VENTANA ACTUAL (window=2):\n');

for (let i = -2; i <= 2; i++) {
  const testPeriod = currentPeriod + i;
  const testTime = testPeriod * 30;
  const testCode = generateTOTP(USER_SECRET, testTime);
  const match = testCode === USER_CODE ? ' ← MATCH!' : (i === 0 ? ' ← actual' : '');

  console.log(`   ${i >= 0 ? '+' : ''}${i}: ${testCode}${match}`);
}

console.log('\n');
