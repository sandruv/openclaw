'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function AdditionalInfoLoader() {
  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  )
}
