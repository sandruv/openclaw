'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function ClientInfoLoader() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
