'use client'

import { ReactNode, useRef, useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { KanbanColumnProps } from '@/types/kanban'
import { useDrop } from 'react-dnd'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { useTasksStore } from '@/stores/useTasksStore'
import { throttle } from 'lodash'
import { useToast } from '@/components/ui/toast-provider'
import { Spinner } from '@/components/ui/spinner'

export function KanbanColumn({ 
  id, 
  title, 
  headerColor, 
  count, 
  children,
  viewType
}: KanbanColumnProps) {
  const updateDragPosition = useKanbanStore(state => state.updateDragPosition)
  const draggedTask = useKanbanStore(state => state.draggedTask)
  const dragSourceColumn = useKanbanStore(state => state.dragSourceColumn)
  const { showToast } = useToast()
  // Create refs for the column and scrollable container
  const ref = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // State for load more functionality
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(true)
  const [page, setPage] = useState(1)
  
  // Create a throttled function inside useCallback to preserve the cancel method
  const throttledUpdatePosition = useCallback(() => {
    // Create the throttled function
    const throttledFn = throttle((colId: number, idx: number) => {
      if (draggedTask) {
        updateDragPosition(colId, idx)
      }
    }, 10)
    
    // Return both the function and its cancel method
    return {
      fn: throttledFn,
      cancel: throttledFn.cancel
    }
  }, [updateDragPosition, draggedTask])()

  // Cleanup throttled function on unmount
  useEffect(() => {
    return () => {
      if (throttledUpdatePosition && throttledUpdatePosition.cancel) {
        throttledUpdatePosition.cancel()
      }
    }
  }, [throttledUpdatePosition])
  
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'KANBAN_CARD',
    canDrop: () => {
      // In client view, can only reorder within the same column
      if (viewType === 'client' && dragSourceColumn !== id) {
        return false
      }

      return true
    },
    hover: () => {
      // When hovering over a column, throttle the position updates
      if (throttledUpdatePosition && throttledUpdatePosition.fn) {
        throttledUpdatePosition.fn(id, 0)
      }
    },
    drop: () => {
      // Column drop is handled by the card's drop handler
      // This is just a fallback if dropped on empty space
      return { columnId: id, index: 0 }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })
  
  // Apply drop ref to our element ref
  drop(ref)
  
  // Load more tasks for this specific column
  const loadMoreTasks = useCallback(async () => {
    if (!canLoadMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      // Use the TasksStore to fetch more tasks for this column
      const { loadMoreTasks } = useTasksStore.getState();
      
      // Set the page in pagination state (would need to be added to store)
      // For now we'll just fetch tasks with the current filters
      await loadMoreTasks();
    } catch (error) {
      console.error('Error loading more tasks for column:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load more tasks',
        type: 'error'
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [canLoadMore, isLoadingMore, showToast]);

  // Handle scroll event to detect when user has reached the bottom
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore || !canLoadMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If user has scrolled to the bottom (with a threshold of 50px)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreTasks();
    }
  }, [isLoadingMore, canLoadMore, loadMoreTasks]);
  
  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // Apply styles based on drag state
  const columnStyle = cn(
    "flex flex-col w-80 bg-gray-200 dark:bg-gray-900 rounded-md shadow",
    isOver && canDrop && "ring-2 ring-green-500 ring-opacity-50",
    isOver && !canDrop && "ring-2 ring-red-500 ring-opacity-50"
  )

  return (
    <div className={columnStyle} ref={ref}>
      <div className={cn(
        "px-4 py-2 rounded-t-md flex justify-between items-center",
        headerColor
      )}>
        <h3 className="font-medium text-white/80 dark:text-black/80">{title}</h3>
        <span className="bg-white/20 text-white/80 dark:text-black/80 text-xs font-medium px-2 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div 
        ref={scrollContainerRef}
        className="py-1 flex-1 overflow-y-auto min-h-[calc(100vh-190px)] max-h-[calc(100vh-190px)] styled-scrollbar"
      >
        {children}
        {isLoadingMore && (
          <div className="flex justify-center items-center p-2">
            <Spinner size="sm" />
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}
        {!canLoadMore && count > 0 && (
          <div className="text-center p-2 text-sm text-gray-500">
            No more tasks to load
          </div>
        )}
      </div>
    </div>
  )
}
