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

interface TriagerColumnProps {
  triager: {
    id: number
    first_name: string
    last_name: string
  } | null | undefined
}

export function TriagerColumn({ triager }: TriagerColumnProps) {
  const { compactMode } = useSettingsStore()
  const hasValidTriager = triager && triager.id && (triager.first_name || triager.last_name)
  const fullName = hasValidTriager
    ? `${(triager.first_name || '').trim()} ${(triager.last_name || '').trim()}`.trim()
    : 'None'
  const avatarColorClass = getAvatarColor(triager?.id ?? 0)
  
  // If triager is unassigned, show icon
  if (!hasValidTriager) {
    return (
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center pl-1">
                <UserCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top"
              align="start"
            >
              <p className="font-medium">No Triager</p>
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
              <div className="flex items-center">
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
        <div className="flex items-center">
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
