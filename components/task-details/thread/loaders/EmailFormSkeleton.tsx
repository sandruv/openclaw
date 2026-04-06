'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function EmailFormSkeleton() {
  return (
    <div className="relative p-2 bg-background rounded-lg">
      <div className="absolute right-2 top-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <Skeleton className="h-32 w-full" />
        
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="pl-5 col-span-2 flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-2" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-5">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
