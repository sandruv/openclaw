'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function AIUsageSkeleton() {
  return (
    <div className="h-full flex bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Left Pane */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
        {/* Tab strip skeleton */}
        <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] px-2 flex items-center gap-1">
          <Skeleton className="h-[26px] w-20" />
          <Skeleton className="h-[26px] w-24" />
        </div>

        {/* Search + table skeleton */}
        <div className="p-4 space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-[45%] flex-shrink-0 min-w-[300px] flex flex-col">
        <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
