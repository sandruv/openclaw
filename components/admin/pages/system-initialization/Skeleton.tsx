export function AdminSkeleton() {
  return (
    <div className="h-full flex bg-gray-100 dark:bg-[#1e1e1e] animate-pulse">
      {/* Left Pane Skeleton */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#3c3c3c]">
        {/* Tab Strip Skeleton */}
        <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-end gap-0">
          <div className="h-8 w-28 bg-gray-200 dark:bg-[#3c3c3c]" />
          <div className="h-8 w-32 bg-gray-100 dark:bg-[#2a2d2e]" />
        </div>
        
        {/* Toolbar Skeleton */}
        <div className="flex-shrink-0 h-9 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3 gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
        </div>
        
        {/* List Header Skeleton */}
        <div className="h-8 flex items-center px-3 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c]">
          <div className="w-14 h-3 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
          <div className="flex-1 h-3 bg-gray-200 dark:bg-[#3c3c3c] rounded mx-4" />
          <div className="w-20 h-3 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
        </div>
        
        {/* List Rows Skeleton */}
        <div className="flex-1 divide-y divide-gray-200 dark:divide-[#3c3c3c] bg-white dark:bg-[#1e1e1e]">
          {[60, 75, 50, 80, 45, 70, 55, 65].map((width, i) => (
            <div key={i} className="h-9 flex items-center px-3">
              <div className="w-14 h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded mx-4" style={{ width: `${width}%` }} />
              <div className="w-16 h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane Skeleton - Logger */}
      <div className="w-[45%] flex-shrink-0 min-w-[300px] flex flex-col bg-gray-50 dark:bg-[#1e1e1e]">
        {/* Logger Header */}
        <div className="flex-shrink-0 h-9 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-3">
          <div className="h-4 w-16 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
          <div className="h-4 w-14 bg-gray-200 dark:bg-[#3c3c3c] rounded ml-2" />
        </div>
        
        {/* Logger Content */}
        <div className="flex-1 p-2 space-y-2 bg-white dark:bg-[#1e1e1e]">
          {[70, 85, 60, 90, 55].map((width, i) => (
            <div key={i} className="flex py-1">
              <div className="w-20 h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded mx-1" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-[#3c3c3c] rounded" style={{ width: `${width}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
