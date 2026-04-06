'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Task } from "@/types/tasks"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { SkeletonAvatar, SkeletonText } from "@/components/ui/skeleton-inline"

interface TicketSourceSectionProps {
  task: Task
  isNavigating: boolean
}

export function TicketSourceSection({ task, isNavigating }: TicketSourceSectionProps) {
  const hasValidTriager = task.triager && task.triager.id && (task.triager.first_name || task.triager.last_name)

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs">Ticket Source</div>
      <div className="flex items-center gap-2">
        <SkeletonText isLoading={isNavigating} className="w-32 h-4">
            <p className="text-sm font-semibold">{task.ticket_source?.name || 'Not set'}</p>
          </SkeletonText>
      </div>
    </div>
  )
}
