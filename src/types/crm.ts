export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface State {
  id: string;
  country_id: string;
  name: string;
  created_at: string;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  floor?: number;
  apartment?: string;
  neighborhood?: string;
  postal_code: string;
  country_id: string;
  state_id: string;
  google_maps_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  country?: Country;
  state?: State;
}

export interface ClientType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  client_type_id: string;
  address_id?: string;
  cuit_condicion_legal?: string;
  anniversary_date?: string;
  website_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  twitch_url?: string;
  kick_url?: string;
  twitter_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  client_type?: ClientType;
  address?: Address;
}

export interface Position {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface EmployeePosition {
  id: string;
  employee_id: string;
  position_id: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  created_at: string;
  position?: Position;
}

export interface Employee {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  birth_date?: string;
  address_id?: string;
  telegram?: string;
  skype?: string;
  discord?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  client?: {
    id: string;
    name: string;
    client_type?: ClientType;
  };
  address?: Address;
  positions?: EmployeePosition[];
}
