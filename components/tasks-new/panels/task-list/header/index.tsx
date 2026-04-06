'use client'

import { Button } from '@/components/ui/button'
import { List, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskListFilters } from './filters'

interface TaskListHeaderProps {
  isMyTasksActive: boolean
  onAllTasksClick: () => void
  onMyTasksClick: () => void
  compactMode?: boolean
  filters: {
    status: string[]
    type: string[]
    priority: string[]
    impact: string[]
    [key: string]: any
  }
  onFilterChange: (filterKey: string, value: string) => void
  groupBy: 'none' | 'status' | 'assignee' | 'client' | 'priority' | 'impact' | 'type'
  onGroupByChange: (groupBy: 'none' | 'status' | 'assignee' | 'client' | 'priority' | 'impact' | 'type') => void
  onClearFilters: () => void
}

export function TaskListHeader({
  isMyTasksActive,
  onAllTasksClick,
  onMyTasksClick,
  compactMode = false,
  filters,
  onFilterChange,
  groupBy,
  onGroupByChange,
  onClearFilters,
}: TaskListHeaderProps) {
  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.type.length > 0 || 
    filters.priority.length > 0 || 
    filters.impact.length > 0 || 
    groupBy !== 'none'
  return (
    <div className="flex items-center justify-between dark:bg-gray-800 bg-gray-50 border-b dark:border-gray-700 border-gray-200">
      <div className="p-3 flex-1">
        <div className="flex items-center gap-2">
          <Button
            variant={!isMyTasksActive ? 'default' : 'outline'}
            size="sm"
            onClick={onAllTasksClick}
            className={cn('', 
              !isMyTasksActive && 'bg-green-600 text-white')}
          >
            <List className="h-4 w-4" />
            {!compactMode && <span className="">All</span>}
          </Button>
          <Button
            variant={isMyTasksActive ? 'default' : 'outline'}
            size="sm"
            onClick={onMyTasksClick}
            className={cn('', 
              isMyTasksActive && 'bg-green-600 text-white')}
          >
            <User className="h-4 w-4" />
            {!compactMode && <span className="">My Tasks</span>}
          </Button>
        </div>
      </div>
      <div className="pr-3 flex items-center gap-2">
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="h-4 w-4" />
            {!compactMode && <span className="ml-1">Clear</span>}
          </Button>
        )}
        <TaskListFilters
          filters={filters}
          onFilterChange={onFilterChange}
          groupBy={groupBy}
          onGroupByChange={onGroupByChange}
          compactMode={compactMode}
        />
      </div>
    </div>
  )
}
