import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ThreadSkeleton() {
  return (
    <div className="space-y-2">
      {/* Thread message entries */}
      {Array.from({ length: 4 }).map((_, i) => {
        const isClient = i % 2 === 1 // Alternate between client and agent messages
        
        return (
          <div 
            key={i} 
            className={cn(
              "mb-2 flex mt-2",
              isClient ? 'justify-start' : 'justify-end'
            )}
          >
            <div 
              className={cn(
                "rounded-lg p-4 w-[90%] border-gray-200 border",
                isClient
                  ? 'bg-purple-100 dark:bg-purple-900/50 dark:border-purple-800/50'
                  : 'bg-blue-50 dark:bg-blue-900/50 dark:border-blue-800/50'
              )}
            >
              {/* Avatar and Header Section */}
              <div className="flex items-center space-x-2 mb-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              
              {/* Content Section */}
              <div className="space-y-2 mt-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
