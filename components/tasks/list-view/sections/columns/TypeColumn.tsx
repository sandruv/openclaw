'use client'

import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getTicketTypeIcon, getTicketTypeColor, TicketType } from '@/lib/taskUtils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSettingsStore } from "@/stores/useSettingsStore"

interface TypeColumnProps {
  typeName: string
}

export function TypeColumn({ typeName = 'None'}: TypeColumnProps) {
  const { compactMode } = useSettingsStore()
  const typeKey = typeName.toLowerCase() as TicketType;
  const colorIcon = getTicketTypeColor(typeKey, "text-")
  
  const containerClasses = cn(
    "flex items-center pl-1",
    colorIcon,
    "h-7 text-sm",
    !compactMode && "p-0"
  );

  // Get the icon component
  const IconComponent = getTicketTypeIcon(typeKey);
  
  return (
    <TableCell>
      <div className="flex items-center">
        {compactMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={containerClasses}>
                  <IconComponent className={cn(colorIcon, "h-5 w-5")} />
                </div>
              </TooltipTrigger>
            <TooltipContent className={cn(
              getTicketTypeColor(typeKey), 
              "text-white font-medium border-0"
            )}>
              <div className="flex items-center gap-2">
                <p>{typeName}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        )}

        {!compactMode && (
          <div className={containerClasses}>
            <IconComponent className={cn(colorIcon, "h-5 w-5")} />
            <span className="ml-2 text-sm font-medium truncate max-w-[100px]">
              {typeName}
            </span>
          </div>
        )}
      </div>
    </TableCell>
  )
}
