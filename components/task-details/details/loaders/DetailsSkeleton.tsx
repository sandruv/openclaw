import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from '@/components/ui/scroll-area'

export function DetailsSkeleton() {
  return (
    <div className="relative">
      <ScrollArea className="h-[calc(100vh-70px)]">
        <div>
          {/* Timer Section */}
          <div className="pt-4 px-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-4">
            <div className="grid w-full grid-cols-3 rounded-none px-3 gap-2 mb-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Tab Content */}
            <div className="p-4 space-y-6">
              {/* Type & Status Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Priority & Impact Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Category & Subcategory Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-48" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Agent Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </div>

              {/* Date Info Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>

              {/* Parent/Child Tickets Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
