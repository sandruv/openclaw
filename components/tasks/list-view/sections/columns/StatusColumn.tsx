'use client'

import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { getStatusColor, StatusType } from "@/lib/taskUtils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StatusColumnProps {
  statusName: string
}

export function StatusColumn({ statusName }: StatusColumnProps) {
  const { compactMode } = useSettingsStore()
  const statusLower = statusName.toLowerCase() as StatusType
  const bgColor = getStatusColor(statusLower)
  
  return (
    <TableCell>
      {compactMode ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center justify-center rounded text-xs font-bold w-12 h-5 border",
                bgColor,
                statusLower === 'closed' && 'bg-gray-500 text-white border-gray-600',
                statusLower === 'archived' && 'bg-gray-200 text-black border-gray-500',
                statusLower !== 'closed' && statusLower !== 'archived' && 'text-white',
              )}></div>
            </TooltipTrigger>
            <TooltipContent className={cn(
              bgColor, 
              "text-white font-medium border-0",
              statusLower === 'closed' && 'bg-gray-500',
              statusLower === 'archived' && 'bg-gray-200',
            )}>
              <div className="flex items-center gap-2">
                <p className="capitalize">{statusName}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className={cn(
          "flex items-center justify-center rounded text-xs font-bold px-2 py-1 border w-[120px]",
          bgColor,
          statusLower === 'closed' && 'bg-gray-500 text-white border-gray-600',
          statusLower === 'archived' && 'bg-gray-200 text-black border-gray-600',
          statusLower !== 'closed' && statusLower !== 'archived' && 'text-white',
        )}>
          {statusName}
        </div>
      )}
    </TableCell>
  )
}
