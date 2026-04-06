'use client'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LucideIcon } from 'lucide-react'

interface IconSectionProps {
  icon: LucideIcon;
  color: string;
  tooltip: string;
}

export function IconSection({ icon, color, tooltip }: IconSectionProps) {
  const IconComponent = icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("rounded-sm flex items-center justify-center")}>
            <IconComponent className={cn(color.replace("bg-", "text-"), "h-4 w-4")} />
          </div>
        </TooltipTrigger>
        <TooltipContent className={cn("text-white", color)}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
