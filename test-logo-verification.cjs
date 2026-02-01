#!/usr/bin/env node

console.log('='.repeat(70));
console.log('VERIFICACIÓN DE LOGO - BULL POWER ADMIN');
console.log('='.repeat(70));
console.log('');

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    checks.passed.push(`✓ ${description}`);
    console.log(`✓ ${description}`);
    console.log(`  Ruta: ${filePath}`);
    console.log(`  Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('');
    return true;
  } else {
    checks.failed.push(`✗ ${description} - NO ENCONTRADO`);
    console.log(`✗ ${description} - NO ENCONTRADO`);
    console.log(`  Ruta esperada: ${filePath}`);
    console.log('');
    return false;
  }
}

function checkLogoComponent() {
  const componentPath = path.join(__dirname, 'src/components/Logo.tsx');
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');

    console.log('Verificando configuración del componente Logo.tsx...');
    console.log('');

    if (content.includes('freepik__quiero-eliminar-el-fondo-de-la-imagen-verde-img1-y__66238.png')) {
      checks.passed.push('✓ Logo.tsx configurado con el nuevo logo para modo claro');
      console.log('✓ Logo.tsx usa el nuevo logo para modo claro');
      console.log('  Archivo: freepik__quiero-eliminar-el-fondo-de-la-imagen-verde-img1-y__66238.png');
      console.log('');
    } else {
      checks.failed.push('✗ Logo.tsx NO está configurado con el nuevo logo');
      console.log('✗ Logo.tsx NO está configurado con el nuevo logo');
      console.log('');
    }

    if (content.includes('logos/dark/bull_power_logo_transparete.png')) {
      checks.passed.push('✓ Logo.tsx mantiene el logo para modo oscuro');
      console.log('✓ Logo.tsx mantiene el logo original para modo oscuro');
      console.log('  Archivo: logos/dark/bull_power_logo_transparete.png');
      console.log('');
    } else {
      checks.warnings.push('⚠ Logo modo oscuro no configurado correctamente');
      console.log('⚠ Logo modo oscuro no configurado correctamente');
      console.log('');
    }

    const themeCheck = content.match(/theme === ['"]dark['"]/);
    if (themeCheck) {
      checks.passed.push('✓ Logo.tsx cambia según el tema (dark/light)');
      console.log('✓ Lógica de cambio de tema está implementada correctamente');
      console.log('');
    } else {
      checks.failed.push('✗ Lógica de cambio de tema no detectada');
      console.log('✗ Lógica de cambio de tema no detectada');
      console.log('');
    }

    return true;
  } else {
    checks.failed.push('✗ Componente Logo.tsx no encontrado');
    console.log('✗ Componente Logo.tsx no encontrado');
    console.log('');
    return false;
  }
}

function checkDistBuild() {
  console.log('Verificando build de producción...');
  console.log('');

  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    checks.passed.push('✓ Carpeta dist existe');
    console.log('✓ Carpeta dist/ existe');

    const logoInDist = path.join(__dirname, 'dist/freepik__quiero-eliminar-el-fondo-de-la-imagen-verde-img1-y__66238.png');
    if (fs.existsSync(logoInDist)) {
      checks.passed.push('✓ Logo nuevo está en dist/');
      console.log('✓ Logo nuevo copiado a dist/');
      const stats = fs.statSync(logoInDist);
      console.log(`  Tamaño en dist: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('');
    } else {
      checks.failed.push('✗ Logo nuevo NO está en dist/');
      console.log('✗ Logo nuevo NO está en dist/');
      console.log('  El build puede necesitar ejecutarse nuevamente');
      console.log('');
    }

    const indexHtml = path.join(__dirname, 'dist/index.html');
    if (fs.existsSync(indexHtml)) {
      checks.passed.push('✓ index.html existe en dist/');
      console.log('✓ index.html generado');
      console.log('');
    }
  } else {
    checks.failed.push('✗ Carpeta dist/ no encontrada - ejecutar build');
    console.log('✗ Carpeta dist/ no encontrada');
    console.log('  Ejecute: npm run build');
    console.log('');
  }
}

console.log('1. VERIFICACIÓN DE ARCHIVOS DE LOGO');
console.log('-'.repeat(70));
console.log('');

console.log('Nuevo logo (modo claro con fondo transparente):');
checkFile(
  'public/freepik__quiero-eliminar-el-fondo-de-la-imagen-verde-img1-y__66238.png',
  'Logo modo claro (nuevo, fondo transparente)'
);

console.log('Logo modo oscuro:');
checkFile(
  'public/logos/dark/bull_power_logo_transparete.png',
  'Logo modo oscuro (existente)'
);

console.log('2. VERIFICACIÓN DE COMPONENTE');
console.log('-'.repeat(70));
console.log('');
checkLogoComponent();

console.log('3. VERIFICACIÓN DE BUILD');
console.log('-'.repeat(70));
console.log('');
checkDistBuild();

console.log('='.repeat(70));
console.log('RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(70));
console.log('');
console.log(`Pruebas exitosas: ${checks.passed.length}`);
console.log(`Pruebas fallidas: ${checks.failed.length}`);
console.log(`Advertencias: ${checks.warnings.length}`);
console.log('');

if (checks.failed.length > 0) {
  console.log('❌ FALLOS DETECTADOS:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:');
  checks.warnings.forEach(warn => console.log(`   ${warn}`));
  console.log('');
}

if (checks.passed.length > 0) {
  console.log('✅ VERIFICACIONES EXITOSAS:');
  checks.passed.forEach(pass => console.log(`   ${pass}`));
  console.log('');
}

console.log('='.repeat(70));
console.log('INSTRUCCIONES DE USO');
console.log('='.repeat(70));
console.log('');
console.log('1. MODO CLARO:');
console.log('   - El logo negro con fondo transparente debe aparecer');
console.log('   - Ubicaciones: Login y Sidebar del Admin Panel');
console.log('');
console.log('2. MODO OSCURO:');
console.log('   - El logo original (blanco/turquesa) debe aparecer');
console.log('   - Ubicaciones: Login y Sidebar del Admin Panel');
console.log('');
console.log('3. PRUEBA MANUAL:');
console.log('   - Acceda a https://bullpowerdev.ar/login');
console.log('   - Cambie entre modo claro y oscuro usando el botón de tema');
console.log('   - Verifique que el logo cambia correctamente');
console.log('');
console.log('4. CACHE DEL NAVEGADOR:');
console.log('   - Si ve el logo viejo, presione Ctrl+Shift+R (o Cmd+Shift+R)');
console.log('   - Esto forzará la recarga sin cache');
console.log('');
console.log('='.repeat(70));

process.exit(checks.failed.length > 0 ? 1 : 0);
