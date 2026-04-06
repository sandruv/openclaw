'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTasksStore } from '@/stores/useTasksStore'
import { TaskStatusTypeProvider, TaskStatusRecord, TaskStatusType } from '@/lib/taskStatusIdProvider'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useUserStore } from '@/stores/useUserStore'
import { pusherClient } from '@/lib/pusher-client'
import { KanbanColumnData } from '@/types/kanban'
import { KanbanBoard } from './subcomponents/KanbanBoard'
import { KanbanSkeleton } from './loaders/KanbanSkeleton'
import { Button } from '@/components/ui/button'
import { Task } from '@/types/tasks'
import { Header } from './sections/Header'
import { ComboboxOption } from '@/components/ui/combobox'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { groupTasks } from './helpers/kanban-grouping'
import { getBatchActiveTimers, BatchActiveTimerInfo } from '@/services/timerService'

export default function KanbanView() {
  const { tasks, fetchTasks, isLoading, error, pagination, setFilter, filters, search, setSearch } = useTasksStore()
  const { kanbanViewType, setKanbanViewType } = useSettingsStore()
  const currentUser = useUserStore((state) => state.user)
  const isRefreshing = useKanbanStore((state) => state.isRefreshing)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [statusesLoaded, setStatusesLoaded] = useState(false)
  const [allStatuses, setAllStatuses] = useState<TaskStatusRecord[]>([])
  const [activeTimers, setActiveTimers] = useState<Record<number, BatchActiveTimerInfo>>({})

  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Use the enhanced fetchTasks method that supports pagination and filters
        await fetchTasks(true)  // true to refresh/reset pagination
      } finally {
        // Mark initial load as complete regardless of success/failure
        setInitialLoadComplete(true)
      }
    }
    
    loadTasks()
  }, [fetchTasks])
  // Subscribe to Pusher channels for real-time updates
  useEffect(() => {
    // Subscribe to the general tasks channel
    const tasksChannel = pusherClient.subscribe('tasks-channel')

    // Handler for task:update events - selective update instead of full refresh
    const handleKanbanUpdate = (data?: any) => {
      if (data && data.task) {
        // Update specific task in place
        const updatedTasks = tasks.map((task: Task) => 
          task.id === data.task.id ? { ...task, ...data.task } : task
        )
        useTasksStore.setState({ tasks: updatedTasks })
      } else {
        // Fallback to full refresh only if no specific task data
        fetchTasks(true)
      }
    }

    // Handler for task:order-update events
    const handleOrderUpdate = (data: any) => {
      // Instead of refetching all tasks, update order properties directly
      if (!data || !data.tasks || !Array.isArray(data.tasks)) {
        return
      }
      
      // Create a map of task IDs to their new order values
      const orderMap = new Map()
      data.tasks.forEach((task: Task) => {
        if (task && task.id && task.assignee_order !== undefined) {
          orderMap.set(task.id, task.assignee_order)
        }
      })
      
      // Update tasks in place without triggering a refetch
      const updatedTasks = tasks.map((task: Task) => {
        if (orderMap.has(task.id)) {
          return { ...task, assignee_order: orderMap.get(task.id) }
        }
        return task
      })
      
      useTasksStore.setState({ tasks: updatedTasks })
    }

    // Handler for task creation/deletion - these need full refresh
    const handleTaskCreateDelete = () => {
      fetchTasks(true)
    }

    // Bind all event handlers
    tasksChannel.bind('task:update', handleKanbanUpdate)
    tasksChannel.bind('tasks:update', handleKanbanUpdate)
    tasksChannel.bind('task:create', handleTaskCreateDelete) 
    tasksChannel.bind('task:delete', handleTaskCreateDelete)
    tasksChannel.bind('task:order-update', handleOrderUpdate)

    return () => {
      // Unbind all event handlers and unsubscribe
      tasksChannel.unbind('task:update', handleKanbanUpdate)
      tasksChannel.unbind('tasks:update', handleKanbanUpdate)
      tasksChannel.unbind('task:create', handleTaskCreateDelete)
      tasksChannel.unbind('task:delete', handleTaskCreateDelete)
      tasksChannel.unbind('task:order-update', handleOrderUpdate)
      pusherClient.unsubscribe('tasks-channel')
    }
  }, [fetchTasks, tasks])

  // Listen for kanban reload requests from the store
  useEffect(() => {
    const handleKanbanReload = () => {
      // Remove setTimeout delay for immediate response
      fetchTasks(true)
    }

    window.addEventListener('kanban-reload-requested', handleKanbanReload)

    return () => {
      window.removeEventListener('kanban-reload-requested', handleKanbanReload)
    }
  }, [fetchTasks])
  
  // Fetch active timers for In Progress tasks
  const fetchActiveTimers = useCallback(async () => {
    // Get all In Progress task IDs
    const inProgressTaskIds = tasks
      .filter(task => task.status.id === TaskStatusType.InProgress)
      .map(task => task.id);

    if (inProgressTaskIds.length === 0) {
      setActiveTimers({});
      return;
    }

    try {
      const response = await getBatchActiveTimers(inProgressTaskIds);
      if (response.status === 200 && response.data) {
        setActiveTimers(response.data);
      }
    } catch (error) {
      console.error('Error fetching active timers:', error);
    }
  }, [tasks]);

  // Load statuses
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statusesResult = await TaskStatusTypeProvider.getAllStatuses()
        setAllStatuses(statusesResult)
      } catch (error) {
        console.error("Error loading statuses:", error)
      } finally {
        setStatusesLoaded(true)
      }
    }
    
    loadStatuses()
  }, [])

  // Fetch active timers when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      fetchActiveTimers();
    }
  }, [tasks, fetchActiveTimers])

  // Generate client options from tasks data
  const clientOptions = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return []
    
    const uniqueClients = new Map()
    tasks.forEach(task => {
      if (task.client && task.client.id) {
        uniqueClients.set(task.client.id, {
          value: task.client.id.toString(),
          label: task.client.name
        })
      }
    })
    
    return Array.from(uniqueClients.values()) as ComboboxOption[]
  }, [tasks])

  // Generate assignee options from tasks data
  const assigneeOptions = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return []
    
    const uniqueAssignees = new Map()
    tasks.forEach(task => {
      if (task.agent && task.agent.id) {
        const fullName = `${(task.agent.first_name || '').trim()} ${(task.agent.last_name || '').trim()}`.trim()
        uniqueAssignees.set(task.agent.id, {
          value: task.agent.id.toString(),
          label: fullName || 'Unknown User'
        })
      }
    })
    
    // Add unassigned option
    uniqueAssignees.set(0, {
      value: '0',
      label: 'Unassigned'
    })
    
    return Array.from(uniqueAssignees.values()) as ComboboxOption[]
  }, [tasks])

  // We no longer need extensive client-side filtering since we'll use the API's filtering capabilities
  // However, we'll keep a simplified version for any immediate filtering not handled by the API
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return []
    return [...tasks] // Fix array spread here
  }, [tasks])

  const groupedTasks = useMemo(() => {
    return groupTasks(filteredTasks, kanbanViewType, allStatuses)
  }, [filteredTasks, kanbanViewType, allStatuses])

  // Show skeleton only during initial loading, not during refresh operations
  if ((!initialLoadComplete && isLoading) || !statusesLoaded) {
    return <KanbanSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Error loading tasks</p>
        <Button onClick={() => fetchTasks()}>Retry</Button>
      </div>
    )
  }

  const handleFilterChange = (filterType: string, value: string) => {
    // Use the store's setFilter method which will trigger proper API calls
    setFilter(filterType, value)
    // Refresh tasks with the new filter
    fetchTasks(true)
  }

  const handleResetFilters = () => {
    // Use the store's resetFilters method
    useTasksStore.getState().resetFilters()
    // Refresh tasks after resetting filters
    fetchTasks(true)
  }

  const handleRefresh = () => {
    // Refresh tasks with current filters
    fetchTasks(true)
  }

  return (
    <div className="space-y-1">
      <Header 
        search={search}
        setSearch={(value) => {
          setSearch(value)
          // Refresh tasks when search changes
          fetchTasks(true)
        }}
        filters={filters}
        clients={clientOptions}
        assignees={assigneeOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onRefresh={handleRefresh}
      />
      
        <KanbanBoard 
          columns={Array.from(groupedTasks.values())} 
          viewType={kanbanViewType}
          isRefreshing={isRefreshing}
          activeTimers={activeTimers}
        />
    </div>
  )
}