// Test script para verificar la conexión con la Edge Function de login

const SUPABASE_URL = 'https://swthujpuwmqjxvlvwawe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dGh1anB1d21xanh2bHZ3YXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Nzk4ODMsImV4cCI6MjA4NDA1NTg4M30.A3UAVADHJS-PubjAGKJn6kBg03lwkbxwyD1uFx7lZVk';

async function testLogin() {
  console.log('Testing login connection...');
  console.log('URL:', `${SUPABASE_URL}/functions/v1/auth-login`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: 'superadmin@bullpower.com',
        password: 'SuperAdmin2026!'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✓ Login successful!');
      console.log('User:', data.user);
    } else {
      console.log('✗ Login failed:', data.error);
    }
  } catch (error) {
    console.error('✗ Connection error:', error.message);
    console.error('Full error:', error);
  }
}

testLogin();
