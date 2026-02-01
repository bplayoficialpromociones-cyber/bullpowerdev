import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  console.error(`URL: ${supabaseUrl ? 'OK' : 'MISSING'}`);
  console.error(`KEY: ${supabaseAnonKey ? 'OK' : 'MISSING'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInvoiceUpdate() {
  console.log('\n=== Test: Actualización de Factura ===\n');

  try {
    // 1. Obtener una factura existente
    console.log('1. Obteniendo factura existente...');
    const { data: invoices, error: fetchError } = await supabase
      .from('billing_invoices')
      .select(`
        *,
        items:billing_invoice_items(*),
        client:crm_clients(name),
        currency:expenses_currencies(code, symbol)
      `)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!invoices || invoices.length === 0) {
      console.log('❌ No hay facturas para probar');
      return;
    }

    const invoice = invoices[0];
    console.log(`✅ Factura encontrada: #${invoice.invoice_number}`);
    console.log(`   Cliente: ${invoice.client?.name}`);
    console.log(`   Moneda actual: ${invoice.currency?.code}`);
    console.log(`   Items actuales: ${invoice.items?.length || 0}`);
    console.log(`   Monto: ${invoice.currency?.symbol} ${invoice.amount}`);

    // 2. Obtener otra moneda diferente
    console.log('\n2. Obteniendo otra moneda...');
    const { data: currencies, error: currError } = await supabase
      .from('expenses_currencies')
      .select('*')
      .neq('id', invoice.currency_id)
      .limit(1);

    if (currError) throw currError;
    if (!currencies || currencies.length === 0) {
      console.log('❌ No hay otra moneda disponible para probar');
      return;
    }

    const newCurrency = currencies[0];
    console.log(`✅ Nueva moneda seleccionada: ${newCurrency.code} (${newCurrency.symbol})`);

    // 3. Actualizar solo la moneda (sin tocar los items)
    console.log('\n3. Actualizando solo la moneda...');
    const updateResponse = await fetch(`${supabaseUrl}/functions/v1/billing-invoices-update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: invoice.id,
        invoice: {
          currency_id: newCurrency.id,
        },
        items: invoice.items || []
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.error || 'Error al actualizar');
    }

    const updatedInvoice = await updateResponse.json();
    console.log('✅ Factura actualizada correctamente');

    // 4. Verificar que los items no se eliminaron
    console.log('\n4. Verificando items después de actualización...');
    const { data: verifyInvoice, error: verifyError } = await supabase
      .from('billing_invoices')
      .select(`
        *,
        items:billing_invoice_items(*),
        currency:expenses_currencies(code, symbol)
      `)
      .eq('id', invoice.id)
      .single();

    if (verifyError) throw verifyError;

    console.log(`   Moneda nueva: ${verifyInvoice.currency?.code}`);
    console.log(`   Items después: ${verifyInvoice.items?.length || 0}`);
    console.log(`   Monto: ${verifyInvoice.currency?.symbol} ${verifyInvoice.amount}`);

    if ((verifyInvoice.items?.length || 0) === (invoice.items?.length || 0)) {
      console.log('✅ Los items se mantuvieron correctamente');
    } else {
      console.log('❌ ERROR: Los items se eliminaron!');
      console.log(`   Items antes: ${invoice.items?.length || 0}`);
      console.log(`   Items después: ${verifyInvoice.items?.length || 0}`);
    }

    // 5. Verificar acceso público al bucket
    console.log('\n5. Verificando acceso público al bucket invoices-pdf...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) throw bucketError;

    const invoiceBucket = buckets.find(b => b.name === 'invoices-pdf');
    if (invoiceBucket) {
      console.log(`✅ Bucket encontrado: ${invoiceBucket.name}`);
      console.log(`   Público: ${invoiceBucket.public ? 'Sí' : 'No'}`);
    } else {
      console.log('❌ Bucket invoices-pdf no encontrado');
    }

    // 6. Verificar PDFs existentes
    console.log('\n6. Verificando PDFs almacenados...');
    const { data: files, error: filesError } = await supabase
      .storage
      .from('invoices-pdf')
      .list();

    if (filesError) throw filesError;

    console.log(`✅ Archivos en bucket: ${files?.length || 0}`);
    if (files && files.length > 0) {
      const firstFile = files[0];
      const { data: publicUrlData } = supabase.storage
        .from('invoices-pdf')
        .getPublicUrl(firstFile.name);

      console.log(`   Ejemplo de URL pública: ${publicUrlData.publicUrl}`);
    }

    console.log('\n=== ✅ Test completado exitosamente ===\n');

  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    console.error(error);
  }
}

testInvoiceUpdate();
