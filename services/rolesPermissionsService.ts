import { apiRequest } from '@/services/api/clientConfig';
import { ApiResponse } from '@/types/api';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  priority?: number;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  priority?: number;
  active?: boolean;
}

export interface CreatePermissionData {
  name: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface UpdateRolePermissionsData {
  permission_id: number;
  action: 'add' | 'remove';
}

export const rolesPermissionsService = {
  // Roles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiRequest<ApiResponse<Role[]>>('/admin/roles');
    return response;
  },

  async createRole(roleData: CreateRoleData): Promise<ApiResponse<Role>> {
    const response = await apiRequest<ApiResponse<Role>>('/admin/roles', {
      method: 'POST',
      data: roleData,
    });
    return response;
  },

  // Permissions
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await apiRequest<ApiResponse<Permission[]>>('/admin/permissions');
    return response;
  },

  async createPermission(permissionData: CreatePermissionData): Promise<ApiResponse<Permission>> {
    const response = await apiRequest<ApiResponse<Permission>>('/admin/permissions', {
      method: 'POST',
      data: permissionData,
    });
    return response;
  },

  // Role Permissions
  async getRolePermissions(roleId: number): Promise<ApiResponse<RolePermission[]>> {
    const response = await apiRequest<ApiResponse<RolePermission[]>>(
      `/admin/roles/${roleId}/permissions`
    );
    return response;
  },

  async updateRolePermissions(
    roleId: number,
    updateData: UpdateRolePermissionsData
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiRequest<ApiResponse<{ message: string }>>(
      `/admin/roles/${roleId}/permissions`,
      {
        method: 'PUT',
        data: updateData,
      }
    );
    return response;
  },
};
