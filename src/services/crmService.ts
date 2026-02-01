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

export const clientsService = {
  list: () => fetchAPI('crm-clients-list'),
  get: (id: string) => fetchAPI(`crm-clients-get?id=${id}`),
  create: (data: any) => fetchAPI('crm-clients-create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => fetchAPI('crm-clients-update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`crm-clients-delete?id=${id}`, { method: 'DELETE' }),
};

export const employeesService = {
  list: () => fetchAPI('crm-employees-list'),
  create: (data: any) => fetchAPI('crm-employees-create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => fetchAPI('crm-employees-update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`crm-employees-delete?id=${id}`, { method: 'DELETE' }),
};

export const addressesService = {
  list: () => fetchAPI('crm-addresses-list'),
  create: (data: any) => fetchAPI('crm-addresses-create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => fetchAPI('crm-addresses-update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`crm-addresses-delete?id=${id}`, { method: 'DELETE' }),
};

export const positionsService = {
  list: () => fetchAPI('crm-positions-list'),
  create: (data: any) => fetchAPI('crm-positions-create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => fetchAPI('crm-positions-update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`crm-positions-delete?id=${id}`, { method: 'DELETE' }),
};

export const geoService = {
  getData: (countryId?: string) => fetchAPI(`crm-geo-data${countryId ? `?country_id=${countryId}` : ''}`),
};

export const crmService = {
  getClients: () => clientsService.list().then(data => Array.isArray(data) ? data : (data.clients || [])),
  getEmployees: () => employeesService.list().then(data => Array.isArray(data) ? data : (data.employees || [])),
  getPositions: () => positionsService.list().then(data => Array.isArray(data) ? data : (data.positions || [])),
  getGeoData: (countryId?: string) => geoService.getData(countryId),
};
