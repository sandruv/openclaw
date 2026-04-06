'use client'

import { cn } from "@/lib/utils"
import { getTicketTypeIcon, getTicketTypeColor, TicketType } from '@/lib/taskUtils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TypeCellProps {
  typeName: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TypeCell({ typeName, showLabel = true, size = 'md' }: TypeCellProps) {
  const typeKey = typeName.toLowerCase() as TicketType;

  const containerClasses = cn(
    "rounded flex items-center justify-center text-white",
    getTicketTypeColor(typeKey),
    size === 'sm' ? "h-5 px-2 gap-1 text-xs" : 
    size === 'md' ? "h-7 px-3 gap-1 text-sm" : 
    "h-8 px-4 gap-2 text-sm",
    !showLabel && "aspect-square p-0"
  );

  // Get the icon component
  const IconComponent = getTicketTypeIcon(typeKey);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={containerClasses}>
            <IconComponent className={cn('text-white', size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6')} />
            {showLabel && (
              <span className="ml-2 text-sm font-medium truncate max-w-[100px]">
                {typeName}
              </span>
            )}
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
  );
}
