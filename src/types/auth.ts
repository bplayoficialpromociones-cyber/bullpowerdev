export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  module: string;
  description: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role_id?: string;
  role?: Role;
  permissions?: Permission[];
  two_factor_enabled: boolean;
  last_login_at?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser & { role: Role; permissions: Permission[] };
  requires_2fa?: boolean;
  temp_token?: string;
  error?: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  secret?: string;
  qr_code_url?: string;
  error?: string;
}
