import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface KanbanCardSkeletonProps {
  compact?: boolean
  className?: string
}

export function KanbanCardSkeleton({ compact = false, className }: KanbanCardSkeletonProps) {
  if (compact) {
    return (
      <div className={cn(
        "p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
        "border border-gray-100 dark:border-gray-700 flex flex-col gap-2 relative overflow-hidden",
        "border-l-4 border-l-gray-300 dark:border-l-gray-600 animate-pulse",
        className
      )}>
        {/* Top Section - ID, Type, Icons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          
          <div className="flex gap-1 items-center">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
        
        {/* Summary and Action Button */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
      "border border-gray-100 dark:border-gray-700 flex flex-col gap-2 relative overflow-hidden",
      "border-l-4 border-l-gray-300 dark:border-l-gray-600 animate-pulse",
      className
    )}>
      {/* Top Section - ID & Type */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-12" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
      
      {/* Summary */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
      
      {/* Bottom Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>
    </div>
  )
}
