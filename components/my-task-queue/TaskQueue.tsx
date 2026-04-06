'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TaskQueueCard } from './TaskQueueCard'
import { cn } from '@/lib/utils'
import { ListTodo, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { getTaskQueue } from '@/services/taskService'
import pusherService from '@/services/pusherService'
import TaskQueueCardLoader from './TaskQueueCardLoader'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { IndeterminateProgress } from "@/components/custom/IndeterminateProgress"
import { useLoader } from '@/contexts/LoaderContext'

interface TaskQueueProps {
  collapsed: boolean
  className?: string
}

export function TaskQueue({ collapsed, className }: TaskQueueProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newTaskCount, setNewTaskCount] = useState(0)
  const router = useRouter()
  const { setIsLoading: setRouteLoading } = useLoader()

  const handleViewAllTasks = () => {
    setRouteLoading(true) // Show loader immediately
    router.push('/tasks')
  }
  const { user } = useAuth()

  // Function to fetch assigned tasks - memoized with useCallback to maintain reference stability
  const fetchAssignedTasks = useCallback(async (isUpdate = false) => {
    if (isUpdate) {
      setUpdating(true)
    } else {
      setLoading(true)
    }
    try {
      const response = await getTaskQueue()
      
      if (response && response.data) {
        // Transform the tasks data to match the expected shape in TaskCard
        const formattedTasks = response.data.map((task: any) => {
          return {
            ...task,
            // Map agent data to include name if it exists
            agent: task.agent ? {
              id: task.agent.id,
              name: `${task.agent.first_name} ${task.agent.last_name}`,
              // Use null for avatar_url since it doesn't exist on the User type
              avatar_url: null,
              initials: `${task.agent.first_name?.[0] || ''}${task.agent.last_name?.[0] || ''}`
            } : null
          }
        })
        
        // Get today's date at midnight for comparison
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // Count tasks created today
        const todaysTaskCount = formattedTasks.filter((task: any) => {
          // Convert task.created_at to Date object
          const createdAt = new Date(task.created_at)
          return createdAt >= today && task.status.id === TaskStatusType.New
        }).length
        
        // Set the count of today's new tasks
        setNewTaskCount(todaysTaskCount)
        
        setTasks(formattedTasks)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error('Error fetching task queue:', error)
    } finally {
      setLoading(false)
      setUpdating(false)
    }
  }, [])

  // Reference to store the unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Subscribe to Pusher events when the component mounts or user changes
  useEffect(() => {
    // Only subscribe if we have a user
    if (user?.id) {
      const handleTaskUpdate = (data: any) => {
        // Check if data and data.data exist
        if (!data || !data.data) {
          return
        }
        
        // Simply refresh the task list
        // The new task count will be calculated in fetchAssignedTasks
        fetchAssignedTasks(true)
      }

      // Subscribe to the tasks-channel and task:update event using pusherService
      unsubscribeRef.current = pusherService.subscribeToTaskUpdates(handleTaskUpdate)

      // Return cleanup function
      return () => {        
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }
      }
    }
  }, [user?.id, fetchAssignedTasks])

  // Initial fetch on component mount or when user changes
  useEffect(() => {
    setTimeout(() => {
      fetchAssignedTasks()
    }, 500)
  }, [fetchAssignedTasks])
  
  // Toggle the task queue open/closed state
  const handleToggleOpen = () => {
    // We don't need to reset the count as it's always showing today's tasks
    setIsOpen(!isOpen)
  }

  // Handle manual refresh
  const handleRefresh = () => {
    fetchAssignedTasks(true)
  }
  
  // Don't show the component if there are no tasks and it's not loading
  if (!loading && tasks.length === 0) return null
  
  return (
    <div className={cn("mt-7 mb-2", className)}>
      <div className={cn(
        "bg-gray-50 dark:bg-gray-800/50 rounded-md overflow-hidden",
        !collapsed ? "mx-2" : "mx-0"
      )}>
        <div className={cn(
          "flex items-center mt-1 py-1 px-2 h-auto justify-start",
          collapsed && "px-0 justify-center",
          !collapsed && "justify-between"
        )}>
          <div className="relative">
            <ListTodo className="h-4 w-4" />
            {newTaskCount > 0 && collapsed && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {newTaskCount}
              </Badge>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-2">
              {newTaskCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {newTaskCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={updating || loading}
                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <RefreshCw className={cn(
                  "h-3 w-3",
                  (updating || loading) && "animate-spin"
                )} />
              </Button>
            </div>
          )}
        </div>

        {isOpen && (
          <div className={cn(
            "transition-all duration-200",
            isOpen ? "animate-accordion-down" : "animate-accordion-up"
          )}>
            {/* Show linear progress when updating */}
            {updating && !loading && <IndeterminateProgress />}
            
            {loading ? (
              <div className="p-2 space-y-2 max-h-[calc(100vh-400px)] min-h-[200px]">
                {/* Show multiple skeleton loaders for better UX */}
                <TaskQueueCardLoader />
                <TaskQueueCardLoader />
                <TaskQueueCardLoader />
                <TaskQueueCardLoader />
                <TaskQueueCardLoader />
                <TaskQueueCardLoader />
                <TaskQueueCardLoader />
              </div>
            ) : (
              <ScrollArea className={cn(
                "max-h-[calc(100vh-400px)] min-h-[200px] overflow-auto styled-scrollbar",
                collapsed ? "p-1" : "p-2"
              )}>
                {/* Limit display to maximum 10 tasks */}
                {tasks.map(task => (
                  <TaskQueueCard 
                    collapsed={collapsed}
                    key={task.id} 
                    task={task} 
                  />
                ))}
                {tasks.length > 10 && (
                  <div className="text-xs text-muted-foreground text-center pt-1 pb-1">
                    +{tasks.length - 10} more tasks
                  </div>
                )}
                
                {/* {tasks.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-1"
                    onClick={handleViewAllTasks}
                  >
                    View all tasks
                  </Button>
                )} */}
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
