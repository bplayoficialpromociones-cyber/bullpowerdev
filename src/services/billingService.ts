import { supabase } from '../lib/supabase';
import type { Invoice, InvoiceStatus, InvoiceItem } from '../types/billing';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la operación' }));
    throw new Error(error.error || error.message || 'Error en la operación');
  }

  return response.json();
}

export const billingService = {
  async getInvoices(): Promise<Invoice[]> {
    return fetchAPI('billing-invoices-list');
  },

  async getInvoice(id: string): Promise<Invoice> {
    return fetchAPI(`billing-invoices-get?id=${id}`);
  },

  async createInvoice(data: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
    return fetchAPI('billing-invoices-create', {
      method: 'POST',
      body: JSON.stringify({ invoice: data, items }),
    });
  },

  async updateInvoice(id: string, data: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
    return fetchAPI('billing-invoices-update', {
      method: 'PUT',
      body: JSON.stringify({ id, invoice: data, items }),
    });
  },

  async deleteInvoice(id: string): Promise<void> {
    return fetchAPI('billing-invoices-delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  async getInvoiceStatuses(): Promise<InvoiceStatus[]> {
    const { data, error } = await supabase
      .from('billing_invoice_statuses')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async uploadInvoicePDF(file: File, invoiceId: string): Promise<string> {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceId', invoiceId);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/billing-invoice-upload-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al subir el archivo PDF' }));
      throw new Error(error.error || 'Error al subir el archivo PDF');
    }

    const data = await response.json();
    return data.url;
  },

  async deleteInvoicePDF(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/billing-invoice-delete-pdf?fileName=${fileName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al eliminar el archivo PDF' }));
      throw new Error(error.error || 'Error al eliminar el archivo PDF');
    }
  },
};
