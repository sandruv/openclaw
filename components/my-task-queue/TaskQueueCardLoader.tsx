import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface TaskQueueCardLoaderProps {
  className?: string
}

export function TaskQueueCardLoader({ className }: TaskQueueCardLoaderProps) {
  return (
    <div className={cn("p-3 cursor-pointer border border-gray-100 dark:border-gray-800 rounded-md", className)}>
      <div className="space-y-2">
        <div className="flex items-center space-x-2 justify-between">
          <div className="flex space-x-2">
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-4 w-5" />
          </div>
          
          <div className="flex space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-[90%]" />
        </div>
      </div>
    </div>
  )
}

export default TaskQueueCardLoader
