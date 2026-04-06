'use client'

import { TaskListItemSkeleton } from './TaskListItemSkeleton'

interface TaskListSkeletonProps {
  count?: number
}

export function TaskListSkeleton({ count = 10 }: TaskListSkeletonProps) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <TaskListItemSkeleton key={i} />
      ))}
    </div>
  )
}
