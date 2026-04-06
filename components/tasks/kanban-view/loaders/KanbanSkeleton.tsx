import { Skeleton } from '@/components/ui/skeleton'
import { TaskStatusTypeProvider, TaskStatusRecord } from '@/lib/taskStatusIdProvider'
import { STATUS_ORDER } from '@/constants/kanban'

export function KanbanSkeleton({ viewType = 'status' }: { viewType?: 'status' | 'assignee' | 'client' }) {
  // Generate columns based on view type
  const generateColumns = () => {
    if (viewType === 'status') {
      // Use default statuses for skeleton - we can't use the async getAllStatuses here
      const defaultStatuses: TaskStatusRecord[] = [
        { id: 1, name: 'New', active: true },
        { id: 2, name: 'In Progress', active: true },
        { id: 3, name: 'On Hold', active: true },
        { id: 4, name: 'Pending End User', active: true },
        { id: 5, name: 'User Responded', active: true },
        { id: 6, name: 'Closed', active: true },
        { id: 7, name: 'Archived', active: true }
      ];
      // Sort by the predefined order
      return defaultStatuses.sort((a, b) => 
        (STATUS_ORDER[a.id] || 999) - (STATUS_ORDER[b.id] || 999)
      );
    } else if (viewType === 'assignee') {
      // For assignee view, generate 4 columns
      return Array(4).fill(null).map((_, i) => ({ 
        id: i, 
        name: i === 0 ? 'Unassigned' : `Agent ${i}` 
      }));
    } else {
      // For client view, generate 3 columns
      return Array(3).fill(null).map((_, i) => ({ 
        id: i, 
        name: `Client ${i + 1}` 
      }));
    }
  };

  const columns = generateColumns();

  return (
    <div className="space-y-1">
      {/* Header skeleton that mimics the actual Header component */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Skeleton className="h-9 w-[250px]" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-[120px]" />
            <Skeleton className="h-9 w-[120px]" />
            <Skeleton className="h-9 w-[120px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>
      </div>

      {/* Kanban board skeleton */}
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)] styled-scrollbar">
        {columns.map((column, columnIndex) => (
          <div 
            key={columnIndex}
            className="flex flex-col w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-md shadow"
          >
            {/* Column header with count */}
            <div className="px-4 py-2 rounded-t-md flex justify-between items-center bg-gray-300 dark:bg-gray-700">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-5 w-[30px] rounded-full" />
            </div>
            
            {/* Tasks in column - match the height calculations from KanbanColumn */}
            <div className="py-1 flex-1 overflow-y-auto min-h-[calc(100vh-190px)] max-h-[calc(100vh-190px)] styled-scrollbar p-2 space-y-3">
              {/* Generate a random number of tasks per column between 2 and 6 */}
              {[...Array(Math.floor(Math.random() * 4) + 2)].map((_, taskIndex) => (
                <div 
                  key={taskIndex}
                  className="bg-white dark:bg-gray-700 rounded-md p-3 shadow-sm space-y-2"
                >
                  {/* Task ID and status */}
                  <div className="flex justify-between items-center mb-1">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-5 w-[80px] rounded-full" />
                  </div>
                  
                  {/* Task summary */}
                  <Skeleton className="h-5 w-[90%]" />
                  
                  {/* Task metadata row */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-5 w-5 rounded-md" /> {/* Type icon */}
                      <Skeleton className="h-5 w-5 rounded-md" /> {/* Priority icon */}
                    </div>
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* Assignee avatar */}
                  </div>
                  
                  {/* Client info */}
                  <div className="flex items-center space-x-2 mt-1">
                    <Skeleton className="h-5 w-5 rounded-full" /> {/* Client avatar */}
                    <Skeleton className="h-4 w-[100px]" /> {/* Client name */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
