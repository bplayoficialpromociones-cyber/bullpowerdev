import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Expenses Stats Function\n');
console.log('📊 Environment:');
console.log('   SUPABASE_URL:', SUPABASE_URL);
console.log('   ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStatsFunction() {
  try {
    console.log('1️⃣ Verificando estructura de base de datos...');

    const { data: expensesTest, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .limit(1);

    if (expensesError) {
      console.error('❌ Error al acceder a expenses:', expensesError);
      return;
    }

    console.log('✅ Tabla expenses accesible');
    if (expensesTest && expensesTest.length > 0) {
      console.log('📋 Estructura de expense:', Object.keys(expensesTest[0]));
    }

    console.log('\n2️⃣ Probando consulta con relaciones...');

    const { data: expensesWithRels, error: relsError } = await supabase
      .from('expenses')
      .select(`
        id,
        name,
        date,
        amount,
        currency_id,
        expense_type_id,
        employee_id,
        client_id,
        currencies (code, symbol),
        expense_types (name),
        employees (id, first_name, last_name),
        clients (id, name)
      `)
      .limit(3);

    if (relsError) {
      console.error('❌ Error con relaciones:', relsError);
      console.error('   Detalle:', JSON.stringify(relsError, null, 2));
    } else {
      console.log('✅ Consulta con relaciones exitosa');
      console.log('📊 Datos de ejemplo:', JSON.stringify(expensesWithRels, null, 2));
    }

    console.log('\n3️⃣ Probando edge function directamente...');

    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const startDate = lastMonth.toISOString().split('T')[0];

    console.log(`   Rango: ${startDate} a ${today}`);

    const token = localStorage?.getItem('auth_token') || SUPABASE_ANON_KEY;

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/expenses-stats?startDate=${startDate}&endDate=${today}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('   Response:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Edge function ejecutada exitosamente');
      console.log('📊 Stats:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Edge function falló');
    }

  } catch (error) {
    console.error('💥 Error en el test:', error);
  }
}

testStatsFunction();
