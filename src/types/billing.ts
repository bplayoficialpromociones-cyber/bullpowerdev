import { Client } from './crm';

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  prefix: string;
  created_at: string;
}

export interface InvoiceStatus {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: number;
  client_id: string;
  invoice_date: string;
  status_id: string;
  invoice_file_url?: string;
  amount: number;
  currency_id: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  client?: Client;
  status?: InvoiceStatus;
  currency?: Currency;
  items?: InvoiceItem[];
}
