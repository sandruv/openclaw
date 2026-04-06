'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export function ConvoDetailsSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Contact Details */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 border-b">
          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {/* Name, Phone, Email, Channel */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {/* Location, IP, Browser, OS */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {/* Chat ID, Created */}
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
              {/* Last Updated */}
              <div className="col-span-2">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </div>
        </div>

        {/* Task Section */}
        <div className="p-4 border-t">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
