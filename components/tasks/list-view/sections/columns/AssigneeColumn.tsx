'use client'

import { TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { UserCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface AssigneeColumnProps {
  agent: {
    id: number
    first_name: string
    last_name: string
  } | null | undefined
}

export function AssigneeColumn({ agent }: AssigneeColumnProps) {
  const { compactMode } = useSettingsStore()
  const hasValidAgent = agent && agent.id && (agent.first_name || agent.last_name)
  const fullName = hasValidAgent 
    ? `${(agent.first_name || '').trim()} ${(agent.last_name || '').trim()}`.trim()
    : 'Unassigned'
  const avatarColorClass = getAvatarColor(agent?.id ?? 0)
  
  // If agent is unassigned, show icon
  if (!hasValidAgent) {
    return (
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center pl-3", !compactMode && "pl-2")}>
                <UserCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top"
              align="start"
            >
              <p className="font-medium">Unassigned</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    )
  }
  
  return (
    <TableCell>
      {compactMode ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center pl-2" data-testid={`assignee-column-${agent?.id}`}>
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarFallback className={`${avatarColorClass} text-white text-xs`}>
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top"
              align="start"
              className={`${avatarColorClass} text-white border border-white/20`}
            >
              <p className="font-medium">{fullName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="flex items-center" data-testid={`assignee-column-${agent?.id}`}>
          <Avatar className="h-9 w-9 border-2 border-background">
            <AvatarFallback className={`${avatarColorClass} text-white text-xs`}>
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col ml-2">
            <span className="text-sm font-medium truncate max-w-[120px]">
              {fullName}
            </span>
          </div>
        </div>
      )}
    </TableCell>
  )
}
