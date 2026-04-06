import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '../types/clients';
import {
  User,
  CreateUserData,
  UpdateUserData
} from '../types/clients';

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  client_id?: number;
  role_id?: number;
}

interface PaginatedResponse<T> {
  data: {
    list: T;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
  status: number;
}

export class UserService {
  static async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User[]>> {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
    if (params?.role_id) queryParams.append('role_id', params.role_id.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await apiRequest<PaginatedResponse<User[]>>(`/users${queryString}`);
    return response;
  }

  static async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await apiRequest<ApiResponse<User>>(`/users?id=${id}`);
    return response;
  }

  static async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    // Transform the data to match database requirements
    const response = await apiRequest<ApiResponse<User>>('/users', {
      method: 'POST',
      data,
    });

    return response;
  }

  static async updateUser(data: UpdateUserData): Promise<ApiResponse<User>> {
    const response = await apiRequest<ApiResponse<User>>(`/users`, {
      method: 'PUT',
      data,
    });

    return response;
  }

  static async deleteUser(id: number): Promise<void> {
    await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  static async validateEmail(email: string): Promise<{
    exists: boolean;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      client?: {
        id: number;
        name: string;
      };
    } | null;
  }> {
    const response = await apiRequest<{
      data: {
        exists: boolean;
        user: {
          id: number;
          email: string;
          first_name: string;
          last_name: string;
          client?: {
            id: number;
            name: string;
          };
        } | null;
      };
      message: string;
      status: number;
    }>('/users/validate-email', {
      method: 'POST',
      data: { email: email.trim() },
    });

    return response.data;
  }
}

// Export individual methods for easier imports
export const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  validateEmail,
} = UserService;
