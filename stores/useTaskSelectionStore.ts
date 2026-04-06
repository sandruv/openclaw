import { create } from 'zustand'
import { 
  mergeTasks as mergeTasksService, 
  archiveTasks as archiveTasksService,
  assignTasks as assignTasksService 
} from '@/services/bulkActionService'

// Define types for bulk actions
export type BulkActionType = 'archive' | 'merge' | 'assign'

export interface BulkActionResult {
  success: boolean
  message: string
  taskIds: number[]
}

export interface TaskSelectionState {
  selectedTaskIds: Set<number>
  mergeIntoTaskId: number | null
  lastSelectedId: number | null
  availableTaskIds: number[]
  taskIdToIndexMap: Map<number, number> // O(1) index lookup optimization
  selectedCount: number
  isAllSelected: boolean
  isIndeterminate: boolean
  debounceTimeoutId: NodeJS.Timeout | null // For debounced selections
}

interface TaskSelectionActions {
  setAvailableTaskIds: (taskIds: number[]) => void
  selectTask: (taskId: number, selected: boolean, isShiftClick?: boolean) => void
  selectTaskDebounced: (taskId: number, selected: boolean, isShiftClick?: boolean) => void
  setMergeIntoTaskId: (taskId: number | null) => void
  selectAllTasks: (selected: boolean) => void
  clearSelection: () => void
  isTaskSelected: (taskId: number) => boolean
  getSelectedTaskIds: () => number[]
  // Memoized selectors for better performance
  getSelectionStats: () => { selectedCount: number; isAllSelected: boolean; isIndeterminate: boolean }
  // Bulk actions
  archiveTasks: (taskIds?: number[]) => Promise<BulkActionResult>
  mergeTasks: (taskIds?: number[]) => Promise<BulkActionResult>
  assignTasks: (taskIds?: number[], assigneeId?: number) => Promise<BulkActionResult>
}

type TaskSelectionStore = TaskSelectionState & TaskSelectionActions

export const useTaskSelectionStore = create<TaskSelectionStore>((set, get) => ({
  // Initial state
  selectedTaskIds: new Set<number>(),
  mergeIntoTaskId: null,
  lastSelectedId: null,
  availableTaskIds: [],
  taskIdToIndexMap: new Map<number, number>(),
  selectedCount: 0,
  isAllSelected: false,
  isIndeterminate: false,
  debounceTimeoutId: null,
  setMergeIntoTaskId: (taskId: number | null) => {
    set((state) => {
      return {
        mergeIntoTaskId: taskId
      }
    })
  },
  // Actions
  setAvailableTaskIds: (taskIds: number[]) => {
    set((state) => {
      // Build index map for O(1) lookups
      const taskIdToIndexMap = new Map<number, number>()
      taskIds.forEach((taskId, index) => taskIdToIndexMap.set(taskId, index))
      
      const selectedCount = state.selectedTaskIds.size
      const isAllSelected = taskIds.length > 0 && selectedCount === taskIds.length
      const isIndeterminate = selectedCount > 0 && selectedCount < taskIds.length

      return {
        availableTaskIds: taskIds,
        taskIdToIndexMap,
        isAllSelected,
        isIndeterminate
      }
    })
  },

  selectTask: (taskId: number, selected: boolean, isShiftClick: boolean = false) => {
    set((state) => {
      const newSelectedTaskIds = new Set(state.selectedTaskIds)
      let newLastSelectedId = taskId
      
      if (isShiftClick && state.lastSelectedId !== null && state.availableTaskIds.length > 0) {
        // Use Map for O(1) index lookup instead of O(n) indexOf
        const lastIndex = state.taskIdToIndexMap.get(state.lastSelectedId)
        const currentIndex = state.taskIdToIndexMap.get(taskId)
        
        if (lastIndex !== undefined && currentIndex !== undefined) {
          // Determine the range to select
          const startIndex = Math.min(lastIndex, currentIndex)
          const endIndex = Math.max(lastIndex, currentIndex)
          
          // Apply the same selection state to all tasks in the range
          for (let i = startIndex; i <= endIndex; i++) {
            const id = state.availableTaskIds[i]
            if (selected) {
              newSelectedTaskIds.add(id)
            } else {
              newSelectedTaskIds.delete(id)
            }
          }
        }
      } else {
        // Regular selection logic
        if (selected) {
          newSelectedTaskIds.add(taskId)
        } else {
          newSelectedTaskIds.delete(taskId)
        }
      }

      // Calculate all derived state in one pass
      const selectedCount = newSelectedTaskIds.size
      const availableCount = state.availableTaskIds.length
      const isAllSelected = availableCount > 0 && selectedCount === availableCount
      const isIndeterminate = selectedCount > 0 && selectedCount < availableCount

      return {
        selectedTaskIds: newSelectedTaskIds,
        lastSelectedId: newLastSelectedId,
        selectedCount,
        isAllSelected,
        isIndeterminate
      }
    })
  },

  selectAllTasks: (selected: boolean) => {
    set((state) => {
      const newSelectedTaskIds = selected ? new Set(state.availableTaskIds) : new Set<number>()
      const selectedCount = newSelectedTaskIds.size
      const isAllSelected = selected && state.availableTaskIds.length > 0
      const isIndeterminate = false
      // When selecting all, there's no specific "last selected" item, so set to null
      const lastSelectedId = selected ? state.availableTaskIds[0] || null : null

      return {
        selectedTaskIds: newSelectedTaskIds,
        lastSelectedId,
        selectedCount,
        isAllSelected,
        isIndeterminate
      }
    })
  },

  clearSelection: () => {
    const state = get()
    
    // Clear any pending debounced selections
    if (state.debounceTimeoutId) {
      clearTimeout(state.debounceTimeoutId)
    }
    
    set({
      selectedTaskIds: new Set<number>(),
      lastSelectedId: null,
      selectedCount: 0,
      isAllSelected: false,
      isIndeterminate: false,
      debounceTimeoutId: null
    })
  },

  isTaskSelected: (taskId: number) => {
    return get().selectedTaskIds.has(taskId)
  },

  getSelectedTaskIds: () => {
    return Array.from(get().selectedTaskIds)
  },

  // Memoized selector to prevent recalculating selection stats
  getSelectionStats: () => {
    const state = get()
    return {
      selectedCount: state.selectedCount,
      isAllSelected: state.isAllSelected,
      isIndeterminate: state.isIndeterminate
    }
  },

  // Debounced selection for rapid selection changes
  selectTaskDebounced: (taskId: number, selected: boolean, isShiftClick: boolean = false) => {
    const state = get()
    
    // Clear existing timeout if any
    if (state.debounceTimeoutId) {
      clearTimeout(state.debounceTimeoutId)
    }
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      get().selectTask(taskId, selected, isShiftClick)
      // Clear the timeout ID after execution
      set({ debounceTimeoutId: null })
    }, 50) // 50ms debounce for responsive feel
    
    // Store the timeout ID
    set({ debounceTimeoutId: timeoutId })
  },

  // Bulk action implementations
  archiveTasks: async (taskIds?: number[]): Promise<BulkActionResult> => {
    const targetTaskIds = taskIds || get().getSelectedTaskIds()
    
    try {
      // Call the archiveTasksService from bulkActionService
      const response = await archiveTasksService(targetTaskIds)
      
      if (response.status === 200 && response.data) {
        // Clear selection after successful action
        get().clearSelection()
        
        return {
          success: true,
          message: response.data.message || `Successfully archived ${targetTaskIds.length} task${targetTaskIds.length !== 1 ? 's' : ''}`,
          taskIds: targetTaskIds
        }
      } else {
        return {
          success: false,
          message: response.message || 'Failed to archive tasks',
          taskIds: targetTaskIds
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to archive tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        taskIds: targetTaskIds
      }
    }
  },

  mergeTasks: async (taskIds?: number[]): Promise<BulkActionResult> => {
    const targetTaskIds = taskIds || get().getSelectedTaskIds()
    const mergeIntoTaskId = get().mergeIntoTaskId
    
    if (targetTaskIds.length < 2) {
      return {
        success: false,
        message: 'At least 2 tasks are required for merging',
        taskIds: targetTaskIds
      }
    }

    if (!mergeIntoTaskId) {
      return {
        success: false,
        message: 'Please select a target task to merge into',
        taskIds: targetTaskIds
      }
    }
    
    try {
      // Filter out the merge target from source tasks to avoid merging into itself
      const sourceTaskIds = targetTaskIds.filter(id => id !== mergeIntoTaskId)
      
      if (sourceTaskIds.length === 0) {
        return {
          success: false,
          message: 'No source tasks to merge (target task cannot be merged into itself)',
          taskIds: targetTaskIds
        }
      }

      const response = await mergeTasksService({
        targetTaskId: mergeIntoTaskId,
        sourceTaskIds: sourceTaskIds
      })
      
      if (response.status === 200) {
        // Clear selection after successful action
        get().clearSelection()
        
        return {
          success: true,
          message: `Successfully merged ${sourceTaskIds.length} task${sourceTaskIds.length !== 1 ? 's' : ''} into task #${mergeIntoTaskId}`,
          taskIds: targetTaskIds
        }
      } else {
        return {
          success: false,
          message: response.message || 'Failed to merge tasks',
          taskIds: targetTaskIds
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to merge tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        taskIds: targetTaskIds
      }
    }
  },

  assignTasks: async (taskIds?: number[], assigneeId?: number): Promise<BulkActionResult> => {
    const targetTaskIds = taskIds || get().getSelectedTaskIds()
    
    if (!assigneeId) {
      return {
        success: false,
        message: 'No assignee selected',
        taskIds: targetTaskIds
      }
    }
    
    try {
      // Call the assignTasksService with the selected assignee
      const response = await assignTasksService(targetTaskIds, assigneeId)
      
      if (response.status === 200 && response.data) {
        // Clear selection after successful action
        get().clearSelection()
        
        return {
          success: true,
          message: response.data.message || `Successfully assigned ${targetTaskIds.length} task${targetTaskIds.length !== 1 ? 's' : ''}`,
          taskIds: targetTaskIds
        }
      } else {
        return {
          success: false,
          message: response.message || 'Failed to assign tasks',
          taskIds: targetTaskIds
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to assign tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        taskIds: targetTaskIds
      }
    }
  }
}))
