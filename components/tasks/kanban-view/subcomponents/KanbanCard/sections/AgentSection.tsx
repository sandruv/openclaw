'use client'

import { cn, getAvatarColor, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { UserCircle } from 'lucide-react'
import { User } from '@/types/clients'

interface AgentSectionProps {
  agent: User | null;
}

export function AgentSection({ agent }: AgentSectionProps) {
  if (!agent || !agent.id || (!agent.first_name && !agent.last_name)) {
    return <UserCircle className="h-4 w-4 text-muted-foreground" />
  }

  const fullName = `${agent.first_name || ''} ${agent.last_name || ''}`.trim()
  const agentInitial = getInitials(fullName || 'Unknown')
  const userColor = getAvatarColor(agent.id || 0)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={cn("h-6 w-6")}>
            <AvatarFallback className={cn("text-xs text-white", userColor)}>
              {agentInitial}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className={cn("text-white", userColor)}>
          {fullName || 'Unassigned'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
