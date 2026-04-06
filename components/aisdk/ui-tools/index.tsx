'use client'

import { useEffect } from 'react'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { TaskComponent } from './TaskComponent'

export function UITools() {
  const { task, getTaskById, isLoading } = useTaskDetailsStore()

  useEffect(() => {
    // Using a sample task ID for demo
    getTaskById('1')
  }, [getTaskById])

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-8 bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No task available
      </div>
    )
  }

  return (
    <div className="p-4">
      <TaskComponent task={task} />
    </div>
  )
}