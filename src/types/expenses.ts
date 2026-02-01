export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  prefix: string;
  created_at: string;
}

export interface ExpenseType {
  id: string;
  name: string;
  created_at: string;
}

export interface Expense {
  id: string;
  name: string;
  date: string;
  amount: number;
  description?: string;
  currency_id: string;
  expense_type_id: string;
  employee_id: string;
  client_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  invoice_url?: string;
  invoice_filename?: string;
  currency?: Currency;
  expense_type?: ExpenseType;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    client?: {
      id: string;
      name: string;
    };
  };
  client?: {
    id: string;
    name: string;
    client_type?: {
      id: string;
      name: string;
    };
  };
}
