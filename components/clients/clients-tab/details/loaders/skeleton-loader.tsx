'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ClientLayoutSkeleton() {
  return (
    <div>
      {/* Header Section */}
      <div className="container max-w-full p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="flex justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="flex items-center">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 mx-1" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-full">
        <div className="flex h-full">
          {/* Main Content Panel (70%) */}
          <div className="w-[70%] border-r dark:border-gray-700">
            <Card className="rounded-none border-0 h-[calc(100vh-135px)]">
              <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 py-4 pt-3 px-6">
                <Skeleton className="h-6 w-40" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="border-r dark:border-gray-700 pr-6 space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Panel (30%) */}
          <div className="w-[30%]">
            <Card className="rounded-none border-0 h-full">
              <CardHeader className="border-b dark:border-gray-700">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
