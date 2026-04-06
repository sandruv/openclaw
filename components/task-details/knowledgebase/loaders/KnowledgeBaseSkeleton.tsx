import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

export function KnowledgeBaseSkeleton() {
  return (
    <div className="w-full">
      {/* Tabs skeleton - commented out in actual component but keeping structure */}
      {/* <div className="grid w-full grid-cols-2 border-b mb-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div> */}

      {/* AI Tab Content */}
      <div className="p-0">
        <ScrollArea className="h-[calc(100vh-70px)]">
          <div className="p-4 space-y-4">
            {/* AI Assistant Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* AI Response Cards */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`ai-skeleton-${i}`} className="space-y-3 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}

            {/* KB Articles Section */}
            <div className="space-y-4 mt-6">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`kb-skeleton-${i}`} className="space-y-2 p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-56" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search/Input Section at bottom */}
            <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-gray-950 border-t">
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
