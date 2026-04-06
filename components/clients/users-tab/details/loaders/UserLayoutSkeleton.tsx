'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function UserLayoutSkeleton() {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="container max-w-full py-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              {/* Avatar skeleton */}
              <Skeleton className="h-16 w-16 rounded-full" />

              {/* User info skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            {/* Tab navigation skeleton */}
            <nav className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </nav>
          </div>
        </div>
      </div>

      {/* Content Section - Matching UserDetailsTab structure */}
      <div className="space-y-6">
        <Card className="rounded-none shadow-none border-x-0">
          {/* Card Header with title and button */}
          <CardHeader className="flex flex-row items-center border-b border-border py-4">
            <Skeleton className="h-6 w-32 mr-5" />
            <Skeleton className="h-9 w-24" />
          </CardHeader>
          
          {/* Card Content with two-column grid */}
          <CardContent className="grid grid-cols-2 divide-x divide-border pb-0">
            {/* Left Column */}
            <div className="pr-6 space-y-6 py-5">
              {[...Array(4)].map((_, i) => (
                <div key={`left-${i}`} className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
            
            {/* Right Column */}
            <div className="pl-6 space-y-6 py-5">
              {[...Array(3)].map((_, i) => (
                <div key={`right-${i}`} className="grid gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
