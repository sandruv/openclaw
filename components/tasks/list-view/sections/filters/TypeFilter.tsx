'use client'

import { cn } from "@/lib/utils"
import { TICKET_TYPE_COLORS } from "@/constants/colors"
import { TypeCell } from "../TypeCell"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface TypeOption {
  value: string
  label: string
  color: string
}

interface TypeFilterProps {
  options: TypeOption[]
  selectedValue: string
  onValueChange: (value: string) => void
}

export function TypeFilter({
  options,
  selectedValue,
  onValueChange
}: TypeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Type:</span>
      <TooltipProvider>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onValueChange('all')}
                className={cn(
                  "h-6 w-6 rounded border",
                  selectedValue === 'all' ? "border-gray-800 border-2" : "opacity-60 hover:opacity-100"
                )}
              >
                <span className="sr-only">All Types</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>All Types</p>
            </TooltipContent>
          </Tooltip>

          {options.map((option) => (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onValueChange(option.label)}
                  className={cn(
                    "h-6 w-6 rounded border",
                    option.color,
                    selectedValue.toLowerCase() === option.value ? "border-gray-800 border-2" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <TypeCell 
                    typeName={option.label} 
                    showLabel={false} 
                    size="sm" 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className={cn(option.color, "text-white font-medium border-0")}>
                <p>{option.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}
