import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '../types/api';

// TODO: Replace with actual Activity type
interface Activity {
  id: number;
  ticket_id: number;
  activity_type_id: number;
  status_id: number;
  agent_id: number;
  created_at: string;
  updated_at: string;
}

interface CreateActivityOptions {
  data: FormData;
  isEmail?: boolean;
}

class TaskActivityService {
  // Get all activities for a task
  static async getTaskActivities(taskId: string | number): Promise<ApiResponse<Activity[]>> {
    return apiRequest<ApiResponse<Activity[]>>(`/activities?ticket_id=${taskId}`);
  }

  // Get a single activity by ID
  static async getActivity(id: string | number): Promise<ApiResponse<Activity>> {
    return apiRequest<ApiResponse<Activity>>(`/activities?id=${id}`);
  }

  // Create a new activity (handles both regular and email activities)
  static async createActivity({ data, isEmail = false }: CreateActivityOptions): Promise<ApiResponse<Activity>> {
    const endpoint = isEmail ? '/activities?is_email=true' : '/activities';
    return apiRequest<ApiResponse<Activity>>(endpoint, {
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Update an existing activity
  static async updateActivity(
    id: string | number,
    data: Partial<Activity>
  ): Promise<ApiResponse<Activity>> {
    return apiRequest<ApiResponse<Activity>>(`/activities/${id}`, {
      method: 'PUT',
      data,
    });
  }

  // Delete an activity
  static async deleteActivity(id: string | number): Promise<void> {
    await apiRequest(`/activities/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export the service methods
export const {
  getTaskActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} = TaskActivityService;
