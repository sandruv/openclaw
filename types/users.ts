export interface Role {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
}

export interface Sophistication {
  id: number;
  name: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  role: Role;
  client: Client;
  sophistication: Sophistication;
  is_user_vip?: boolean;
}

export interface UsersPagination {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}
