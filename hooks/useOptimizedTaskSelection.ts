'use client'

import { useCallback, useMemo } from 'react'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'

/**
 * Optimized hook for task selection with performance enhancements
 * Provides both regular and debounced selection methods
 */
export function useOptimizedTaskSelection() {
  // Get store methods
  const selectTask = useTaskSelectionStore((state) => state.selectTask)
  const selectTaskDebounced = useTaskSelectionStore((state) => state.selectTaskDebounced)
  const isTaskSelected = useTaskSelectionStore((state) => state.isTaskSelected)
  const getSelectionStats = useTaskSelectionStore((state) => state.getSelectionStats)
  const selectedTaskIds = useTaskSelectionStore((state) => state.selectedTaskIds)

  // Memoized selection stats to prevent unnecessary recalculations
  const selectionStats = useMemo(() => getSelectionStats(), [getSelectionStats, selectedTaskIds.size])

  // Optimized selection handler for regular use
  const handleSelectTask = useCallback((taskId: number, selected: boolean, isShiftClick?: boolean) => {
    selectTask(taskId, selected, isShiftClick)
  }, [selectTask])

  // Debounced selection handler for rapid selection changes
  const handleSelectTaskDebounced = useCallback((taskId: number, selected: boolean, isShiftClick?: boolean) => {
    selectTaskDebounced(taskId, selected, isShiftClick)
  }, [selectTaskDebounced])

  // Memoized task selection checker
  const checkTaskSelected = useCallback((taskId: number) => {
    return isTaskSelected(taskId)
  }, [isTaskSelected])

  return {
    // Selection methods
    selectTask: handleSelectTask,
    selectTaskDebounced: handleSelectTaskDebounced,
    isTaskSelected: checkTaskSelected,
    
    // Selection stats (memoized)
    selectionStats,
    selectedCount: selectionStats.selectedCount,
    isAllSelected: selectionStats.isAllSelected,
    isIndeterminate: selectionStats.isIndeterminate,
    
    // Raw selected IDs for direct access
    selectedTaskIds
  }
}
