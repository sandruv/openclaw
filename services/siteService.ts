import { apiRequest } from './api/clientConfig';
import { ApiResponse, PaginatedResponse } from '../types/clients';
import {
  Site,
  CreateSiteData,
  UpdateSiteData
} from '../types/clients';

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  client_id?: number;
}

export class SiteService {
  static async getSites(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Site>>> {
    // Build query params
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest<ApiResponse<PaginatedResponse<Site>>>(`/sites${queryString}`);
    return response;
  }

  static async getSite(id: number): Promise<ApiResponse<Site>> {
    const response = await apiRequest<ApiResponse<Site>>(`/sites?id=${id}`);
    return response;
  }

  static async createSite(data: CreateSiteData): Promise<ApiResponse<Site>> {
    const response = await apiRequest<ApiResponse<Site>>('/sites', {
      method: 'POST',
      data,
    });
    return response;
  }

  static async updateSite(data: UpdateSiteData): Promise<ApiResponse<Site>> {
    const response = await apiRequest<ApiResponse<Site>>('/sites', {
      method: 'PUT',
      data: data,
    });
    return response;
  }

  static async deleteSite(id: number): Promise<void> {
    await apiRequest(`/sites/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export individual methods for easier imports
export const {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
} = SiteService;
