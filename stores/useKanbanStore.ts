import { create } from 'zustand'
import { Task } from '@/types/tasks'
import { KanbanViewType, KanbanColumnData } from '@/types/kanban'
import { logger } from '@/lib/logger'
import { User, Client, Role } from '@/types/clients'
import { useGlobalStore } from '@/stores/useGlobalStore'
import { TicketActivityType } from '@/lib/ticketTypeIdProvider'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { createActivity } from '@/services/taskActivityService'
import { useSessionStore } from '@/stores/useSessionStore'
import { bulkUpdateTaskOrder } from '@/services/taskService'
import io from 'socket.io-client'

// Function to show toast notifications outside of React components
let showToastFunction: ((props: { title: string; description: string; type: 'error' | 'info' | 'warning' | 'success'; duration?: number }) => void) | null = null;

export const setToastFunction = (fn: typeof showToastFunction) => {
  showToastFunction = fn;
};

const showToast = (title: string, description: string, type: 'error' | 'info' | 'warning' | 'success', duration?: number) => {
  if (showToastFunction) {
    showToastFunction({ title, description, type, duration });
  } else {
    // Fallback to console for environments where toast isn't available
    console.log(`[Toast - ${type}] ${title}: ${description}`);
  }
};

interface KanbanState {
  // Drag and drop state
  isDragging: boolean
  draggedTask: Task | null
  dragSourceColumn: number | null
  dragTargetColumn: number | null
  dragSourceIndex: number | null
  dragTargetIndex: number | null
  
  // Loading states
  loadingTasks: Set<string> // Set of task IDs that are currently being processed
  isRefreshing: boolean // Subtle loading for refresh actions
  
  // View type
  viewType: KanbanViewType
  
  // Columns and tasks
  columns: KanbanColumnData[]
  
  // Actions
  setViewType: (viewType: KanbanViewType) => void
  setColumns: (columns: KanbanColumnData[]) => void
  
  // Loading state actions
  setTaskLoading: (taskId: string, loading: boolean) => void
  isTaskLoading: (taskId: string) => boolean
  setRefreshing: (refreshing: boolean) => void
  
  // Drag and drop actions
  startDrag: (task: Task, sourceColumn: number, sourceIndex: number) => void
  updateDragPosition: (targetColumn: number, targetIndex: number) => void
  endDrag: () => void
  cancelDrag: () => void
  
  // Task operations
  moveTask: (
    taskId: string, 
    sourceColumnId: number, 
    targetColumnId: number,
    sourceIndex: number,
    targetIndex: number
  ) => void
  
  // View-specific operations
  reorderTask: (columnId: number, oldIndex: number, newIndex: number) => any
  updateTaskStatusInUI: (taskId: string, newStatusId: number) => any
  updateTaskAssigneeInUI: (taskId: string, newAssigneeId: number) => any
  persistTaskStatusChange: (taskId: string, newStatusId: number) => Promise<any>
  persistTaskAssigneeChange: (taskId: string, newAssigneeId: number) => Promise<any>
  persistTaskOrderChange: (assigneeId: number, orderedTasks: Task[]) => Promise<any>
}

export const useKanbanStore = create<KanbanState>((set, get) => {
  // Helper function to create a toast with undo functionality
  // This is a local function, not exposed in the store interface
  const createToastWithUndo = (message: string, undoCallback: () => void): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const showToast = useGlobalStore.getState().showUndoToast
      
      // Show toast with undo option first
      showToast(
        message,
        () => {
          // Call the undo callback
          undoCallback()
          
          // Reject the promise to prevent further actions
          reject(new Error('User cancelled the action'))
        }
      )
      
      // Resolve after 5 seconds if undo wasn't clicked
      setTimeout(() => {
        resolve()
      }, 5000)
    })
  }
  
  // Helper function to reset drag state - reduces duplication
  const resetDragState = () => set({
    isDragging: false,
    draggedTask: null,
    dragSourceColumn: null,
    dragTargetColumn: null,
    dragSourceIndex: null,
    dragTargetIndex: null,
  })
  
  return {
    // Initial state
    isDragging: false,
    draggedTask: null,
    dragSourceColumn: null,
    dragTargetColumn: null,
    dragSourceIndex: null,
    dragTargetIndex: null,
    loadingTasks: new Set<string>(),
    isRefreshing: false,
    viewType: 'status' as KanbanViewType,
    columns: [],
    
    // Set view type
    setViewType: (viewType: KanbanViewType) => {
      set({ viewType })
    },
    
    // Set columns
    setColumns: (columns: KanbanColumnData[]) => {
      set({ columns })
    },

    // Loading state management
    setTaskLoading: (taskId: string, loading: boolean) => {
      set((state) => {
        const newLoadingTasks = new Set(state.loadingTasks)
        if (loading) {
          newLoadingTasks.add(taskId)
        } else {
          newLoadingTasks.delete(taskId)
        }
        return { loadingTasks: newLoadingTasks }
      })
    },

    isTaskLoading: (taskId: string) => {
      return get().loadingTasks.has(taskId)
    },

    setRefreshing: (refreshing: boolean) => {
      set({ isRefreshing: refreshing })
    },
    
    // Start dragging a task
    startDrag: (task: Task, sourceColumn: number, sourceIndex: number) => {
      // Commented out to reduce console noise during dragging
      logger.info('Kanban: Start dragging task', { 
        taskId: task.id, 
        sourceColumn, 
        sourceIndex 
      })
      
      set({
        isDragging: true,
        draggedTask: task,
        dragSourceColumn: sourceColumn,
        dragTargetColumn: sourceColumn, // Initially the same as source
        dragSourceIndex: sourceIndex,
        dragTargetIndex: sourceIndex, // Initially the same as source
      })
    },
    
    // Update drag position while dragging
    updateDragPosition: (targetColumn: number, targetIndex: number) => {
      // Only update state if we're actually dragging
      if (get().isDragging) {
        // Update the drag target information
        set({
          dragTargetColumn: targetColumn,
          dragTargetIndex: targetIndex,
        });
      }
    },
    
    // End dragging and apply changes
    endDrag: async () => {
      const { 
        draggedTask, 
        dragSourceColumn, 
        dragTargetColumn, 
        dragSourceIndex, 
        dragTargetIndex,
        viewType,
        setColumns
      } = get()
      
      if (!draggedTask || !dragSourceColumn || !dragTargetColumn) {
        logger.info('Kanban: Cannot end drag, missing required data')
        resetDragState()
        return
      }
      
      // Store original state for undo functionality
      const originalState = {
        task: draggedTask,
        sourceColumn: dragSourceColumn,
        targetColumn: dragTargetColumn,
        sourceIndex: dragSourceIndex,
        targetIndex: dragTargetIndex,
        columns: [...get().columns.map(col => ({
          ...col,
          tasks: [...col.tasks]
        }))]
      }
      
      // Reset drag state early to prevent UI issues during async operations
      resetDragState()
      
      try {
        // Apply the changes based on the view type
        if (dragSourceColumn !== dragTargetColumn) {
          // Column changed
          if (viewType === 'status') {
            // Status view - update task status
            
            // First update the UI immediately - this will move the task to the new column
            // We're not using changeTaskStatus here to avoid making API calls prematurely
            const targetColumn = await get().updateTaskStatusInUI(draggedTask.id.toString(), dragTargetColumn);
            
            // Create a promise that will resolve after the toast timeout or reject if undo is clicked
            const toastPromise = createToastWithUndo(
              `Task #${draggedTask.id} moved to ${targetColumn.title}`,
              () => {
                // Restore original state on undo
                setColumns(originalState.columns)
                
                // We don't need to do anything else with drag state since it was already reset
              }
            )
            
            try {
              // Wait for the toast timeout or undo action
              await toastPromise
              
              // If we get here, the user didn't undo, so persist the change to the backend
              await get().persistTaskStatusChange(draggedTask?.id.toString() || '', dragTargetColumn);
              
              // Log success
              logger.info(`Kanban: Changed task ${draggedTask?.id} status to ${targetColumn.title}`)
            } catch (error) {
              // User clicked undo or there was another error
              logger.info('Kanban: Status change was cancelled by user')
              // No need to do anything else as the UI has already been restored
              return
            }
          } else if (viewType === 'assignee') {
            // Assignee view - update task assignee
            
            // First update the UI immediately - this will move the task to the new column
            // We're not using changeTaskAssignee here to avoid making API calls prematurely
            const targetColumn = await get().updateTaskAssigneeInUI(draggedTask.id.toString(), dragTargetColumn);
            
            // Create a promise that will resolve after the toast timeout or reject if undo is clicked
            const toastPromise = createToastWithUndo(
              `Task #${draggedTask.id} assigned to ${targetColumn.title}`,
              () => {
                // Restore original state on undo
                console.log('Kanban: Restoring original state on undo', originalState)
                setColumns(originalState.columns)
                // We don't need to do anything else with drag state since it was already reset
              }
            )
            
            try {
              // Wait for the toast timeout or undo action
              await toastPromise
              
              // If we get here, the user didn't undo, so persist the change to the backend
              await get().persistTaskAssigneeChange(draggedTask.id.toString(), dragTargetColumn);
              
              // Log success
              logger.info(`Kanban: Changed task ${draggedTask.id} assignee to ${targetColumn.title}`)
            } catch (error) {
              // Check if this was a user undo or an actual error
              if (error instanceof Error && error.message === 'User cancelled the action') {
                logger.info('Kanban: Assignee change was cancelled by user')
                // No need to do anything else as the UI has already been restored
                return
              }
              
              // This is an actual error from the backend - restore UI state
              console.log('Kanban: Backend error during assignee change, restoring UI state -------------')
              console.log('Kanban: Restoring original state on undo', originalState)
              // Use set() directly instead of setColumns() to avoid stale closure issues
              setTimeout(() => {
                set({ columns: originalState.columns })
              }, 100)
              
              // The error toast will be shown by persistTaskAssigneeChange method
              return
            }
          } else if (viewType === 'client') {
            // Client view doesn't allow column changes
            logger.warn('Kanban: Cannot change client in client view')
            showToast('Error', 'Cannot reassign task to another client', 'error')
            return
          }
        } else if (dragSourceIndex !== dragTargetIndex && dragSourceIndex !== null && dragTargetIndex !== null) {
          // Same column, different position - reorder
          
          // First update the UI - reorder the task in the column
          const data = await get().reorderTask(dragSourceColumn, dragSourceIndex, dragTargetIndex)
          
          // Create a promise that will resolve after the toast timeout or reject if undo is clicked
          const toastPromise = createToastWithUndo(
            `Task #${data.task_id} reordered in column ${data.column_name}`,
            () => {
              // Restore original state on undo
              setColumns(originalState.columns)
              
              // We don't need to do anything else with drag state since it was already reset
            }
          )
          
          try {
            // Wait for the toast timeout or undo action
            await toastPromise
          
            // If we get here, the user didn't undo, so the reorder is already done
            // Now persist the changes to the backend if in assignee view
            const { viewType } = get()
            if (viewType === 'assignee') {
              const column = get().columns.find(col => col.id === dragSourceColumn)
              if (column) {
                await get().persistTaskOrderChange(dragSourceColumn, column.tasks)
              }
            }
          
            // Log success
            logger.info(`Kanban: Reordered task ${draggedTask.id} in ${dragSourceColumn}`)
          } catch (error) {
            // User clicked undo or there was another error
            logger.info('Kanban: Reorder was cancelled by user')
            // No need to do anything else as the UI has already been restored
            return
          }
        }
      } catch (error) {
        logger.error('Kanban: Error in endDrag', error)
        // If there's an error, restore the original state
        setColumns(originalState.columns)
        
        // Show error toast
        const showUndoToast = useGlobalStore.getState().showUndoToast
        showUndoToast(`Failed to apply changes. Original state restored.`)
      }
    },
    
    // Cancel dragging without applying changes
    cancelDrag: () => {
      // Commented out to reduce console noise during dragging
      // logger.info('Kanban: Cancel dragging')
      resetDragState()
    },
    
    // Move a task between columns or positions
    moveTask: (taskId: string, sourceColumnId: number, targetColumnId: number, sourceIndex: number, targetIndex: number) => {
      const { columns } = get()
      
      // Find source and target columns
      const sourceColumn = columns.find(col => col.id === sourceColumnId)
      const targetColumn = columns.find(col => col.id === targetColumnId)
      
      if (!sourceColumn || !targetColumn) {
        logger.warn('Kanban: Cannot move task, column not found', {
          sourceColumnFound: !!sourceColumn,
          targetColumnFound: !!targetColumn
        })
        return
      }
      
      // Get the task to move
      const task = sourceColumn.tasks[sourceIndex]
      
      if (!task) {
        logger.warn('Kanban: Cannot move task, task not found')
        return
      }
      
      // Create new arrays to avoid mutating the original state
      const newColumns = columns.map(col => {
        if (col.id === sourceColumnId) {
          // Remove task from source column
          return {
            ...col,
            tasks: col.tasks.filter((_, index) => index !== sourceIndex)
          }
        }
        
        if (col.id === targetColumnId) {
          // Add task to target column at the target index
          const newTasks = [...col.tasks]
          newTasks.splice(targetIndex, 0, {...task})
          return {
            ...col,
            tasks: newTasks
          }
        }
        
        return col
      })
      
      set({ columns: newColumns })
      
      // Log the task movement
      logger.info(`Kanban: Moved task ${taskId} from ${sourceColumnId} to ${targetColumnId}`)
    },
    
    // Reorder task within a column
    reorderTask: (columnId: number, oldIndex: number, newIndex: number) => {
      const { columns, viewType } = get();
      
      // Find the column
      const column = columns.find(col => col.id === columnId);
      if (!column) {
        logger.warn('Kanban: Cannot reorder task, column not found');
        return;
      }
      
      // Get the task being moved
      const task = column.tasks[oldIndex];
      if (!task) {
        logger.warn('Kanban: Cannot reorder task, task not found');
        return;
      }
      
      // Create a new tasks array with the task reordered
      const newTasks = [...column.tasks];
      newTasks.splice(oldIndex, 1); // Remove from old position
      newTasks.splice(newIndex, 0, {...task}); // Insert at new position
      
      // Update the assignee_order values for all affected tasks
      // This ensures consistent sorting without needing to fetch from server
      if (viewType === 'assignee') {
        // Recalculate order for all tasks in this column
        newTasks.forEach((t, index) => {
          // Use index * 10 to leave room for future insertions
          t.assignee_order = index * 10;
        });
      }
      
      // Create new array of columns
      const newColumns = columns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: newTasks
          };
        }
        return col;
      });
      
      // Update the state
      set({ columns: newColumns });
      
      // Log the reordering with more specific information
      if (viewType === 'assignee') {
        logger.info(`Kanban: Reordered task ${task.id} in assignee column ${columnId} from position ${oldIndex} to ${newIndex}`);
      } else {
        // Log the reordering for non-assignee views
        logger.info(`Kanban: Reordered task in column ${columnId} from position ${oldIndex} to ${newIndex}`);
      }

      const column_name = columns.find(col => col.id === columnId)?.title
      return { task_id: task.id, column_name: column_name }
    },
    
    // Helper methods for UI updates without API calls
    // Update task status in UI only (no API call)
    updateTaskStatusInUI: (taskId: string, newStatusId: number) => {
      const { columns } = get()
      
      // Find the task in the columns
      let task: Task | undefined
      let columnIndex = -1
      let taskIndex = -1
      let targetColumnIndex = -1
      
      // Find the task and its location
      columns.forEach((column, colIdx) => {
        const idx = column.tasks.findIndex(t => t.id.toString() === taskId)
        if (idx !== -1) {
          task = column.tasks[idx]
          columnIndex = colIdx
          taskIndex = idx
        }
        if (column.id === newStatusId) {
          targetColumnIndex = colIdx
        }
      })

      const target_column = columns.find(col => col.id === newStatusId)
      
      // If task not found, return
      if (!task) {
        logger.warn(`Kanban: Task with id ${taskId} not found`)
        return columns
      }
      
      // Create a safe copy of the task with the updated status
      const updatedTask: Task = {
        ...task,
        status: {
          ...task.status,
          name: target_column?.title || task.status.name
        }
      }
      
      // Create new columns array with the task moved
      const newColumns = [...columns]
      
      // Remove task from current column
      if (columnIndex !== -1 && taskIndex !== -1) {
        newColumns[columnIndex].tasks.splice(taskIndex, 1)
      }
      
      // Add task to the target column
      newColumns[targetColumnIndex].tasks.push(updatedTask)
      
      // Update state
      set({ columns: newColumns })
      
      return target_column 
    },

    // Update task assignee in UI only (no API call)
    updateTaskAssigneeInUI: (taskId: string, newAssigneeId: number) => {
      const { columns } = get()
      
      // Find the task in the columns
      let task: Task | undefined
      let columnIndex = -1
      let taskIndex = -1
      let target_column: KanbanColumnData | undefined
      let targetColumnIndex = -1
      
      // Find the task and its location
      columns.forEach((column, colIdx) => {
        const idx = column.tasks.findIndex(t => t.id.toString() === taskId)
        if (idx !== -1) {
          task = column.tasks[idx]
          columnIndex = colIdx
          taskIndex = idx
        }
        if (column.id === newAssigneeId) {
          targetColumnIndex = colIdx
        }
      })

      target_column = columns.find(col => col.id === newAssigneeId)
      
      // If task not found, return
      if (!task) {
        logger.warn(`Kanban: Task with id ${taskId} not found`)
        return columns
      }
      
      // Parse the assignee name to get first and last name
      const nameParts = target_column?.title.split(' ')
      const firstName = nameParts?.[0] || ''
      const lastName = nameParts?.slice(1).join(' ') || ''
      
      // Create a new agent object or null based on the assignee name
      const newAgent: User | null = target_column?.title === 'Unassigned' 
        ? null 
        : {
            id: newAssigneeId,
            first_name: firstName,
            last_name: lastName,
            // Add required fields from User interface with default values
            email: task.agent ? task.agent.email : '',
            phone_number: task.agent ? task.agent.phone_number : '',
            address: task.agent ? task.agent.address : '',
            client_id: task.agent ? task.agent.client_id : null,
            client: task.agent && task.agent.client ? task.agent.client : {} as Client,
            created_at: task.agent ? task.agent.created_at : new Date().toISOString(),
            updated_at: task.agent ? task.agent.updated_at : new Date().toISOString(),
            role_id: task.agent ? task.agent.role_id : 0,
            role: task.agent && task.agent.role ? task.agent.role : {} as Role,
            is_user_vip: task.agent ? task.agent.is_user_vip : false
          }
      
      // Create a safe copy of the task with the updated agent
      const updatedTask: Task = {
        ...task,
        agent: newAgent as User // Type assertion to satisfy the non-null requirement
      }
      
      // Create new columns array with the task moved
      const newColumns = [...columns]
      
      // Remove task from current column
      if (columnIndex !== -1 && taskIndex !== -1) {
        newColumns[columnIndex].tasks.splice(taskIndex, 1)
      }
      
      // If target column doesn't exist, create it
      if (targetColumnIndex === -1) {
        newColumns.push({
          id: target_column?.id || 0,
          title: target_column?.title || 'Unassigned',
          tasks: []
        });
        targetColumnIndex = newColumns.length - 1;
      }
      
      // Add task to the target column
      newColumns[targetColumnIndex].tasks.push(updatedTask)
      
      // Update state
      set({ columns: newColumns })
      
      return target_column
    },
    
    // Persist task status change to the backend
    persistTaskStatusChange: async (taskId: string, newStatusId: number) => {
      const { columns, setRefreshing } = get()
      let task: Task | undefined

      const target_column = columns.find(col => col.id === newStatusId)

      try {
        setRefreshing(true)
        logger.info(`Kanban: Persisting task ${taskId} status change to ${target_column?.title}`)
        
        // Show updating toast
        showToast(
          'Ongoing task update...', 
          `Updating task #${taskId} status to ${target_column?.title}...`,
          'info',
          3000
        );
        
        // Find the task
        columns.forEach(column => {
          const foundTask = column.tasks.find(t => t.id.toString() === taskId)
          if (foundTask) task = foundTask
        })
        
        if (!task) {
          logger.warn(`Kanban: Task with id ${taskId} not found for persistence`)
          showToast(
            'Update Failed',
            `Task #${taskId} not found`,
            'error'
          );
          return
        }
        
        // Use the target column ID as the new status ID
        const newStatusId = target_column?.id || 0;
        
        // Get current user ID from session store
        const currentUser = useSessionStore.getState().user;
        const currentUserId = currentUser?.id || 0;
        
        // Prepare activity data
        const now = new Date();
        const formData = new FormData();
        formData.append('content', `Status changed to "${target_column?.title || ''}" through kanban`);
        formData.append('activity_type_id', TicketActivityType.PrivateNote.toString());
        formData.append('status_id', newStatusId.toString());
        formData.append('agent_id', currentUserId.toString());
        formData.append('ticket_id', task.id.toString());
        formData.append('date_start', now.toISOString());
        formData.append('date_end', now.toISOString());
        formData.append('time_elapse', '0');

        // Create the activity using the service function
        const response = await createActivity({
          data: formData,
          isEmail: false
        });
        
        if (response.status !== 200) {
          throw new Error(response.message || 'Failed to create activity');
        }
        
        // Show success toast
        showToast(
          'Status Updated',
          `Task #${taskId} status changed to ${target_column?.title || ''} successfully`,
          'success'
        );
        
        logger.info(`Kanban: Successfully persisted task ${taskId} status change to ${target_column?.title || ''}`);
        return response;
      } catch (error) {
        // Show error toast
        showToast(
          'Update Failed',
          `Failed to update task status: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
        
        logger.error(`Kanban: Error persisting task ${taskId} status change`, error);
        throw error;
      } finally {
        setRefreshing(false)
      }
    },
  
    // Persist task assignee change to the backend
    persistTaskAssigneeChange: async (taskId: string, newAssigneeId: number) => {
      const { columns, setTaskLoading, setRefreshing } = get()
      let task: Task | undefined

      const target_column = columns.find(col => col.id === newAssigneeId)

      try {
        // Set loading state for this task
        setTaskLoading(taskId, true)
        setRefreshing(true)
        
        logger.info(`Kanban: Persisting task ${taskId} assignee change to ${target_column?.title || ''}`)
        
        // Show updating toast
        showToast(
          'Updating Task Assignee',
          `Updating task #${taskId} assignee to ${target_column?.title || ''}...`,
          'info',
          3000
        );
        
        // Find the task
        columns.forEach(column => {
          const foundTask = column.tasks.find(t => t.id.toString() === taskId)
          if (foundTask) task = foundTask
        })
        
        if (!task) {
          logger.warn(`Kanban: Task with id ${taskId} not found for persistence`)
          showToast(
            'Update Failed',
            `Task #${taskId} not found`,
            'error'
          );
          return
        }
        
        // Get current user ID from session store
        const currentUser = useSessionStore.getState().user;
        const currentUserId = currentUser?.id || 0;
        
        // Prepare activity data
        const now = new Date();
        const formData = new FormData();
        formData.append('content', `Reassigned to "${target_column?.title || ''}" through kanban`);
        formData.append('activity_type_id', TicketActivityType.Reassign.toString());
        formData.append('agent_id', currentUserId.toString());
        formData.append('ticket_id', task.id.toString());
        formData.append('status_id', task.status.id.toString());
        formData.append('date_start', now.toISOString());
        formData.append('date_end', now.toISOString());
        formData.append('time_elapse', '0');
        formData.append('assigned_to', newAssigneeId.toString());
        
        // Create the activity using the service function
        const response = await createActivity({
          data: formData,
          isEmail: false
        });
        
        if (response.status !== 200) {
          throw new Error(response.message || 'Failed to create activity');
        }
        
        // Show success toast
        showToast(
          'Assignee Updated',
          `Task #${taskId} assignee changed to ${target_column?.title || ''} successfully`,
          'success'
        );
        
        logger.info(`Kanban: Successfully persisted task ${taskId} assignee change to ${target_column?.title || ''}`);
        return response;
      } catch (error) {
        
        // Enhanced error handling with specific error types
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        let toastTitle = 'Assignment Failed';
        let toastMessage = `Failed to update task assignee: ${errorMessage}`;
        
        // Check for specific error types and provide better messages
        if (errorMessage.toLowerCase().includes('limit reached') || errorMessage.toLowerCase().includes('3/3 tasks')) {
          toastTitle = 'Assignment Limit Reached';
          toastMessage = `Cannot assign task to ${target_column?.title || 'user'}: ${errorMessage}`;
        } else if (errorMessage.toLowerCase().includes('limit') || errorMessage.toLowerCase().includes('maximum')) {
          toastTitle = 'Assignment Limit Exceeded';
          toastMessage = `Cannot assign task to ${target_column?.title || 'user'}: Assignment limit exceeded. Please check user's current workload.`;
        } else if (errorMessage.toLowerCase().includes('permission')) {
          toastTitle = 'Permission Denied';
          toastMessage = `You don't have permission to assign tasks to ${target_column?.title || 'this user'}.`;
        } else if (errorMessage.toLowerCase().includes('not found')) {
          toastTitle = 'User Not Found';
          toastMessage = `The selected assignee (${target_column?.title || 'user'}) could not be found.`;
        } else if (errorMessage.toLowerCase().includes('inactive') || errorMessage.toLowerCase().includes('disabled')) {
          toastTitle = 'User Unavailable';
          toastMessage = `Cannot assign task to ${target_column?.title || 'user'}: User account is inactive or disabled.`;
        } else if (errorMessage.toLowerCase().includes('validation')) {
          toastTitle = 'Validation Error';
          toastMessage = `Assignment validation failed: ${errorMessage}`;
        } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('timeout')) {
          toastTitle = 'Connection Error';
          toastMessage = 'Failed to update assignment due to network issues. Please try again.';
        }
        
        // Show specific error toast
        showToast(toastTitle, toastMessage, 'error');
        console.log('persistTaskStatusChange -------------')
        // Re-throw error to maintain error handling chain
        throw error;
      } finally {
        setTaskLoading(taskId, false)
        // Small delay to ensure smooth UX
        setTimeout(() => setRefreshing(false), 100)
      }
    },
  
    // Persist task order changes to the backend
    persistTaskOrderChange: async (assigneeId: number, orderedTasks: Task[]) => {
      const { setRefreshing } = get()
      
      try {
        setRefreshing(true)
        // Get socket ID for the current user to prevent echoing
        const socket = io();
        const socketId = socket.id;
        
        // Calculate new order values for all tasks
        const tasksWithUpdatedOrder = orderedTasks.map((task, index) => ({
          id: task.id,
          assignee_order: index * 10 // Use increments of 10 to allow for future insertions
        }));
        
        // Call the service method to update the order in the backend
        const response = await bulkUpdateTaskOrder(
          assigneeId,
          tasksWithUpdatedOrder,
          socketId
        );
        
        if (response.status !== 200 && response.status !== 201) {
          throw new Error(response.message || 'Failed to update task order');
        }
        
        showToast(
          'Order Updated',
          `Successfully updated tasks order under assignee ${orderedTasks[0].agent.first_name}`,
          'success'
        );

        logger.info(`Kanban: Successfully updated order for ${orderedTasks.length} tasks under assignee ${assigneeId}`);
        return response;
      } catch (error) {
        logger.error('Kanban: Error persisting task order', error);
        // Show an error toast
        showToast('Error', 'Failed to update task order', 'error');
        throw error;
      } finally {
        setRefreshing(false)
      }
    }
  }
})
