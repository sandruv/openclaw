'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

function MessageSkeleton({ isOutbound = false }: { isOutbound?: boolean }) {
  // Random width between 40% and 80% of container
  const width = Math.floor(Math.random() * 20 + 20)
  // Random height between 40px and 80px
  const height = Math.floor(Math.random() * 50 + 50)

  return (
    <div className={`flex gap-2 w-full ${isOutbound ? 'justify-end' : ''}`}>
      <Skeleton 
        className={`rounded-lg max-w-[80%]`} 
        style={{ 
          width: `${width}%`,
          height: `${height}px`
        }} 
      />
    </div>
  )
}

export function ConvoFormSkeleton() {
  // Generate 3 different heights for message groups
  const messageGroups = [
    { count: 2, gap: 'gap-2' },
    { count: 3, gap: 'gap-3' },
    { count: 1, gap: 'gap-4' }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-200 dark:bg-gray-500 min-h-[calc(100vh-300px)]">
        <div className="space-y-8">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={`space-y-3 my-2`}>
              {Array.from({ length: group.count }).map((_, i) => (
                <MessageSkeleton key={i} isOutbound={Math.random() > 0.5} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Form */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-[120px] rounded-md" />
          <Skeleton className="h-[120px] w-[44px] rounded-md" />
        </div>
      </div>
    </div>
  )
}
