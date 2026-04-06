'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function TiptapEditorSkeleton() {
  return (
    <div className="relative bg-background rounded-lg border dark:border-gray-700">
      <div className="border-b dark:border-gray-700 p-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-600 mx-2" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-600 mx-2" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
      <div className="p-3">
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
