#!/usr/bin/env node

/**
 * TEST PROFUNDO DE VALIDACIÓN 2FA
 *
 * Este test realiza un análisis exhaustivo del problema de validación 2FA:
 * 1. Valida el formato del secret Base32
 * 2. Genera códigos TOTP con múltiples implementaciones
 * 3. Compara resultados con diferentes algoritmos
 * 4. Verifica sincronización de tiempo
 * 5. Prueba el código real del usuario
 */

import * as crypto from 'crypto';

const TEST_EMAIL = 'maxi2025new@gmail.com';
const USER_CODE = '274561'; // Código que el usuario intentó usar
const USER_SECRET = 'CRUA5D25J4L32X7A55QKEARRSXGHNP6S'; // Secret de la BD

// ==================== IMPLEMENTACIÓN 1: Usando crypto nativo ====================

function base32DecodeNative(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const output = [];
  let bits = 0;
  let value = 0;

  // Remover espacios y convertir a mayúsculas
  input = input.replace(/\s/g, '').toUpperCase();

  // Remover padding
  input = input.replace(/=+$/, '');

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const idx = alphabet.indexOf(char);

    if (idx === -1) {
      console.error(`❌ Carácter inválido en Base32: '${char}' (posición ${i})`);
      throw new Error(`Carácter inválido en Base32: ${char}`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function generateTOTPNative(secret, time = null) {
  // Usar tiempo actual si no se proporciona
  if (time === null) {
    time = Math.floor(Date.now() / 1000);
  }

  // Calcular el counter (30 segundos por período)
  const counter = Math.floor(time / 30);

  // Decodificar el secret de Base32
  const key = base32DecodeNative(secret);

  // Crear el counter como buffer de 8 bytes (big-endian)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  // Calcular HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1] & 0xf;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

// ==================== IMPLEMENTACIÓN 2: Copia exacta del Edge Function ====================

function base32DecodeEdge(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const output = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < input.length; i++) {
    const idx = alphabet.indexOf(input[i].toUpperCase());
    if (idx === -1) continue; // El edge function hace continue, no throw

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function sha1(data) {
  return crypto.createHash('sha1').update(data).digest();
}

function generateTOTPEdge(secret, time) {
  const key = base32DecodeEdge(secret);
  const epoch = Math.floor(time);
  const timeHex = epoch.toString(16).padStart(16, '0');
  const timeBytes = Buffer.alloc(8);

  for (let i = 0; i < 8; i++) {
    timeBytes[i] = parseInt(timeHex.substring(i * 2, i * 2 + 2), 16);
  }

  // HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBytes);
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

function verifyTOTPEdge(secret, token, currentTime) {
  const window = 1;
  const time = Math.floor(currentTime / 30);

  for (let i = -window; i <= window; i++) {
    const testTime = time + i;
    const testToken = generateTOTPEdge(secret, testTime);
    if (testToken === token) {
      return { valid: true, offset: i, time: testTime };
    }
  }

  return { valid: false };
}

// ==================== ANÁLISIS ====================

async function runDeepAnalysis() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     TEST PROFUNDO DE VALIDACIÓN 2FA - ANÁLISIS COMPLETO   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('📊 PASO 1: Datos del usuario (desde BD)\n');

    console.log('✅ Usuario:');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   2FA Habilitado: true`);
    console.log(`   Secret: ${USER_SECRET}`);
    console.log(`   Secret Length: ${USER_SECRET.length} caracteres\n`);

    const secret = USER_SECRET;

    // ==================== VALIDAR BASE32 ====================

    console.log('🔍 PASO 2: Validar formato Base32 del secret\n');

    const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let isValidBase32 = true;
    const invalidChars = [];

    for (let i = 0; i < secret.length; i++) {
      const char = secret[i];
      if (!base32Alphabet.includes(char.toUpperCase())) {
        isValidBase32 = false;
        invalidChars.push({ char, position: i });
      }
    }

    if (isValidBase32) {
      console.log('✅ Secret tiene formato Base32 válido');
    } else {
      console.log('❌ Secret tiene caracteres inválidos:', invalidChars);
      return;
    }

    // Decodificar Base32
    try {
      const decoded = base32DecodeNative(secret);
      console.log(`✅ Secret decodificado exitosamente: ${decoded.length} bytes\n`);
    } catch (err) {
      console.log(`❌ Error al decodificar Base32: ${err.message}\n`);
      return;
    }

    // ==================== GENERAR CÓDIGOS PARA VENTANAS DE TIEMPO ====================

    console.log('⏰ PASO 3: Generar códigos TOTP para múltiples ventanas de tiempo\n');

    const now = Math.floor(Date.now() / 1000);
    const currentPeriod = Math.floor(now / 30);

    console.log(`Tiempo actual (Unix): ${now}`);
    console.log(`Período actual: ${currentPeriod}`);
    console.log(`Tiempo en período: ${now % 30} segundos\n`);

    console.log('Códigos generados (Implementación Nativa con crypto):');
    console.log('┌────────┬──────────┬────────────┬────────┐');
    console.log('│ Offset │  Período │    Tiempo  │ Código │');
    console.log('├────────┼──────────┼────────────┼────────┤');

    const codes = [];
    for (let i = -5; i <= 5; i++) {
      const timePeriod = currentPeriod + i;
      const timeSeconds = timePeriod * 30;
      const code = generateTOTPNative(secret, timeSeconds);
      codes.push({ offset: i, period: timePeriod, time: timeSeconds, code });

      const marker = code === USER_CODE ? ' ← MATCH!' : '';
      const offsetStr = (i >= 0 ? '+' : '') + i;
      console.log(`│  ${offsetStr.padStart(4)}  │ ${timePeriod.toString().padStart(8)} │ ${timeSeconds.toString().padStart(10)} │ ${code} ${marker}│`);
    }
    console.log('└────────┴──────────┴────────────┴────────┘\n');

    // ==================== COMPARAR IMPLEMENTACIONES ====================

    console.log('🔬 PASO 4: Comparar implementaciones (Nativa vs Edge Function)\n');

    console.log('Comparación para período actual:');
    const codeNative = generateTOTPNative(secret, now);
    const codeEdge = generateTOTPEdge(secret, currentPeriod);

    console.log(`   Implementación Nativa: ${codeNative}`);
    console.log(`   Implementación Edge:   ${codeEdge}`);
    console.log(`   ¿Coinciden?: ${codeNative === codeEdge ? '✅ SÍ' : '❌ NO'}\n`);

    // ==================== VERIFICAR CÓDIGO DEL USUARIO ====================

    console.log('🎯 PASO 5: Verificar el código ingresado por el usuario\n');

    console.log(`Código ingresado: ${USER_CODE}\n`);

    // Buscar en todas las ventanas generadas
    const match = codes.find(c => c.code === USER_CODE);

    if (match) {
      console.log(`✅ CÓDIGO ENCONTRADO en offset ${match.offset}!`);
      console.log(`   Período: ${match.period}`);
      console.log(`   Tiempo Unix: ${match.time}`);

      const diffMinutes = Math.abs(now - match.time) / 60;
      console.log(`   Diferencia de tiempo: ${diffMinutes.toFixed(1)} minutos`);

      if (Math.abs(match.offset) <= 1) {
        console.log(`   ✅ Dentro de la ventana válida (±1 período)`);
      } else {
        console.log(`   ⚠️  FUERA de la ventana válida (±1 período)`);
        console.log(`   Esto indica un problema de sincronización de tiempo`);
      }
    } else {
      console.log(`❌ CÓDIGO NO ENCONTRADO en ninguna ventana cercana`);
      console.log(`   El código ${USER_CODE} no es válido para este secret en ningún período cercano`);
    }

    console.log('');

    // ==================== PRUEBA CON EDGE FUNCTION ====================

    console.log('🧪 PASO 6: Probar con la lógica exacta del Edge Function\n');

    const edgeResult = verifyTOTPEdge(secret, USER_CODE, now);

    if (edgeResult.valid) {
      console.log(`✅ Edge Function VALIDARÍA el código`);
      console.log(`   Offset: ${edgeResult.offset}`);
      console.log(`   Time: ${edgeResult.time}`);
    } else {
      console.log(`❌ Edge Function NO VALIDA el código`);
    }

    console.log('');

    // ==================== ANÁLISIS DE SINCRONIZACIÓN ====================

    console.log('🕐 PASO 7: Análisis de sincronización de tiempo\n');

    // Generar códigos para una ventana más amplia
    console.log('Búsqueda extendida (±10 minutos):');
    let foundInExtended = false;

    for (let minutesOffset = -10; minutesOffset <= 10; minutesOffset++) {
      const testTime = now + (minutesOffset * 60);
      const testCode = generateTOTPNative(secret, testTime);

      if (testCode === USER_CODE) {
        foundInExtended = true;
        console.log(`\n🎯 CÓDIGO ENCONTRADO con offset de ${minutesOffset} minutos!`);
        console.log(`   Esto sugiere un problema de sincronización de tiempo`);

        if (minutesOffset < 0) {
          console.log(`   El código es válido ${Math.abs(minutesOffset)} minutos en el PASADO`);
        } else {
          console.log(`   El código es válido ${minutesOffset} minutos en el FUTURO`);
        }
        break;
      }
    }

    if (!foundInExtended) {
      console.log('❌ Código no encontrado ni siquiera en ventana extendida de ±10 minutos');
    }

    console.log('');

    // ==================== GENERAR URL OTPAUTH ====================

    console.log('📱 PASO 8: Verificar URL otpauth\n');

    const issuer = 'Bull Power Admin';
    const accountName = TEST_EMAIL;
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    console.log('URL otpauth generada:');
    console.log(otpauthUrl);
    console.log('');

    // ==================== CONCLUSIONES ====================

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 CONCLUSIONES Y DIAGNÓSTICO');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (match && Math.abs(match.offset) <= 1) {
      console.log('✅ El código ES VÁLIDO en la ventana de tiempo correcta');
      console.log('🔍 El problema NO está en el algoritmo TOTP');
      console.log('');
      console.log('Posibles causas del error:');
      console.log('1. El frontend no está enviando el código correctamente');
      console.log('2. El backend no está recibiendo el código correctamente');
      console.log('3. Hay una transformación del código en el camino (trim, espacios, etc)');
      console.log('4. El secret en la BD no coincide con el que tiene Google Authenticator');
    } else if (foundInExtended) {
      console.log('⚠️  El código ES VÁLIDO pero con un desplazamiento de tiempo');
      console.log('🔍 PROBLEMA: Sincronización de tiempo incorrecta');
      console.log('');
      console.log('Soluciones:');
      console.log('1. Aumentar la ventana de tiempo en verifyTOTP (de 1 a 2-3)');
      console.log('2. Verificar la hora del servidor');
      console.log('3. Verificar la hora del dispositivo del usuario');
    } else {
      console.log('❌ El código NO ES VÁLIDO en ninguna ventana de tiempo');
      console.log('🔍 PROBLEMA CRÍTICO: El secret no coincide');
      console.log('');
      console.log('Causas posibles:');
      console.log('1. El usuario escaneó un QR diferente');
      console.log('2. El secret en la BD fue modificado después de escanear');
      console.log('3. El usuario tiene configurado otro secret en Google Authenticator');
      console.log('4. Error en la codificación/decodificación del secret');
      console.log('');
      console.log('🛠️  SOLUCIÓN RECOMENDADA:');
      console.log('   1. Desactivar y reactivar 2FA para el usuario');
      console.log('   2. Asegurarse de que el usuario escanea el QR inmediatamente');
      console.log('   3. Verificar el código antes de cerrar el modal de configuración');
    }

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL ANÁLISIS:', error);
    console.error(error.stack);
  }
}

// Ejecutar análisis
runDeepAnalysis().catch(console.error);
