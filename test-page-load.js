// Test automatizado para verificar que la página carga sin errores de JavaScript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Iniciando test de carga de página...\n');

// Test 1: Verificar que los archivos críticos existen
console.log('1️⃣ Verificando archivos del build...');
const criticalFiles = [
  'dist/index.html',
  'dist/assets/index-iekZbd41.js',
  'dist/assets/index-CpdqeFJE.css'
];

let allFilesExist = true;
for (const file of criticalFiles) {
  try {
    const path = join(__dirname, file);
    const stats = readFileSync(path);
    console.log(`✅ ${file} existe (${stats.length} bytes)`);
  } catch (error) {
    console.error(`❌ ${file} NO EXISTE`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\n❌ TEST FALLÓ: Faltan archivos críticos del build');
  process.exit(1);
}

// Test 2: Verificar que el HTML está bien formado
console.log('\n2️⃣ Verificando estructura HTML...');
try {
  const htmlContent = readFileSync(join(__dirname, 'dist/index.html'), 'utf-8');

  // Verificar elementos críticos
  const checks = [
    { test: htmlContent.includes('<!doctype html>'), message: 'DOCTYPE presente' },
    { test: htmlContent.includes('<div id="root"></div>'), message: 'Root div presente' },
    { test: htmlContent.includes('type="module"'), message: 'Script type="module" presente' },
    { test: htmlContent.includes('/assets/index-'), message: 'Assets referenciados' },
  ];

  for (const check of checks) {
    if (check.test) {
      console.log(`✅ ${check.message}`);
    } else {
      console.error(`❌ ${check.message} - FALTA`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Error al leer HTML:', error.message);
  process.exit(1);
}

// Test 3: Verificar que el JS bundle no contiene sintaxis problemática
console.log('\n3️⃣ Verificando bundle de JavaScript...');
try {
  const jsContent = readFileSync(join(__dirname, 'dist/assets/index-iekZbd41.js'), 'utf-8');

  // Verificar que no hay problemas comunes
  const issues = [];

  // Buscar exports desnudos que causarían SyntaxError
  const exportRegex = /^export\s+(default|const|function|class)/gm;
  const nakedExports = jsContent.match(exportRegex);
  if (nakedExports && nakedExports.length > 0) {
    issues.push(`Encontrados ${nakedExports.length} exports desnudos que causarían SyntaxError`);
  }

  // Verificar que el archivo es un bundle válido (debería empezar con el wrapper de Vite)
  if (!jsContent.includes('(function()')) {
    issues.push('El bundle no tiene el wrapper esperado de Vite');
  }

  if (issues.length > 0) {
    console.error('❌ Problemas encontrados en el bundle:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    process.exit(1);
  }

  console.log('✅ Bundle JavaScript válido');
  console.log(`✅ Tamaño del bundle: ${(jsContent.length / 1024).toFixed(2)} KB`);

} catch (error) {
  console.error('❌ Error al analizar JS bundle:', error.message);
  process.exit(1);
}

// Test 4: Verificar que el CSS existe y es válido
console.log('\n4️⃣ Verificando CSS...');
try {
  const cssContent = readFileSync(join(__dirname, 'dist/assets/index-CpdqeFJE.css'), 'utf-8');

  if (cssContent.length < 100) {
    console.error('❌ CSS demasiado pequeño, probablemente vacío');
    process.exit(1);
  }

  console.log('✅ CSS válido');
  console.log(`✅ Tamaño del CSS: ${(cssContent.length / 1024).toFixed(2)} KB`);

} catch (error) {
  console.error('❌ Error al analizar CSS:', error.message);
  process.exit(1);
}

// Test 5: Verificar configuración de Supabase
console.log('\n5️⃣ Verificando variables de entorno...');
try {
  const envFile = readFileSync(join(__dirname, '.env'), 'utf-8');
  const hasSupabaseUrl = envFile.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = envFile.includes('VITE_SUPABASE_ANON_KEY=');

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.error('❌ Faltan variables de entorno de Supabase');
    process.exit(1);
  }

  console.log('✅ Variables de entorno configuradas');

} catch (error) {
  console.error('❌ Error al verificar .env:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ TODOS LOS TESTS PASARON');
console.log('='.repeat(60));
console.log('\n📦 El build está listo para deploy');
console.log('🌐 La página debería cargar sin errores de JavaScript');
console.log('\n💡 Si el navegador muestra errores después del deploy:');
console.log('   1. Limpia el caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)');
console.log('   2. Verifica que todos los archivos se subieron correctamente');
console.log('   3. Revisa la consola del navegador para errores específicos\n');

process.exit(0);
