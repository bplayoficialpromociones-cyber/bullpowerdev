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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la operación');
  }

  return data;
}

export const expensesService = {
  list: (page = 1, limit = 15, search = '') =>
    fetchAPI(`expenses-list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  create: (data: any) => fetchAPI('expenses-create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => fetchAPI('expenses-update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`expenses-delete?id=${id}`, { method: 'DELETE' }),
  deleteMultiple: (ids: string[]) => fetchAPI('expenses-delete-multiple', { method: 'POST', body: JSON.stringify({ ids }) }),
};

export const currenciesService = {
  list: (page = 1, limit = 15, search = '') =>
    fetchAPI(`currencies-list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  create: (data: any) => fetchAPI('currencies-create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => fetchAPI('currencies-update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`currencies-delete?id=${id}`, { method: 'DELETE' }),
  deleteMultiple: (ids: string[]) => fetchAPI('currencies-delete-multiple', { method: 'POST', body: JSON.stringify({ ids }) }),
};

export const expenseTypesService = {
  list: () => fetchAPI('expenses-types-list'),
};

export const expensesServiceExports = {
  getCurrencies: () => currenciesService.list(1, 999).then(data => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.currencies)) return data.currencies;
    return [];
  }),
  getExpenses: (page = 1, limit = 15, search = '') => expensesService.list(page, limit, search).then(data => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.expenses)) return data.expenses;
    return [];
  }),
  getExpenseTypes: () => expenseTypesService.list().then(data => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.types)) return data.types;
    return [];
  }),
};
