export interface User {
  id: number;
  avatar?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  client_id: number;
  sophistication_id: number;
  is_user_vip: boolean;
  role_id: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  token: string;
  id: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginData {
  session: Session;
  userdata: User;
}

export interface AuthResponse {
  data?: LoginData;
  message: string;
  status: number;
}

export interface AuthRequest {
  loginCredentials: LoginCredentials;
}

export interface AuthError {
  error: string;
  message: string;
}

export interface AuthSuccess {
  authResponse: AuthResponse;
}