#!/usr/bin/env node

/**
 * TEST DIRECTO DE OTPLIB
 */

import otplib from 'otplib';
const { authenticator } = otplib;

const SECRET = 'OUMFI7SHIQDS2QCF';

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║         TEST DIRECTO DE OTPLIB CON SECRET ACTUAL     ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log(`Secret: ${SECRET}`);
console.log(`Longitud: ${SECRET.length} caracteres\n`);

// Configurar otplib
authenticator.options = { window: 2 };

try {
  // Generar código
  const code = authenticator.generate(SECRET);
  console.log(`✅ Código generado: ${code}\n`);

  // Verificar el código inmediatamente
  const isValid = authenticator.verify({
    token: code,
    secret: SECRET
  });

  console.log(`✅ Verificación inmediata: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}\n`);

  // Generar varios códigos para ventanas de tiempo
  console.log('Códigos para diferentes ventanas de tiempo:\n');

  const now = Math.floor(Date.now() / 1000);
  const currentPeriod = Math.floor(now / 30);

  for (let i = -2; i <= 2; i++) {
    const testTime = (currentPeriod + i) * 30;
    const testCode = authenticator.generate(SECRET);
    console.log(`   Offset ${i >= 0 ? '+' : ''}${i}: ${testCode}${i === 0 ? ' ← ACTUAL' : ''}`);
  }

  console.log('\n');

} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error(error.stack);
}
