'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EditUserFormSkeleton() {
  return (
    <div className="relative min-h-[calc(100vh-170px)]">
      <div className="pb-[80px]">
        {/* Header Section */}
        <div className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Two-column grid matching the form layout */}
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Basic Information */}
          <Card className="rounded-none border-0 shadow-none">
            <CardHeader className="border-b">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Advanced Information */}
          <Card className="rounded-none border-0 shadow-none">
            <CardHeader className="border-b">
              <Skeleton className="h-6 w-44" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Client */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Tech Aptitude */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* VIP Status */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="container py-4 flex justify-end space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>
    </div>
  )
}
