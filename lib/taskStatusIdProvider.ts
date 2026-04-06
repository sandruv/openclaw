import { getStatuses } from '../services/taskService';

// Types of task status IDs
export enum TaskStatusType {
  New = 1,
  InProgress = 2,
  OnHold = 3,
  PendingEndUser = 4,
  UserResponded = 5,
  Closed = 6,
  Archived = 7,
  Reopened = 8,
  Assigned = 9,
}

// Interface for task status record
export interface TaskStatusRecord {
  id: number;
  name: string;
  active: boolean;
}

// Task Status Provider class using services instead of direct database access
export class TaskStatusIdProvider {
  // Static map of status types for fallback and quick reference
  private static readonly statusTypes = new Map<TaskStatusType, string>([
    [TaskStatusType.New, 'New'],
    [TaskStatusType.InProgress, 'In Progress'],
    [TaskStatusType.OnHold, 'On Hold'],
    [TaskStatusType.PendingEndUser, 'Pending End-User'],
    [TaskStatusType.UserResponded, 'User Responded'],
    [TaskStatusType.Closed, 'Closed'],
    [TaskStatusType.Archived, 'Archived'],
    [TaskStatusType.Reopened, 'Reopened'],
    [TaskStatusType.Assigned, 'Assigned'],
  ]);

  // Cache for status data
  private statusCache: TaskStatusRecord[] | null = null;

  constructor() {
    // No need for Prisma instance anymore
  }

  // Get name for a specific status type
  getTypeName(type: TaskStatusType): string {
    return TaskStatusIdProvider.statusTypes.get(type) || 'Unknown';
  }

  // Create a new status record is now deprecated since it should go through API
  async createRecord({ name, active = true }: { name: string; active?: boolean }): Promise<TaskStatusRecord> {
    console.warn('Direct status creation is deprecated. Use API endpoints instead.');
    
    // Check if status with this name already exists in the statuses
    const statuses = await this.getAllStatuses();
    const existingStatus = statuses.find(
      status => status.name.toLowerCase() === name.toLowerCase()
    );

    if (existingStatus) {
      return existingStatus;
    }

    // If we're here, we couldn't find or create the status
    throw new Error('Cannot create status directly. Use API endpoints instead.');
  }

  // Check if a type is valid
  isValidType(type: TaskStatusType): boolean {
    return TaskStatusIdProvider.statusTypes.has(type);
  }

  // Get status ID by name
  async getIdByName(name: string): Promise<number | undefined> {
    try {
      const statuses = await this.getAllStatuses();
      const status = statuses.find(s => 
        s.name.toLowerCase() === name.toLowerCase()
      );
      
      return status?.id;
    } catch (error) {
      console.error('Error getting status ID by name:', error);
      return undefined;
    }
  }

  // Get all status types using the service
  async getAllStatuses(): Promise<TaskStatusRecord[]> {
    try {
      // Return cached statuses if available
      if (this.statusCache) {
        return this.statusCache;
      }

      // Get statuses from the service
      const response = await getStatuses();
      
      if (response.status === 200 && response.data) {
        // Map the response to TaskStatusRecord format
        // Since Status type doesn't have 'active' property, we default it to true
        const statuses = response.data.map(status => ({
          id: status.id,
          name: status.name,
          active: true, // Default to true since Status doesn't have this property
        }));
        
        // Cache the results
        this.statusCache = statuses;
        
        return statuses;
      } else {
        throw new Error('Failed to fetch statuses from API');
      }
    } catch (error) {
      console.error('Error getting all statuses:', error);
      
      // Fallback to static statuses if API call fails
      const fallbackStatuses: TaskStatusRecord[] = [];
      
      for (const [id, name] of TaskStatusIdProvider.statusTypes.entries()) {
        fallbackStatuses.push({
          id,
          name,
          active: true,
        });
      }
      
      return fallbackStatuses;
    }
  }
  
  // Clear the status cache to force refresh on next getAllStatuses call
  clearCache(): void {
    this.statusCache = null;
  }
}

// Create a singleton instance for global use
export const TaskStatusTypeProvider = new TaskStatusIdProvider();
