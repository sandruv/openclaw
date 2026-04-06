import { apiRequest } from '@/services/api/clientConfig';
import { ApiResponse } from '@/types/api';
import { patchUpdateHelpers } from '@/constants/colors';

export interface PatchUpdate {
  id: number;
  title: string;
  content: string;
  version?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  user_reads?: {
    id: number;
    user_id: number;
    read_at: string;
  }[];
  isRead?: boolean;
}

export interface CreatePatchUpdateData {
  title: string;
  content: string;
  version?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  published?: boolean;
}

export interface UpdatePatchUpdateData {
  title?: string;
  content?: string;
  version?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  published?: boolean;
}

export interface PatchUpdateListParams {
  page?: number;
  limit?: number;
  priority?: string;
  unreadOnly?: boolean;
}

export interface PatchUpdateListResponse {
  patchUpdates: PatchUpdate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadPatchUpdatesResponse {
  unreadUpdates: PatchUpdate[];
  count: number;
}

export interface MarkReadResponse {
  id: number;
  user_id: number;
  patch_update_id: number;
  read_at: string;
}

export interface BulkMarkReadResponse {
  markedCount: number;
  targetIds: number[];
}

export const patchUpdateService = {
  // Get all patch updates with pagination and filters
  async getAllPatchUpdates(params: PatchUpdateListParams = {}): Promise<ApiResponse<PatchUpdateListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.unreadOnly) searchParams.set('unreadOnly', 'true');

    const queryString = searchParams.toString();
    const url = queryString ? `/patch-updates?${queryString}` : '/patch-updates';
    
    const response = await apiRequest<ApiResponse<PatchUpdateListResponse>>(url);
    return response;
  },

  // Get specific patch update by ID
  async getPatchUpdateById(id: number): Promise<ApiResponse<PatchUpdate>> {
    const response = await apiRequest<ApiResponse<PatchUpdate>>(`/patch-updates/${id}`);
    return response;
  },

  // Create new patch update (admin only)
  async createPatchUpdate(data: CreatePatchUpdateData): Promise<ApiResponse<PatchUpdate>> {
    const response = await apiRequest<ApiResponse<PatchUpdate>>('/patch-updates', {
      method: 'POST',
      data: data,
    });
    return response;
  },

  // Update patch update (admin only)
  async updatePatchUpdate(id: number, data: UpdatePatchUpdateData): Promise<ApiResponse<PatchUpdate>> {
    const response = await apiRequest<ApiResponse<PatchUpdate>>(`/patch-updates/${id}`, {
      method: 'PUT',
      data: data,
    });
    return response;
  },

  // Delete patch update (admin only)
  async deletePatchUpdate(id: number): Promise<void> {
    await apiRequest(`/patch-updates/${id}`, {
      method: 'DELETE',
    });
  },

  // Get unread patch updates for current user
  async getUnreadPatchUpdates(priority?: string): Promise<ApiResponse<UnreadPatchUpdatesResponse>> {
    const searchParams = new URLSearchParams();
    if (priority) searchParams.set('priority', priority);
    
    const queryString = searchParams.toString();
    const url = queryString ? `/patch-updates/unread?${queryString}` : '/patch-updates/unread';
    
    const response = await apiRequest<ApiResponse<UnreadPatchUpdatesResponse>>(url);
    return response;
  },

  // Mark patch update as read
  async markAsRead(id: number): Promise<ApiResponse<MarkReadResponse>> {
    const response = await apiRequest<ApiResponse<MarkReadResponse>>(`/patch-updates/${id}/mark-read`, {
      method: 'POST',
    });
    return response;
  },

  // Mark patch update as unread
  async markAsUnread(id: number): Promise<void> {
    await apiRequest(`/patch-updates/${id}/mark-read`, {
      method: 'DELETE',
    });
  },

  // Mark all or specific patch updates as read
  async markAllAsRead(patchUpdateIds?: number[]): Promise<ApiResponse<BulkMarkReadResponse>> {
    const response = await apiRequest<ApiResponse<BulkMarkReadResponse>>('/patch-updates/mark-all-read', {
      method: 'POST',
      data: { patchUpdateIds },
    });
    return response;
  },

  // Helper functions (delegated to constants/colors.ts)
  getPriorityColor: patchUpdateHelpers.getPriorityColor,
  getPriorityColorOnly: patchUpdateHelpers.getPriorityColorOnly,
  formatPriority: patchUpdateHelpers.formatPriority,
};
