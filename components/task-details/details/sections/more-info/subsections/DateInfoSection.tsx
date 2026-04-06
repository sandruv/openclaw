'use client'

import { Task } from "@/types/tasks"
import { SkeletonText } from "@/components/ui/skeleton-inline"
import { formatDateTime } from "@/lib/dateTimeFormat"

interface DateInfoSectionProps {
  task: Task
  isNavigating: boolean
}

export function DateInfoSection({ task, isNavigating }: DateInfoSectionProps) {
  const createdAtStr = formatDateTime(task.created_at)
  const closedAtStr = task.date_closed ? formatDateTime(task.date_closed) : null

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs">Date Created</div>
      <SkeletonText isLoading={isNavigating} className="w-32 h-4">
        <div className="text-sm">{createdAtStr}</div>
      </SkeletonText>

      {closedAtStr && (
        <div className="mt-4">
          <div className="text-muted-foreground text-xs">Date Closed</div>
          <div className="text-sm">{closedAtStr}</div>
        </div>
      )}
    </div>
  )
}
