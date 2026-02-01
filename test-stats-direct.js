import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Expenses Stats\n');
console.log('📊 SUPABASE_URL:', SUPABASE_URL);
console.log('📊 ANON_KEY:', SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testQuery() {
  try {
    console.log('1️⃣ Testing basic query...');
    const { data: basicData, error: basicError } = await supabase
      .from('expenses')
      .select('id, name, date, amount')
      .limit(3);

    if (basicError) {
      console.error('❌ Basic query error:', basicError);
      return;
    }
    console.log('✅ Basic query successful');
    console.log('   Records found:', basicData?.length || 0);

    console.log('\n2️⃣ Testing query with joins...');
    const { data: joinData, error: joinError } = await supabase
      .from('expenses')
      .select(`
        id,
        name,
        date,
        amount,
        expenses_currencies (code, symbol),
        expenses_types (name),
        crm_employees (id, first_name, last_name),
        crm_clients (id, name)
      `)
      .limit(3);

    if (joinError) {
      console.error('❌ Join query error:', joinError);
      console.error('   Details:', JSON.stringify(joinError, null, 2));
      return;
    }
    console.log('✅ Join query successful');
    console.log('   Sample data:', JSON.stringify(joinData, null, 2));

    console.log('\n3️⃣ Testing edge function...');
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const startDate = lastMonth.toISOString().split('T')[0];

    console.log(`   Date range: ${startDate} to ${today}`);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/expenses-stats?startDate=${startDate}&endDate=${today}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   Response status:', response.status);

    const responseText = await response.text();
    console.log('   Response body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Edge function successful');
      console.log('📊 Stats summary:');
      console.log('   - Total Income:', data.stats?.totalIncome || 0);
      console.log('   - Total Expense:', data.stats?.totalExpense || 0);
      console.log('   - Total Records:', data.stats?.totalRecords || 0);
    } else {
      console.error('❌ Edge function failed');
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
    console.error(error);
  }
}

testQuery();
