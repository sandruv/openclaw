'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function TaskListItemSkeleton() {
  return (
    <div className="p-3 border-b">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          <Skeleton className="h-4 w-full" />
          
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-2 w-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
