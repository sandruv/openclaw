'use client'

import { STATUS_COLORS } from '@/constants/colors'
import { STATUS_ORDER } from '@/constants/kanban'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { KanbanBoardProps, KanbanColumnData } from '@/types/kanban'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import React, { useMemo } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { CustomDragLayer } from './CustomDragLayer'
import { stringify } from 'querystring'

export function KanbanBoard({ columns: initialColumns, viewType, isRefreshing = false, activeTimers = {} }: KanbanBoardProps) {
  // Initialize the Kanban store with columns and view type
  const setColumns = useKanbanStore(state => state.setColumns)
  const setViewType = useKanbanStore(state => state.setViewType)
  const storeColumns = useKanbanStore(state => state.columns)
  const { compactMode } = useSettingsStore()
  
  // Update store when props change
  React.useEffect(() => {
    setColumns(initialColumns)
    setViewType(viewType)
  }, [initialColumns, viewType, setColumns, setViewType])
  
  // Get color for column header based on view type
  const getColumnHeaderColor = (column: KanbanColumnData) => {
    if (viewType === 'status') {
      const statusKey = column.title.toLowerCase() as keyof typeof STATUS_COLORS
      return STATUS_COLORS[statusKey] || 'bg-gray-200 dark:bg-gray-700'
    }
    return 'bg-gray-700 dark:bg-gray-200'
  }

  // Use columns from the store instead of props to ensure UI updates when store changes
  const columnsToRender = storeColumns.length > 0 ? storeColumns : initialColumns

  // Memoize column sorting to prevent unnecessary resort on every render
  const sortedColumns = useMemo(() => {
    const columns = [...columnsToRender].sort((a, b) => {
      if (viewType === 'status') {
        // Sort by status priority using centralized STATUS_ORDER
        const aStatus = a.title.toLowerCase()
        const bStatus = b.title.toLowerCase()
        return (STATUS_ORDER[aStatus] || 99) - (STATUS_ORDER[bStatus] || 99)
      }
      
      if (viewType === 'assignee') {
        // Unassigned (id: 0) always comes first
        if (a.id === 0) return -1
        if (b.id === 0) return 1
        
        // Sort other assignees alphabetically
        return a.title.localeCompare(b.title)
      }
      
      return a.title.localeCompare(b.title)
    })
    return columns
  }, [columnsToRender, viewType])

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Add the custom drag layer component */}
      <CustomDragLayer />
      
      <div className="relative overflow-x-auto styled-scrollbar">
        {/* Subtle refresh loading indicator - non-blocking */}
        {isRefreshing && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200 dark:border-gray-600">
              <div className="animate-spin rounded-full h-2 w-2 border border-blue-500 border-t-transparent" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Syncing...</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 p-4 min-w-max" style={{ paddingBottom: 0 }}>
          {sortedColumns.map((column) => (
            <KanbanColumn 
              key={column.id}
              id={column.id}
              title={column.title}
              headerColor={getColumnHeaderColor(column)}
              count={column.tasks.length}
              viewType={viewType}
            >
              {column.tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  columnId={column.id}
                  activeSeconds={activeTimers[task.id]?.elapsedSeconds}
                />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </div>
    </DndProvider>
  )
}
