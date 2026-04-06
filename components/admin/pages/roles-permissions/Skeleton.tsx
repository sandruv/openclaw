import { Skeleton } from '@/components/ui/skeleton';

export function RolesPermissionsSkeleton() {
  return (
    <div className="h-full flex bg-gray-100 dark:bg-[#1e1e1e]">
      {/* Left Pane */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c] min-w-0">
        {/* Tab Strip Skeleton */}
        <div className="h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-end">
          <Skeleton className="h-9 w-24 border-r border-gray-200 dark:border-[#3c3c3c]" />
          <Skeleton className="h-9 w-32 border-r border-gray-200 dark:border-[#3c3c3c]" />
        </div>

        {/* Table Skeleton */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
            {/* Header Row */}
            <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526]">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 flex-1 ml-3" />
              <Skeleton className="h-4 w-16 ml-3" />
              <Skeleton className="h-4 w-20 ml-3" />
            </div>
            
            {/* Data Rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 flex items-center px-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 flex-1 ml-3" />
                <Skeleton className="h-4 w-16 ml-3" />
                <Skeleton className="h-4 w-20 ml-3" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-[45%] flex-shrink-0 min-w-[300px] flex flex-col">
        {/* Header */}
        <div className="h-[35px] border-b border-gray-200 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] px-3 flex items-center">
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Role info */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Table */}
            <div className="divide-y divide-gray-200 dark:divide-[#3c3c3c]">
              {/* Header Row */}
              <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526]">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-12 ml-2" />
                <Skeleton className="h-4 flex-1 ml-2" />
                <Skeleton className="h-4 w-48 ml-2" />
              </div>
              
              {/* Data Rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-9 flex items-center px-3">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-12 ml-2" />
                  <Skeleton className="h-4 flex-1 ml-2" />
                  <Skeleton className="h-4 w-48 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
