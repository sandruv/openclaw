import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '../types/api';
import { Task } from '../types/tasks';

export interface MergeTasksRequest {
  targetTaskId: number;
  sourceTaskIds: number[];
  mergeOptions?: {
    keepOriginalTasks?: boolean;
    mergeActivities?: boolean;
    mergeAttachments?: boolean;
  };
}

export interface MergeTasksResponse {
  mergedTaskId: number;
  mergedActivities: number;
  mergedAttachments: number;
  closedTaskIds: number[];
  message: string;
}

export interface UnmergeTaskRequest {
  masterTaskId: number;
  childTicketIds: string | number[];
}

export interface UnmergeTaskResponse {
  data: Task | null;
  message: string;
  status: number;
}

export interface BulkActionRequest {
  taskIds: number[];
  action: 'archive' | 'assign' | 'delete' | 'status_change';
  actionData?: {
    assigneeId?: number;
    statusId?: number;
    [key: string]: any;
  };
}

export interface BulkActionResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  message: string;
  errors?: string[];
}

export interface SimilarTasksRequest {
  summary: string;
  excludeId?: number;
  limit?: number;
}

class BulkActionService {
  /**
   * Search for tasks similar to the given summary
   */
  static async searchSimilarTasks(params: SimilarTasksRequest): Promise<ApiResponse<Task[]>> {
    const searchParams = new URLSearchParams();
    searchParams.append('summary', params.summary);
    
    if (params.excludeId) {
      searchParams.append('excludeId', params.excludeId.toString());
    }
    
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    return apiRequest<ApiResponse<Task[]>>(`/tickets/similar?${searchParams.toString()}`);
  }

  /**
   * Search tasks by summary only (for general search)
   */
  static async searchTasksBySummary(summary: string, limit: number = 20): Promise<ApiResponse<Task[]>> {
    const searchParams = new URLSearchParams();
    searchParams.append('search', summary);
    searchParams.append('limit', limit.toString());
    searchParams.append('searchFields', 'summary'); // Limit search to summary field only

    return apiRequest<ApiResponse<Task[]>>(`/tickets?${searchParams.toString()}`);
  }

  /**
   * Merge multiple tasks into a target task
   */
  static async mergeTasks(request: MergeTasksRequest): Promise<ApiResponse<MergeTasksResponse>> {
    // Transform the request to match the API format
    const apiRequestData = {
      master_ticket_id: request.targetTaskId,
      child_ticket_ids: request.sourceTaskIds.join(',')
    };

    return apiRequest<ApiResponse<MergeTasksResponse>>('/tickets/merge', {
      method: 'POST',
      data: apiRequestData,
    });
  }

  /**
   * Unmerge child tickets from a master task
   */
  static async unmergeTasks(request: UnmergeTaskRequest): Promise<ApiResponse<UnmergeTaskResponse>> {
    // Transform the request to match the API format
    const apiRequestData = {
      master_ticket_id: request.masterTaskId,
      child_ticket_ids: Array.isArray(request.childTicketIds) 
        ? request.childTicketIds.join(',')
        : request.childTicketIds.toString()
    };

    return apiRequest<ApiResponse<UnmergeTaskResponse>>('/tickets/unmerge', {
      method: 'POST',
      data: apiRequestData,
    });
  }

  /**
   * Perform bulk actions on multiple tasks
   */
  static async performBulkAction(request: BulkActionRequest): Promise<ApiResponse<BulkActionResponse>> {
    return apiRequest<ApiResponse<BulkActionResponse>>('/tickets/bulk-action', {
      method: 'POST',
      data: request,
    });
  }

  /**
   * Archive multiple tasks
   */
  static async archiveTasks(taskIds: number[]): Promise<ApiResponse<BulkActionResponse>> {
    return apiRequest<ApiResponse<BulkActionResponse>>('/tickets/bulk-action', {
      method: 'POST',
      data: {
        taskIds,
        action: 'archive'
      }
    });
  }

  /**
   * Assign multiple tasks to a user
   */
  static async assignTasks(taskIds: number[], assigneeId: number): Promise<ApiResponse<BulkActionResponse>> {
    return apiRequest<ApiResponse<BulkActionResponse>>('/tickets/bulk-action', {
      method: 'POST',
      data: {
        taskIds,
        action: 'assign',
        actionData: { assigneeId }
      }
    });
  }

  /**
   * Change status of multiple tasks
   */
  static async changeTasksStatus(taskIds: number[], statusId: number): Promise<ApiResponse<BulkActionResponse>> {
    return apiRequest<ApiResponse<BulkActionResponse>>('/tickets/bulk-action', {
      method: 'POST',
      data: {
        taskIds,
        action: 'status_change',
        actionData: { statusId }
      }
    });
  }

  /**
   * Delete multiple tasks
   */
  static async deleteTasks(taskIds: number[]): Promise<ApiResponse<BulkActionResponse>> {
    return apiRequest<ApiResponse<BulkActionResponse>>('/tickets/bulk-action', {
      method: 'POST',
      data: {
        taskIds,
        action: 'delete'
      }
    });
  }

  /**
   * Get merge preview - shows what would happen if tasks are merged
   */
  static async getMergePreview(targetTaskId: number, sourceTaskIds: number[]): Promise<ApiResponse<{
    targetTask: Task;
    sourceTasks: Task[];
    totalActivities: number;
    totalAttachments: number;
    estimatedMergeTime: number;
  }>> {
    return apiRequest<ApiResponse<any>>('/tickets/merge/preview', {
      method: 'POST',
      data: {
        targetTaskId,
        sourceTaskIds
      }
    });
  }
}

// Export the service methods
export const {
  searchSimilarTasks,
  searchTasksBySummary,
  mergeTasks,
  unmergeTasks,
  performBulkAction,
  archiveTasks,
  assignTasks,
  changeTasksStatus,
  deleteTasks,
  getMergePreview
} = BulkActionService;

export default BulkActionService;
