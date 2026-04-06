import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '@/types/api';

export interface Tool {
  id: number;
  name: string;
  link?: string | null;
  color?: string | null;
  icon?: string | null;
  user_id?: number | null;
  client_id?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolData {
  name: string;
  link?: string | null;
  color?: string | null;
  icon?: string | null;
  user_id?: number | null;
  client_id?: number | null;
}

export class ToolService {
  /**
   * Get all tools
   * @returns Array of all active tools
   */
  static async getAllTools(): Promise<ApiResponse<Tool[]>> {
    const response = await apiRequest<ApiResponse<Tool[]>>('/tools');
    return response;
  }

  /**
   * Get a tool by ID
   * @param id The tool ID
   * @returns The tool or null if not found
   */
  static async getToolById(id: number): Promise<ApiResponse<Tool>> {
    const response = await apiRequest<ApiResponse<Tool>>(`/tools?id=${id}`);
    return response;
  }

  /**
   * Get tools by user ID
   * @param userId The user ID
   * @returns Array of tools associated with the user
   */
  static async getToolsByUserId(userId: number): Promise<ApiResponse<Tool[]>> {
    const response = await apiRequest<ApiResponse<Tool[]>>(`/tools?user_id=${userId}`);
    return response;
  }

  /**
   * Get tools by client ID
   * @param clientId The client ID
   * @returns Array of tools associated with the client
   */
  static async getToolsByClientId(clientId: number): Promise<ApiResponse<Tool[]>> {
    const response = await apiRequest<ApiResponse<Tool[]>>(`/tools?client_id=${clientId}`);
    return response;
  }

  /**
   * Create a new tool
   * @param data The tool data
   * @returns API response with the created tool
   */
  static async createTool(data: ToolData): Promise<ApiResponse<Tool>> {
    const response = await apiRequest<ApiResponse<Tool>>('/tools', {
      method: 'POST',
      data,
    });
    return response;
  }

  /**
   * Update an existing tool
   * @param id The tool ID
   * @param data The updated tool data
   * @returns API response with the updated tool
   */
  static async updateTool(id: number, data: Partial<ToolData>): Promise<ApiResponse<Tool>> {
    const response = await apiRequest<ApiResponse<Tool>>('/tools', {
      method: 'PUT',
      data: { id, ...data },
    });
    return response;
  }

  /**
   * Delete (deactivate) a tool
   * @param id The tool ID
   * @returns API response with the deactivated tool
   */
  static async deleteTool(id: number): Promise<ApiResponse<Tool>> {
    const response = await apiRequest<ApiResponse<Tool>>(`/tools?id=${id}`, {
      method: 'DELETE',
    });
    return response;
  }
}

// Export individual methods for easier imports
export const {
  getAllTools,
  getToolById,
  getToolsByUserId,
  getToolsByClientId,
  createTool,
  updateTool,
  deleteTool,
} = ToolService;
