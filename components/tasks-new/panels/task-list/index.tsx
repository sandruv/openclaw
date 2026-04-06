'use client'

import { useEffect, useMemo, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { useTasksStore } from '@/stores/useTasksStore'
import { useAuth } from '@/contexts/AuthContext'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { TaskListItem } from './item'
import { TaskListSkeleton } from '../../loaders/TaskListSkeleton'
import { TaskListHeader } from './header'
import { Task } from '@/types/tasks'
import { cn } from '@/lib/utils'

interface TaskListPanelProps {
  selectedId?: string
}

export function TaskListPanel({ selectedId }: TaskListPanelProps) {
  const { tasks, fetchTasks, isLoading, error, initialLoadComplete, filters, setFilter, setMyTasksSorting, groupBy, setGroupBy } = useTasksStore()
  const { user } = useAuth()
  const { compactMode } = useSettingsStore()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!initialLoadComplete) {
      fetchTasks()
    }
  }, [initialLoadComplete, fetchTasks])

  const isMyTasksActive = useMemo(() => {
    return !!(user && filters.assignee === user.id.toString())
  }, [filters.assignee, user])

  const handleMyTasksClick = () => {
    if (!user) return
    
    if (isMyTasksActive) {
      setFilter('assignee', '')
      setMyTasksSorting(false)
    } else {
      setFilter('assignee', user.id.toString())
      setMyTasksSorting(true)
    }
  }

  const handleAllTasksClick = () => {
    if (user && filters.assignee === user.id.toString()) {
      setFilter('assignee', '')
      setMyTasksSorting(false)
    }
  }

  const handleClearFilters = () => {
    // Clear all array filters
    setFilter('status', [])
    setFilter('type', [])
    setFilter('priority', [])
    setFilter('impact', [])
    // Reset groupBy to none
    setGroupBy('none')
  }

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'all': tasks }
    }

    const groups: Record<string, Task[]> = {}

    tasks.forEach(task => {
      let groupKey: string
      let groupLabel: string

      switch (groupBy) {
        case 'status':
          groupKey = task.status?.id?.toString() || 'unknown'
          groupLabel = task.status?.name || 'Unknown Status'
          break
        case 'assignee':
          groupKey = task.agent?.id?.toString() || 'unassigned'
          groupLabel = task.agent ? `${(task.agent.first_name || '').trim()} ${(task.agent.last_name || '').trim()}`.trim() || 'Unknown' : 'Unassigned'
          break
        case 'client':
          groupKey = task.client?.id?.toString() || 'unknown'
          groupLabel = task.client?.name || 'Unknown Client'
          break
        case 'priority':
          groupKey = task.priority?.id?.toString() || 'unknown'
          groupLabel = task.priority?.name || 'Unknown Priority'
          break
        case 'impact':
          groupKey = task.impact?.id?.toString() || 'unknown'
          groupLabel = task.impact?.name || 'Unknown Impact'
          break
        case 'type':
          groupKey = task.ticket_type?.id?.toString() || 'unknown'
          groupLabel = task.ticket_type?.name || 'Unknown Type'
          break
        default:
          groupKey = 'all'
          groupLabel = 'All Tasks'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(task)
    })

    return groups
  }, [tasks, groupBy])

  const getGroupLabel = (groupKey: string): string => {
    if (groupBy === 'none') return 'All Tasks'
    
    const firstTask = groupedTasks[groupKey]?.[0]
    if (!firstTask) return groupKey

    switch (groupBy) {
      case 'status':
        return firstTask.status?.name || 'Unknown Status'
      case 'assignee':
        return firstTask.agent ? `${(firstTask.agent.first_name || '').trim()} ${(firstTask.agent.last_name || '').trim()}`.trim() || 'Unknown' : 'Unassigned'
      case 'client':
        return firstTask.client?.name || 'Unknown Client'
      case 'priority':
        return firstTask.priority?.name || 'Unknown Priority'
      case 'impact':
        return firstTask.impact?.name || 'Unknown Impact'
      case 'type':
        return firstTask.ticket_type?.name || 'Unknown Type'
      default:
        return groupKey
    }
  }


  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading tasks</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            <Button 
              onClick={() => fetchTasks(true)} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-70px)]">
        <div className="border-b bg-background">
          <TaskListHeader
            isMyTasksActive={isMyTasksActive}
            onAllTasksClick={handleAllTasksClick}
            onMyTasksClick={handleMyTasksClick}
            compactMode={compactMode}
            filters={filters}
            onFilterChange={setFilter}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            onClearFilters={handleClearFilters}
          />
        </div>
        <ScrollArea className="flex-1">
          <TaskListSkeleton count={10} />
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)]">
      <div className="border-b bg-background">
        <TaskListHeader
          isMyTasksActive={isMyTasksActive}
          onAllTasksClick={handleAllTasksClick}
          onMyTasksClick={handleMyTasksClick}
          compactMode={compactMode}
          filters={filters}
          onFilterChange={setFilter}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          onClearFilters={handleClearFilters}
        />
      </div>

      <ScrollArea className="flex-1">
        {groupBy === 'none' ? (
          <div className="space-y-0">
            {tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                isSelected={task.id.toString() === selectedId}
                compactMode={compactMode}
              />
            ))}
          </div>
        ) : (
          <div>
            {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
              const isCollapsed = collapsedGroups.has(groupKey)
              const groupLabel = getGroupLabel(groupKey)
              
              return (
                <div key={groupKey}>
                  <button
                    onClick={() => toggleGroupCollapse(groupKey)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2",
                      "bg-muted/50 hover:bg-muted transition-colors",
                      "border-b border-border",
                      "text-sm font-medium text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span>{groupLabel}</span>
                      <span className="text-xs text-muted-foreground">({groupTasks.length})</span>
                    </div>
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0">
                      {groupTasks.map((task) => (
                        <TaskListItem
                          key={task.id}
                          task={task}
                          isSelected={task.id.toString() === selectedId}
                          compactMode={compactMode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
