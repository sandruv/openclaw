import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ThreadSkeleton } from "./ThreadSkeleton"

export function ThreadColumnSkeleton() {
  return (
    <div>
      {/* Header Section */}
      <div className="border-b p-4">
        <div className="grid grid-cols-6">
          <div className="col-span-5 flex flex-wrap gap-2">
            {/* Action buttons */}
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
          <div className="col-span-1 flex justify-end">
            <Skeleton className="h-9 w-16" />
          </div>
        </div>

        {/* Task Header - matches Header.tsx structure */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-start md:space-x-4 md:space-y-0 mt-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-grow space-y-2">
            <div className="flex items-end gap-3">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-6 w-24 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col space-y-2 min-w-[190px]">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>

      {/* Thread Section */}
      <div className="space-y-0 bg-gray-100 dark:bg-black/90 relative">
        <ScrollArea className="px-2 flex-1 h-[calc(100vh-230px)]">
          <ThreadSkeleton />
        </ScrollArea>
      </div>
    </div>
  )
}
