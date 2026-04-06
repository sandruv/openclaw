import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '../types/api';
import { Task, TaskDropdowns, Status, Tier } from '../types/tasks';
import { CreateTask } from '../types/newTask';
import { sortTasks, TaskSortOptions } from '@/lib/taskSorting';


class TicketService {
  // Get dropdown data for ticket forms
  static async getDropdowns(): Promise<TaskDropdowns> {
    return apiRequest<TaskDropdowns>('/tickets/dropdowns');
  }

  /**
   * Get paginated list of tickets
   * @param options.sortOptions - Client-side sorting options
   * @param options.currentUserId - Current user ID for prioritizing assigned tasks
   * @param options.page - Page number for pagination
   * @param options.limit - Number of items per page for pagination
   * @param options.search - Search term for filtering tasks
   * @param options.filters - Additional filters to apply to the tasks
   * @param options.sortBy - Field to sort by (backend sorting)
   * @param options.sortDirection - Direction to sort (asc or desc)
   */
  static async getTasks(options: {
    sortOptions?: TaskSortOptions;
    currentUserId?: string | number;
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, string | string[]>;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}) {
    const { 
      currentUserId = null,
      page,
      limit,
      sortOptions,
      search,
      filters,
      sortBy,
      sortDirection
    } = options
    
    let url = '/tickets'
    const params = new URLSearchParams()
    
    // Add standard pagination parameters
    if (currentUserId) params.append('currentUserId', currentUserId.toString())
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())
    
    // Add search parameter if provided
    if (search) params.append('search', search)
    
    // Add sorting parameters if provided
    if (sortBy) params.append('sortBy', sortBy)
    if (sortDirection) params.append('sortDirection', sortDirection)
    
    // Add filter parameters if provided
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            // For array values, append each item separately or join them
            value.forEach(item => params.append(key, item))
          } else {
            params.append(key, value)
          }
        }
      })
    }
    
    // Get response from API
    const response = await apiRequest<ApiResponse<Task[]>>(url, {
      params
    });
    
    // Apply client-side sorting if needed
    if (sortOptions) {
      console.log('Sorting tasks client-side with options:', sortOptions)
      return {
        ...response,
        data: sortTasks(response.data, {
          ...sortOptions,
          currentUserId: currentUserId || sortOptions.currentUserId
        })
      };
    }
    
    return response;
  }

  // Get a single ticket by ID
  static async getTask(id: string): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>(`/tickets/?id=${id}`);
  }

  // Search tickets with multiple filter parameters
  static async searchTasks(params: {
    client_id?: string | number;
    agent_id?: string | number;
    category_id?: string | number;
    impact_id?: string | number;
    priority_id?: string | number;
    status_id?: string | number;
    subcategory_id?: string | number;
    ticket_source_id?: string | number;
    ticket_type_id?: string | number;
    urgency_id?: string | number;
    user_id?: string | number;
  }): Promise<ApiResponse<Task[]>> {
    // Convert the params object to URL search params
    const searchParams = new URLSearchParams();
    
    // Add each parameter to the search params if it exists
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    // Make the API request with the search params
    return apiRequest<ApiResponse<Task[]>>(`/tickets/search?${searchParams.toString()}`);
  }

  // Get all ticket statuses
  static async getStatuses(): Promise<ApiResponse<Status[]>> {
    return apiRequest<ApiResponse<Status[]>>('/statuses');
  }

  // Get all ticket tiers
  static async getTiers(): Promise<ApiResponse<Tier[]>> {
    return apiRequest<ApiResponse<Tier[]>>('/tiers');
  }

  // Create a new ticket
  static async createTask(data: Partial<CreateTask>): Promise<ApiResponse<CreateTask>> {
    return apiRequest<ApiResponse<CreateTask>>('/tickets', {
      method: 'POST',
      data,
    });
  }

  // Update an existing ticket
  static async updateTask(
  data: Partial<CreateTask>
  ): Promise<ApiResponse<CreateTask>> {
    return apiRequest<ApiResponse<CreateTask>>(`/tickets`, {
      method: 'PUT',
      data,
    });
  }

  // Delete a ticket
  static async deleteTask(id: string): Promise<void> {
    await apiRequest(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }
  
  /**
   * Bulk update the order of tasks for a specific assignee
   * @param assigneeId - ID of the assignee whose tasks are being reordered
   * @param tasks - Array of task objects with { id, assignee_order } for each task
   * @param senderId - Optional socket ID of the sender to prevent echoing updates back to the sender
   */
  static async bulkUpdateTaskOrder(
    assigneeId: number, 
    tasks: Array<{ id: number; assignee_order: number }>,
    senderId?: string
  ): Promise<ApiResponse<any>> {
    return apiRequest<ApiResponse<any>>('/tickets/bulk-update-order', {
      method: 'POST',
      data: {
        assigneeId,
        tasks,
        senderId
      },
    });
  }

  /**
   * Update the analysis for a specific ticket
   * @param id - The ID of the ticket to update
   * @param analysis - The analysis object to store
   * @param options - Optional settings (skipNotification to avoid triggering pusher events)
   */
  static async updateTaskAnalysis(
    id: number | string,
    analysis: any,
    options?: { skipNotification?: boolean }
  ): Promise<ApiResponse<any>> {
    return apiRequest<ApiResponse<any>>(`/tickets`, {
      method: 'PUT',
      data: {
        id,
        analysis: JSON.stringify(analysis),
        skipNotification: options?.skipNotification || false
      },
    });
  }

  /**
   * Get task queue for the current user
   * Returns up to 5 tasks prioritized by:
   * 1. In-progress tasks first
   * 2. Today's tasks by priority
   * 3. Older tasks by priority
   */
  static async getTaskQueue(): Promise<ApiResponse<Task[]>> {
    return apiRequest<ApiResponse<Task[]>>('/tickets/queue');
  }
}

// Export the service class instead of destructured methods
export const {
  getTasks,
  getTask,
  getTaskQueue,
  searchTasks,
  getStatuses,
  getTiers,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTaskOrder,
  updateTaskAnalysis,
} = TicketService;