'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Task } from "@/types/tasks"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { SkeletonAvatar, SkeletonText } from "@/components/ui/skeleton-inline"

interface CreatedBySectionProps {
  task: Task
  isNavigating: boolean
}

export function CreatedBySection({ task, isNavigating }: CreatedBySectionProps) {
  const hasValidTriager = task.triager && task.triager.id && (task.triager.first_name || task.triager.last_name)
  const assignee = hasValidTriager 
    ? `${(task.triager.first_name || '').trim()} ${(task.triager.last_name || '').trim()}`.trim() 
    : 'None'
  const initials = getInitials(assignee)
  // Get a consistent color for the assigned agent based on their user ID
  const agentAvatarColor = getAvatarColor(task.triager?.id ?? 0)

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs">{hasValidTriager ? 'Assigned Triager' : 'Triager'}</div>
      <div className="flex items-center gap-2">
        <SkeletonAvatar isLoading={isNavigating}>
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarFallback className={`${agentAvatarColor} text-white text-xs`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </SkeletonAvatar>
        <SkeletonText isLoading={isNavigating} className="w-24 h-4">
          <span className="text-sm">{assignee}</span>
        </SkeletonText>
      </div>
    </div>
  )
}
