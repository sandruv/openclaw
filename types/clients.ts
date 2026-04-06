export interface Client {
  id: number;
  name: string;
  internal_name?: string;
  internal_code?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  phone_number?: string;
  address?: string;
  is_client_vip?: boolean;
  status?: status;
  status_id?: number;
  active?: boolean;
  shortName?: string;
  owner?: string;
  poc?: string;
  type?: string;
  serviceType?: string;
  description?: string;
  alertMessage?: string;
  parentOrg?: string;
  logo?: any[];
}

export interface status {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  client_id: number;
  client?: Client;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'inactive';
}

export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Sophistication {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  client_id: any;
  client: Client;
  created_at: string;
  updated_at: string;
  role_id: number;
  role: Role;
  company?: string;
  is_user_vip: boolean;
  status?: 'active' | 'inactive';
  sophistication_id?: number;
  sophistication?: any;
  password?: string
  job_title?: string  
}

export type CreateClientData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type UpdateClientData = Partial<CreateClientData>;
export type CreateSiteData = Omit<Site, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSiteData = Partial<CreateSiteData>;
export type CreateUserData = Omit<User, 
'id' | 'created_at' | 'updated_at' | 'role' | 'client'>;
export type UpdateUserData = Partial<CreateUserData>;

export interface ApiResponse<T> {
  data: T extends any[] ? T : T;
  message?: string;
  status?: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// TEMP Client Schema below
import { z } from "zod"
import { TaskStatusType } from '@/lib/taskStatusIdProvider'

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  is_client_vip: z.boolean().default(false),
  shortName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  owner: z.string().optional().default(""),
  poc: z.string().optional().default(""),
  type: z.string().optional().default("Client"),
  serviceType: z.string().optional().default("MSP"),
  description: z.string().optional().default(""),
  alertMessage: z.string().optional().default(""),
  parentOrg: z.string().optional().default(""),
  logo: z.array(z.instanceof(File)).optional().default([]),
  status_id: z.number().optional().default(TaskStatusType.New),
})

export type ClientFormData = z.infer<typeof clientSchema>

export type ClientFormState = Omit<ClientFormData, 'logo'> & {
  logo: File[]
}

export const siteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().min(1, "Address is required"),
  phone_number: z.string().optional(),
  client_id: z.number().min(1, "Client is required"),
  status: z.enum(["active", "inactive"]).optional(),
})

export type SiteFormData = z.infer<typeof siteSchema>
