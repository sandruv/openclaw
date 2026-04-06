import { Task } from '@/types/tasks';

// Severity points for impact levels
export const IMPACT_SEVERITY = {
  'Company Wide': 5,
  'Multiple Users': 3,
  'Single User': 1,
  'No Impact': 0,
};

// Severity points for priority levels
export const PRIORITY_SEVERITY = {
  'Critical': 4,
  'High': 3,
  'Medium': 2,
  'Low': 1,
  'None': 0,
};

// Status order (lower index = higher priority)
export const STATUS_ORDER = [
  'In Progress',
  'New',
  'Open',
  'Pending',
  'Closed',
  'Resolved',
];

export type TaskSortOptions = {
  currentUserId?: string | number;
  sortByAssignee?: boolean;
  sortByStatus?: boolean;
  sortBySeverity?: boolean;
  sortByDate?: boolean;
};

/**
 * Sort tasks based on multiple criteria with customizable options
 * 
 * Sorting order (highest to lowest priority):
 * 1. Tasks assigned to current user
 * 2. Current user's "In Progress" tasks first
 * 3. Current user's tasks by severity
 * 4. Current user's tasks by creation date
 * 5. Other tasks by severity
 * 6. Other tasks by creation date
 */
export function sortTasks(
  tasks: Task[],
  options: TaskSortOptions = {
    sortByAssignee: true,
    sortByStatus: true,
    sortBySeverity: true,
    sortByDate: true
  }
): Task[] {
  const {
    currentUserId,
    sortByAssignee = true,
    sortByStatus = true,
    sortBySeverity = true,
    sortByDate = true
  } = options;

  return [...tasks].sort((a, b) => {
    // Helper function to determine if a task is assigned to current user
    const isAssignedToCurrentUser = (task: Task): boolean => {
      if (!currentUserId) return false;
      const currentUserIdStr = String(currentUserId);
      const agentId = task.agent?.id !== undefined ? String(task.agent.id) : null;
      return agentId === currentUserIdStr;
    };

    // 1. Sort by assignee (current user's tasks first)
    const aIsCurrentUser = isAssignedToCurrentUser(a);
    const bIsCurrentUser = isAssignedToCurrentUser(b);
    
    if (sortByAssignee) {
      if (aIsCurrentUser && !bIsCurrentUser) return -1;
      if (!aIsCurrentUser && bIsCurrentUser) return 1;
    }
    
    // If both are assigned to current user OR both are not
    if (aIsCurrentUser === bIsCurrentUser) {
      // For current user's tasks
      if (aIsCurrentUser) {
        // 2. Sort by status first
        if (sortByStatus) {
          const aStatusIndex = STATUS_ORDER.indexOf(a.status?.name || '');
          const bStatusIndex = STATUS_ORDER.indexOf(b.status?.name || '');
          
          if (aStatusIndex !== bStatusIndex) {
            return aStatusIndex - bStatusIndex;
          }
        }
        
        // 3. Then by severity
        if (sortBySeverity) {
          const aSeverity = calculateSeverity(a);
          const bSeverity = calculateSeverity(b);
          
          if (aSeverity !== bSeverity) {
            return bSeverity - aSeverity; // Higher severity first
          }
        }
        
        // 4. Then by creation date
        if (sortByDate) {
          const aDate = new Date(a.created_at).getTime();
          const bDate = new Date(b.created_at).getTime();
          
          return bDate - aDate; // Newer first
        }
      }
      // For non-current user tasks
      else {
        // 5. Sort by severity
        if (sortBySeverity) {
          const aSeverity = calculateSeverity(a);
          const bSeverity = calculateSeverity(b);
          
          if (aSeverity !== bSeverity) {
            return bSeverity - aSeverity; // Higher severity first
          }
        }
        
        // 6. Then by creation date
        if (sortByDate) {
          const aDate = new Date(a.created_at).getTime();
          const bDate = new Date(b.created_at).getTime();
          
          return bDate - aDate; // Newer first
        }
      }
    }

    return 0;
  });
}

/**
 * Calculate severity score based on impact and priority
 * Higher score = higher severity
 */
export function calculateSeverity(task: Task): number {
  const impactName = task.impact?.name || '';
  const priorityName = task.priority?.name || '';
  
  const impactScore = IMPACT_SEVERITY[impactName as keyof typeof IMPACT_SEVERITY] || 0;
  const priorityScore = PRIORITY_SEVERITY[priorityName as keyof typeof PRIORITY_SEVERITY] || 0;
  
  const severity = impactScore + priorityScore;
  // logger.info(`taskSorting: Task ${task.id}: \n  Impact "${impactName}"(${impactScore}) + Priority "${priorityName}"(${priorityScore}) = Severity ${severity}`);
  return severity;
}

/**
 * Server-side function to sort tasks with query parameters
 * @param tasks List of tasks to sort
 * @param userId Current user ID
 * @param query URL search params that may contain sort options
 */
export function sortTasksFromQuery(tasks: Task[], userId: string | number, query: URLSearchParams): Task[] {
  console.log("Server-side sorting with user ID:", userId);
  
  const options: TaskSortOptions = {
    currentUserId: userId,
    sortByAssignee: query.get('sortByAssignee') !== 'false',
    sortByStatus: query.get('sortByStatus') !== 'false',
    sortBySeverity: query.get('sortBySeverity') !== 'false',
    sortByDate: query.get('sortByDate') !== 'false',
  };
  
  return sortTasks(tasks, options);
}
