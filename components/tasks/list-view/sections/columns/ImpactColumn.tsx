'use client'

import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getImpactIcon, ImpactType, getImpactColor } from "@/lib/taskUtils"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ImpactColumnProps {
  impactName?: string
}

export function ImpactColumn({ impactName }: ImpactColumnProps) {
  const { compactMode } = useSettingsStore()
  // Use a safe fallback and ensure we're using a valid key
  const impact = (impactName?.toLowerCase() || "none") as ImpactType
  const IconComponent = getImpactIcon(impact)
  const textColor = getImpactColor(impact, "text-")
  const bgColor = getImpactColor(impact)
  
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
                  <p className="capitalize">{impactName || 'Single User'}</p>
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
            {(impactName ?? "single user") && (
              <span className={cn("ml-2 text-xs font-medium capitalize", textColor)}>
                {impactName ?? "single user"}
              </span>
            )}
          </>
        )}
      </div>
    </TableCell>
  )
}
