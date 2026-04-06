'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Task } from "@/types/tasks"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { SkeletonAvatar, SkeletonText } from "@/components/ui/skeleton-inline"

interface AgentSectionProps {
  task: Task
  isNavigating: boolean
}

export function AgentSection({ task, isNavigating }: AgentSectionProps) {
  const agent = task.agent
  const hasValidAgent = agent && agent.id && (agent.first_name || agent.last_name)
  const assignee = hasValidAgent 
    ? `${(agent.first_name || '').trim()} ${(agent.last_name || '').trim()}`.trim()
    : 'Unassigned'
  const initials = getInitials(assignee)
  // Get a consistent color for the assigned agent based on their user ID
  const agentAvatarColor = getAvatarColor(agent?.id ?? 0)

  return (
    <div data-testid="assigned-to" className="space-y-1">
      <div className="text-muted-foreground text-xs">Assigned Agent</div>
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
