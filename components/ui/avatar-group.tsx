'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number
}

export function AvatarGroup({
  children,
  className,
  limit,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = limit ? childrenArray.slice(0, limit) : childrenArray
  const remainingCount = limit ? childrenArray.length - limit : 0

  return (
    <div
      className={cn("flex -space-x-2 overflow-hidden", className)}
      {...props}
    >
      {visibleChildren}
      {remainingCount > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
