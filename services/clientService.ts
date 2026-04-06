import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '../types/clients';
import {
  Client,
  CreateClientData,
  UpdateClientData
} from '../types/clients';

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
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

export class ClientService {
  static async getClients(params?: PaginationParams): Promise<PaginatedResponse<Client[]>> {
    // Build query string from pagination params
    let queryString = '';
    if (params) {
      const queryParams = [];
      if (params.page !== undefined) queryParams.push(`page=${params.page}`);
      if (params.limit !== undefined) queryParams.push(`limit=${params.limit}`);
      if (params.search !== undefined && params.search !== '') queryParams.push(`search=${encodeURIComponent(params.search)}`);
      
      if (queryParams.length > 0) {
        queryString = `?${queryParams.join('&')}`;
      }
    }
    
    const response = await apiRequest<PaginatedResponse<Client[]>>(`/clients${queryString}`);
    return response;
  }

  static async getClient(id: number): Promise<ApiResponse<Client>> {
    const response = await apiRequest<ApiResponse<Client>>(`/clients?id=${id}`);
    return response;
  }
  
  /**
   * Generate the Microsoft admin consent URL for client approval
   * @param tenantId The client's tenant ID
   * @returns The approval URL or null if configuration is missing
   */
  static async getClientApprovalUrl(tenantId: string): Promise<string | null> {
    try {
      // Call the API to get the required configuration
      const response = await apiRequest<ApiResponse<{ clientId: string, redirectUri: string }>>('/config/azure-client');
      
      if (response.success && response.data) {
        const { clientId, redirectUri } = response.data;
        return `https://login.microsoftonline.com/${tenantId}/adminconsent?client_id=${clientId}&redirect_uri=${redirectUri}`;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get client approval URL:', error);
      return null;
    }
  }

  static async createClient(data: CreateClientData): Promise<ApiResponse<Client>> {
    const response = await apiRequest<ApiResponse<Client>>('/clients', {
      method: 'POST',
      data,
    });
    return response;
  }

  static async updateClient(data: UpdateClientData): Promise<ApiResponse<Client>> {
    const response = await apiRequest<ApiResponse<Client>>(`/clients`, {
      method: 'PUT',
      data,
    });
    return response;
  }

  static async deleteClient(id: number): Promise<ApiResponse<void>> {
    const response = await apiRequest<ApiResponse<void>>(`/clients/${id}`, {
      method: 'DELETE',
    });
    return response;
  }
}

// Export individual methods for easier imports
export const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientApprovalUrl,
} = ClientService;