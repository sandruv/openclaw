import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '@/types/api';
import { Status } from '@/types/status';

export interface InitializationTask {
  key: string;
  name: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'running';
  lastRun?: string;
  error?: string;
  success?: boolean;
  message?: string;
}

export interface InitializationResult {
  success: boolean;
  tasks: InitializationTask[];
  message: string;
}

export class InitializationService {
  /**
   * Run all system initialization tasks
   */
  static async runAllInitializations(): Promise<ApiResponse<InitializationResult>> {
    return apiRequest<ApiResponse<InitializationResult>>('/admin/initialize', {
      method: 'POST',
    });
  }

  /**
   * Run a specific initialization task
   * @param key The task key to run
   */
  static async runInitialization(key: string): Promise<ApiResponse<InitializationTask>> {
    return apiRequest<ApiResponse<InitializationTask>>('/admin/initialize/task', {
      method: 'POST',
      data: { key },
    });
  }

  /**
   * Get all initialization tasks and their status
   */
  static async getInitializationTasks(): Promise<ApiResponse<InitializationTask[]>> {
    return apiRequest<ApiResponse<InitializationTask[]>>('/admin/initialize/tasks');
  }

  /**
   * Initialize archived status
   */
  static async initializeArchivedStatus(): Promise<ApiResponse<Status>> {
    return apiRequest<ApiResponse<Status>>('/admin/initialize/archived-status', {
      method: 'POST',
    });
  }

  /**
   * Initialize assigned status
   */
  static async initializeAssignedStatus(): Promise<ApiResponse<Status>> {
    return apiRequest<ApiResponse<Status>>('/admin/initialize/assigned-status', {
      method: 'POST',
    });
  }

  /**
   * Get all task statuses
   */
  static async getStatuses(): Promise<ApiResponse<Status[]>> {
    return apiRequest<ApiResponse<Status[]>>('/admin/statuses');
  }

  /**
   * Get all Request subcategories (category_id: 7)
   */
  static async getRequestSubcategories(): Promise<ApiResponse<any[]>> {
    return apiRequest<ApiResponse<any[]>>('/admin/initialize/request-subcategories');
  }

  /**
   * Seed/Initialize Request subcategories
   */
  static async seedRequestSubcategories(): Promise<ApiResponse<any>> {
    return apiRequest<ApiResponse<any>>('/admin/initialize/request-subcategories', {
      method: 'POST',
    });
  }

  /**
   * Create/ensure Request category exists (ID: 7, name: 'Request')
   */
  static async createRequestCategory(): Promise<ApiResponse<any>> {
    return apiRequest<ApiResponse<any>>('/admin/initialize/request-subcategories', {
      method: 'PUT',
    });
  }
}

// Export individual methods for easier imports
export interface EnvVariable {
  name: string;
  hasValue: boolean;
  category: string;
}

export interface EnvVariableValue extends EnvVariable {
  value: string;
}

export class EnvVariablesService {
  /**
   * Get all environment variables (names and status only)
   */
  static async getEnvVariables(): Promise<ApiResponse<EnvVariable[]>> {
    return apiRequest<ApiResponse<EnvVariable[]>>('/admin/env-variables');
  }

  /**
   * Get the value of a specific environment variable
   */
  static async getEnvVariableValue(name: string): Promise<ApiResponse<EnvVariableValue>> {
    return apiRequest<ApiResponse<EnvVariableValue>>('/admin/env-variables', {
      method: 'POST',
      data: { name },
    });
  }
}

export const {
  runAllInitializations,
  runInitialization,
  getInitializationTasks,
  initializeArchivedStatus,
  initializeAssignedStatus,
  getStatuses,
  getRequestSubcategories,
  seedRequestSubcategories,
  createRequestCategory
} = InitializationService;

export const {
  getEnvVariables,
  getEnvVariableValue
} = EnvVariablesService;

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  role: {
    id: number;
    name: string;
  };
}

export class SuperAdminsService {
  /**
   * Get all admin and super admin users
   */
  static async getAdminUsers(): Promise<ApiResponse<AdminUser[]>> {
    return apiRequest<ApiResponse<AdminUser[]>>('/admin/super-admins');
  }

  /**
   * Update user role to Admin or SuperAdmin
   */
  static async updateUserRole(userId: number, roleId: 3 | 5): Promise<ApiResponse<AdminUser>> {
    return apiRequest<ApiResponse<AdminUser>>('/admin/super-admins', {
      method: 'POST',
      data: { userId, roleId },
    });
  }

  /**
   * Make user #1 a SuperAdmin with a button click
   */
  static async makeUserOneSuperAdmin(): Promise<ApiResponse<AdminUser>> {
    return apiRequest<ApiResponse<AdminUser>>('/admin/super-admins', {
      method: 'POST',
      data: { makeUserOneSuperAdmin: true },
    });
  }
}

export const {
  getAdminUsers,
  updateUserRole,
  makeUserOneSuperAdmin
} = SuperAdminsService;

export default InitializationService;
