'use client'

import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getPriorityIcon, PriorityType, getPriorityColor } from "@/lib/taskUtils"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriorityColumnProps {
  priorityName: string
}

export function PriorityColumn({ priorityName = 'none' }: PriorityColumnProps) {
  const { compactMode } = useSettingsStore()
  const priorityLower = priorityName.toLowerCase() as PriorityType
  const IconComponent = getPriorityIcon(priorityLower)
  const textColor = getPriorityColor(priorityLower, "text-")
  const bgColor = getPriorityColor(priorityLower)
  
  return (
    <TableCell>
      <div className="flex items-center">
        {compactMode ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center pl-3">
                  <IconComponent className={cn(
                    "h-5 w-5",
                    textColor
                  )} />
                </div>
              </TooltipTrigger>
              <TooltipContent className={cn(
                bgColor, 
                "text-white font-medium border-0"
              )}>
                <div className="flex items-center gap-2">
                  <p className="capitalize">{priorityName}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <IconComponent className={cn(
              "h-5 w-5",
              textColor
            )} />
            <span className={cn("ml-2 text-xs font-medium capitalize", textColor)}>
              {priorityName}
            </span>
          </>
        )}
      </div>
    </TableCell>
  )
}
